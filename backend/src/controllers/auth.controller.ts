import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma, ejecutarConReconexion, esErrorConexionTransitorio } from '../lib/prisma';
import { Rol } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'manos_seguras_default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Esquema de validación para registro (con normalización tolerante para evitar rechazos inesperados)
const RegistroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  codigoEstudiantil: z.preprocess(
    (val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined),
    z.string().min(2, 'El código debe tener al menos 2 caracteres').optional()
  ),
  correo: z.string().trim().toLowerCase().email('Correo electrónico no válido'),
  password: z.preprocess(
    (val) => (typeof val === 'string' && val.trim().length > 0 ? val : 'Estudiante2026*'),
    z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  ),
  rol: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toUpperCase() : undefined),
    z.nativeEnum(Rol).optional().default(Rol.ESTUDIANTE)
  ),
  consentimiento: z.coerce.boolean().default(true),
});

// Esquema de validación para login (permite correo o código estudiantil)
const LoginSchema = z.object({
  correo: z.string().optional(),
  codigoEstudiantil: z.string().optional(),
  identificador: z.string().optional(), // Puede ser correo o código
  password: z.string().min(1, 'Contraseña requerida'),
}).refine((data) => data.correo || data.codigoEstudiantil || data.identificador, {
  message: 'Debes proporcionar tu correo institucional o tu código estudiantil',
});

/**
 * Controlador de Registro de Usuario (Estudiante o Docente)
 * POST /api/auth/registro
 */
export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
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
    const codigoNormalizado =
      data.codigoEstudiantil?.trim() ||
      (data.rol === Rol.DOCENTE
        ? `DOC-${Math.floor(1000 + Math.random() * 9000)}`
        : `EST-${Math.floor(1000 + Math.random() * 9000)}`);

    // Validar si ya existe un usuario con ese correo o código estudiantil (con reconexión automática a Supabase)
    const usuarioExistente = await ejecutarConReconexion(() =>
      prisma.usuario.findFirst({
        where: {
          OR: [{ correo: correoNormalizado }, { codigoEstudiantil: codigoNormalizado }],
        },
      })
    );

    if (usuarioExistente) {
      console.warn('⚠️ [REGISTRO RECHAZADO - 409 CONFLICTO EN SUPABASE]:', {
        motivo:
          usuarioExistente.correo === correoNormalizado
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
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(data.password, salt);

    // Guardar el nuevo usuario en PostgreSQL / Supabase con reconexión automática
    console.log('⏳ [SUPABASE] Ejecutando prisma.usuario.create() en tabla "Usuario"...');
    const nuevoUsuario = await ejecutarConReconexion(() =>
      prisma.usuario.create({
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
      })
    );

    // Verificar persistencia real en Supabase consultando el registro recién insertado
    const verificacionSupabase = await ejecutarConReconexion(() =>
      prisma.usuario.findUnique({
        where: { id: nuevoUsuario.id },
        select: { id: true, correo: true, codigoEstudiantil: true },
      })
    );

    if (!verificacionSupabase) {
      throw new Error(
        `Fallo de persistencia en Supabase: el usuario ${nuevoUsuario.correo} (${nuevoUsuario.id}) no se encontró en la tabla "Usuario" tras prisma.usuario.create().`
      );
    }

    const totalUsuariosEnSupabase = await ejecutarConReconexion(() => prisma.usuario.count());

    // Generar el token JWT
    const token = jwt.sign(
      {
        id: nuevoUsuario.id,
        rol: nuevoUsuario.rol,
        correo: nuevoUsuario.correo,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const userPayload = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      codigoEstudiantil: nuevoUsuario.codigoEstudiantil,
      consentimiento: nuevoUsuario.consentimiento,
    };

    console.log(
      `✅ [SUPABASE INSERT VERIFICADO - TABLA "Usuario" | Total usuarios en BD: ${totalUsuariosEnSupabase}]:`,
      {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        codigoEstudiantil: nuevoUsuario.codigoEstudiantil,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        fechaRegistro: nuevoUsuario.fechaRegistro,
      }
    );
    console.log('==============================================================');

    res.status(201).json({
      mensaje: 'Registro exitoso en la plataforma Manos Seguras',
      user: userPayload,
      usuario: nuevoUsuario,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error(
        '❌ [REGISTRO RECHAZADO - 400 VALIDACIÓN ZOD]:',
        JSON.stringify(
          error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
          null,
          2
        )
      );
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

    if (esErrorConexionTransitorio(error)) {
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

/**
 * Controlador de Inicio de Sesión
 * POST /api/auth/login
 */
export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = LoginSchema.parse(req.body);
    const credencial = (data.correo || data.codigoEstudiantil || data.identificador || '').trim();

    console.log(`🔍 [LOGIN INICIADO] Buscando usuario en Supabase ("Usuario") con credencial: "${credencial}"`);

    // Buscar por correo o por código estudiantil con reconexión automática a Supabase
    const usuario = await ejecutarConReconexion(() =>
      prisma.usuario.findFirst({
        where: {
          OR: [
            { correo: credencial.toLowerCase() },
            { codigoEstudiantil: credencial },
          ],
        },
      })
    );

    if (!usuario) {
      console.warn(`⚠️ [LOGIN RECHAZADO - 401] El usuario "${credencial}" NO existe en la tabla "Usuario" de Supabase.`);
      res.status(401).json({
        error: 'Credenciales inválidas. Verifica tu correo/código y contraseña.',
      });
      return;
    }

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(data.password, usuario.password);
    if (!passwordValida) {
      console.warn(`⚠️ [LOGIN RECHAZADO - 401] Contraseña incorrecta para usuario "${usuario.correo}" (ID: ${usuario.id}).`);
      res.status(401).json({
        error: 'Credenciales inválidas. Verifica tu correo/código y contraseña.',
      });
      return;
    }

    // Generar token JWT con id, rol y correo
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        correo: usuario.correo,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const userPayload = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      codigoEstudiantil: usuario.codigoEstudiantil,
      consentimiento: usuario.consentimiento,
    };

    console.log(
      `[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`
    );

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Datos de inicio de sesión inválidos',
        detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
      });
      return;
    }
    console.error('Error en loginUsuario:', error);
    if (esErrorConexionTransitorio(error)) {
      res.status(503).json({
        error: 'Reconectando con la base de datos de Supabase. Por favor intenta de nuevo en unos segundos.',
      });
      return;
    }
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};

/**
 * Controlador para consultar el perfil del usuario autenticado
 * GET /api/auth/me
 */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const usuario = await ejecutarConReconexion(() =>
      prisma.usuario.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          nombre: true,
          codigoEstudiantil: true,
          correo: true,
          rol: true,
          consentimiento: true,
          fechaRegistro: true,
        },
      })
    );

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    console.log(
      `[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`
    );

    res.json({ usuario });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({ error: 'Error al consultar el perfil de usuario.' });
  }
};

const ActualizarPerfilSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  correo: z.string().email('Correo electrónico no válido').optional(),
  passwordActual: z.string().optional(),
  passwordNuevo: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').optional(),
});

/**
 * Controlador para actualizar datos de perfil y cambio de contraseña
 * PUT /api/auth/perfil
 */
export const actualizarPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const data = ActualizarPerfilSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const updateData: { nombre?: string; correo?: string; password?: string } = {};

    if (data.nombre && data.nombre.trim() !== '') {
      updateData.nombre = data.nombre.trim();
    }

    if (data.correo && data.correo.trim() !== '') {
      const correoNormalizado = data.correo.trim().toLowerCase();
      if (correoNormalizado !== usuario.correo) {
        // Verificar si el nuevo correo ya está en uso por otro usuario
        const existe = await prisma.usuario.findFirst({
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
      const passwordValida = await bcrypt.compare(data.passwordActual, usuario.password);
      if (!passwordValida) {
        res.status(400).json({ error: 'La contraseña actual es incorrecta' });
        return;
      }

      // 2. Hashear la nueva contraseña y actualizar
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(data.passwordNuevo, salt);
    }

    // Actualizar registro en Usuario
    const usuarioActualizado = await prisma.usuario.update({
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

    console.log(
      `[Supabase DB] 🔑 Login exitoso desde tabla "Usuario": ${usuario.nombre} (${usuario.correo}) | Rol: ${usuario.rol}`
    );

    res.json({
      mensaje: data.passwordNuevo
        ? 'Contraseña actualizada correctamente'
        : 'Datos de perfil actualizados exitosamente',
      user: userPayload,
      usuario: usuarioActualizado,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

