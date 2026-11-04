"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarPerfil = exports.obtenerPerfil = exports.loginUsuario = exports.registrarUsuario = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const JWT_SECRET = process.env.JWT_SECRET || 'manos_seguras_default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// Esquema de validación para registro (con normalización tolerante para evitar rechazos inesperados)
const RegistroSchema = zod_1.z.object({
    nombre: zod_1.z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    codigoEstudiantil: zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined), zod_1.z.string().min(2, 'El código debe tener al menos 2 caracteres').optional()),
    correo: zod_1.z.string().trim().toLowerCase().email('Correo electrónico no válido'),
    password: zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim().length > 0 ? val : 'Estudiante2026*'), zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')),
    rol: zod_1.z.preprocess((val) => (typeof val === 'string' ? val.trim().toUpperCase() : undefined), zod_1.z.nativeEnum(client_1.Rol).optional().default(client_1.Rol.ESTUDIANTE)),
    consentimiento: zod_1.z.coerce.boolean().default(true),
});
// Esquema de validación para login (permite correo o código estudiantil)
const LoginSchema = zod_1.z.object({
    correo: zod_1.z.string().optional(),
    codigoEstudiantil: zod_1.z.string().optional(),
    identificador: zod_1.z.string().optional(), // Puede ser correo o código
    password: zod_1.z.string().min(1, 'Contraseña requerida'),
}).refine((data) => data.correo || data.codigoEstudiantil || data.identificador, {
    message: 'Debes proporcionar tu correo institucional o tu código estudiantil',
});
/**
 * Controlador de Registro de Usuario (Estudiante o Docente)
 * POST /api/auth/registro
 */
const registrarUsuario = async (req, res) => {
    console.log('==============================================================');
    console.log('📥 [REGISTRO INICIADO] Petición recibida en POST /api/auth/registro');
    console.log('📋 Datos recibidos:', {
        nombre: req.body?.nombre,
        codigoEstudiantil: req.body?.codigoEstudiantil,
        correo: req.body?.correo,
        rol: req.body?.rol || 'ESTUDIANTE',
        consentimiento: req.body?.consentimiento,
        passwordLength: typeof req.body?.password === 'string' ? req.body.password.length : 0,
    });
    try {
        const data = RegistroSchema.parse(req.body);
        const correoNormalizado = data.correo.trim().toLowerCase();
        const codigoNormalizado = data.codigoEstudiantil?.trim() ||
            (data.rol === client_1.Rol.DOCENTE
                ? `DOC-${Math.floor(1000 + Math.random() * 9000)}`
                : `EST-${Math.floor(1000 + Math.random() * 9000)}`);
        // Validar si ya existe un usuario con ese correo o código estudiantil (con reconexión automática a Supabase)
        const usuarioExistente = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.findFirst({
            where: {
                OR: [{ correo: correoNormalizado }, { codigoEstudiantil: codigoNormalizado }],
            },
        }));
        if (usuarioExistente) {
            console.warn('⚠️ [REGISTRO RECHAZADO - 409 CONFLICTO EN SUPABASE]:', {
                motivo: usuarioExistente.correo === correoNormalizado
                    ? 'Correo electrónico ya existe en tabla Usuario'
                    : 'Código estudiantil ya existe en tabla Usuario',
                usuarioEnBaseDeDatos: {
                    id: usuarioExistente.id,
                    nombre: usuarioExistente.nombre,
                    codigoEstudiantil: usuarioExistente.codigoEstudiantil,
                    correo: usuarioExistente.correo,
                },
            });
            if (usuarioExistente.correo === correoNormalizado) {
                res.status(409).json({ error: 'Ya existe un usuario registrado con este correo electrónico.' });
                return;
            }
            res.status(409).json({ error: 'Ya existe un usuario registrado con este código estudiantil.' });
            return;
        }
        // Hashear la contraseña con bcryptjs (10 rondas de salt)
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHashed = await bcryptjs_1.default.hash(data.password, salt);
        // Guardar el nuevo usuario en PostgreSQL / Supabase con reconexión automática
        console.log('⏳ [SUPABASE] Ejecutando prisma.usuario.create() en tabla "Usuario"...');
        const nuevoUsuario = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.create({
            data: {
                nombre: data.nombre.trim(),
                codigoEstudiantil: codigoNormalizado,
                correo: correoNormalizado,
                password: passwordHashed,
                rol: data.rol,
                consentimiento: data.consentimiento,
            },
            select: {
                id: true,
                nombre: true,
                codigoEstudiantil: true,
                correo: true,
                rol: true,
                consentimiento: true,
                fechaRegistro: true,
            },
        }));
        // Verificar persistencia real en Supabase consultando el registro recién insertado
        const verificacionSupabase = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.findUnique({
            where: { id: nuevoUsuario.id },
            select: { id: true, correo: true, codigoEstudiantil: true },
        }));
        if (!verificacionSupabase) {
            throw new Error(`Fallo de persistencia en Supabase: el usuario ${nuevoUsuario.correo} (${nuevoUsuario.id}) no se encontró en la tabla "Usuario" tras prisma.usuario.create().`);
        }
        const totalUsuariosEnSupabase = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.count());
        // Generar el token JWT
        const token = jsonwebtoken_1.default.sign({
            id: nuevoUsuario.id,
            rol: nuevoUsuario.rol,
            correo: nuevoUsuario.correo,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const userPayload = {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            rol: nuevoUsuario.rol,
            codigoEstudiantil: nuevoUsuario.codigoEstudiantil,
            consentimiento: nuevoUsuario.consentimiento,
        };
        console.log(`✅ [SUPABASE INSERT VERIFICADO - TABLA "Usuario" | Total usuarios en BD: ${totalUsuariosEnSupabase}]:`, {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            codigoEstudiantil: nuevoUsuario.codigoEstudiantil,
            correo: nuevoUsuario.correo,
            rol: nuevoUsuario.rol,
            fechaRegistro: nuevoUsuario.fechaRegistro,
        });
        console.log('==============================================================');
        res.status(201).json({
            mensaje: 'Registro exitoso en la plataforma Manos Seguras',
            user: userPayload,
            usuario: nuevoUsuario,
            token,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ [REGISTRO RECHAZADO - 400 VALIDACIÓN ZOD]:', JSON.stringify(error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })), null, 2));
            console.log('==============================================================');
            res.status(400).json({
                error: 'Datos de registro inválidos',
                detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
            });
            return;
        }
        console.error('🔥 [ERROR CRÍTICO EN registrarUsuario - PRISMA / SUPABASE]:', {
            nombreError: error?.name,
            codigoPrisma: error?.code,
            metaPrisma: error?.meta,
            clientVersion: error?.clientVersion,
            mensaje: error?.message,
            stack: error?.stack,
        });
        console.log('==============================================================');
        if (error?.code === 'P2002') {
            res.status(409).json({
                error: 'El correo electrónico o código estudiantil ya se encuentra registrado en Supabase.',
                camposEnConflicto: error?.meta?.target,
            });
            return;
        }
        if ((0, prisma_1.esErrorConexionTransitorio)(error)) {
            res.status(503).json({
                error: 'Reconectando con la base de datos de Supabase. Por favor intenta de nuevo en unos segundos.',
            });
            return;
        }
        res.status(500).json({
            error: 'Error interno del servidor al procesar el registro en Supabase.',
            detalleTecnico: error?.message || 'Error desconocido',
        });
    }
};
exports.registrarUsuario = registrarUsuario;
/**
 * Controlador de Inicio de Sesión
 * POST /api/auth/login
 */
const loginUsuario = async (req, res) => {
    try {
        const data = LoginSchema.parse(req.body);
        const credencial = (data.correo || data.codigoEstudiantil || data.identificador || '').trim();
        console.log(`🔍 [LOGIN INICIADO] Buscando usuario en Supabase ("Usuario") con credencial: "${credencial}"`);
        // Buscar por correo o por código estudiantil con reconexión automática a Supabase
        const usuario = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.findFirst({
            where: {
                OR: [
                    { correo: credencial.toLowerCase() },
                    { codigoEstudiantil: credencial },
                ],
            },
        }));
        if (!usuario) {
            console.warn(`⚠️ [LOGIN RECHAZADO - 401] El usuario "${credencial}" NO existe en la tabla "Usuario" de Supabase.`);
            res.status(401).json({
                error: 'Credenciales inválidas. Verifica tu correo/código y contraseña.',
            });
            return;
        }
        // Verificar contraseña con bcrypt
        const passwordValida = await bcryptjs_1.default.compare(data.password, usuario.password);
        if (!passwordValida) {
            console.warn(`⚠️ [LOGIN RECHAZADO - 401] Contraseña incorrecta para usuario "${usuario.correo}" (ID: ${usuario.id}).`);
            res.status(401).json({
                error: 'Credenciales inválidas. Verifica tu correo/código y contraseña.',
            });
            return;
        }
        // Generar token JWT con id, rol y correo
        const token = jsonwebtoken_1.default.sign({
            id: usuario.id,
            rol: usuario.rol,
            correo: usuario.correo,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const userPayload = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            codigoEstudiantil: usuario.codigoEstudiantil,
            consentimiento: usuario.consentimiento,
        };
        console.log(`[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`);
        res.json({
            mensaje: 'Autenticación exitosa',
            user: userPayload,
            usuario: {
                ...userPayload,
                consentimiento: usuario.consentimiento,
                fechaRegistro: usuario.fechaRegistro,
            },
            token,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Datos de inicio de sesión inválidos',
                detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
            });
            return;
        }
        console.error('Error en loginUsuario:', error);
        if ((0, prisma_1.esErrorConexionTransitorio)(error)) {
            res.status(503).json({
                error: 'Reconectando con la base de datos de Supabase. Por favor intenta de nuevo en unos segundos.',
            });
            return;
        }
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};
exports.loginUsuario = loginUsuario;
/**
 * Controlador para consultar el perfil del usuario autenticado
 * GET /api/auth/me
 */
const obtenerPerfil = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        const usuario = await (0, prisma_1.ejecutarConReconexion)((db) => db.usuario.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                nombre: true,
                codigoEstudiantil: true,
                correo: true,
                rol: true,
                consentimiento: true,
                fechaRegistro: true,
            },
        }));
        if (!usuario) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        console.log(`[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`);
        res.json({ usuario });
    }
    catch (error) {
        console.error('Error en obtenerPerfil:', error);
        res.status(500).json({ error: 'Error al consultar el perfil de usuario.' });
    }
};
exports.obtenerPerfil = obtenerPerfil;
const ActualizarPerfilSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    correo: zod_1.z.string().email('Correo electrónico no válido').optional(),
    passwordActual: zod_1.z.string().optional(),
    passwordNuevo: zod_1.z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').optional(),
});
/**
 * Controlador para actualizar datos de perfil y cambio de contraseña
 * PUT /api/auth/perfil
 */
const actualizarPerfil = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        const data = ActualizarPerfilSchema.parse(req.body);
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { id: req.user.id },
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        const updateData = {};
        if (data.nombre && data.nombre.trim() !== '') {
            updateData.nombre = data.nombre.trim();
        }
        if (data.correo && data.correo.trim() !== '') {
            const correoNormalizado = data.correo.trim().toLowerCase();
            if (correoNormalizado !== usuario.correo) {
                // Verificar si el nuevo correo ya está en uso por otro usuario
                const existe = await prisma_1.prisma.usuario.findFirst({
                    where: {
                        correo: correoNormalizado,
                        NOT: { id: req.user.id },
                    },
                });
                if (existe) {
                    res.status(409).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
                    return;
                }
                updateData.correo = correoNormalizado;
            }
        }
        // Si envía cambio de contraseña
        if (data.passwordNuevo) {
            if (!data.passwordActual) {
                res.status(400).json({ error: 'Debes proporcionar tu contraseña actual para cambiarla.' });
                return;
            }
            // 1. Validar que passwordActual coincida con el hash de la base de datos
            const passwordValida = await bcryptjs_1.default.compare(data.passwordActual, usuario.password);
            if (!passwordValida) {
                res.status(400).json({ error: 'La contraseña actual es incorrecta' });
                return;
            }
            // 2. Hashear la nueva contraseña y actualizar
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(data.passwordNuevo, salt);
        }
        // Actualizar registro en Usuario
        const usuarioActualizado = await prisma_1.prisma.usuario.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                nombre: true,
                codigoEstudiantil: true,
                correo: true,
                rol: true,
                consentimiento: true,
                fechaRegistro: true,
            },
        });
        const userPayload = {
            id: usuarioActualizado.id,
            nombre: usuarioActualizado.nombre,
            correo: usuarioActualizado.correo,
            rol: usuarioActualizado.rol,
            codigoEstudiantil: usuarioActualizado.codigoEstudiantil,
        };
        console.log(`[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`);
        res.json({
            mensaje: data.passwordNuevo
                ? 'Contraseña actualizada correctamente'
                : 'Datos de perfil actualizados exitosamente',
            user: userPayload,
            usuario: usuarioActualizado,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Datos de actualización inválidos',
                detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
            });
            return;
        }
        console.error('Error en actualizarPerfil:', error);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};
exports.actualizarPerfil = actualizarPerfil;
