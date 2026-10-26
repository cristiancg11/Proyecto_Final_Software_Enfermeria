import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { Rol } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'manos_seguras_default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Esquema de validación para registro
const RegistroSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  codigoEstudiantil: z.string().min(4, 'El código debe tener al menos 4 caracteres'),
  correo: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.nativeEnum(Rol).optional().default(Rol.ESTUDIANTE),
  consentimiento: z.boolean().default(false),
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
  try {
    const data = RegistroSchema.parse(req.body);

    const correoNormalizado = data.correo.trim().toLowerCase();
    const codigoNormalizado = data.codigoEstudiantil.trim();

    // Validar si ya existe un usuario con ese correo o código estudiantil
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo: correoNormalizado }, { codigoEstudiantil: codigoNormalizado }],
      },
    });

    if (usuarioExistente) {
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

    // Guardar el nuevo usuario en PostgreSQL
    const nuevoUsuario = await prisma.usuario.create({
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
    });

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
    };

    res.status(201).json({
      mensaje: 'Registro exitoso en la plataforma Manos Seguras',
      user: userPayload,
      usuario: nuevoUsuario,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Datos de registro inválidos',
        detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
      });
      return;
    }
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
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

    // Buscar por correo o por código estudiantil
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: credencial.toLowerCase() },
          { codigoEstudiantil: credencial },
        ],
      },
    });

    if (!usuario) {
      res.status(401).json({
        error: 'Credenciales inválidas. Verifica tu correo/código y contraseña.',
      });
      return;
    }

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(data.password, usuario.password);
    if (!passwordValida) {
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
    };

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

    const usuario = await prisma.usuario.findUnique({
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
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ usuario });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({ error: 'Error al consultar el perfil de usuario.' });
  }
};
