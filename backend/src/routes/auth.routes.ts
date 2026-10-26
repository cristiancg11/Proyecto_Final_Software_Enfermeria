import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'manos_seguras_default_secret_key';

// Esquema de validación para registro
const RegisterSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  codigoEstudiantil: z.string().min(4, 'Código estudiantil requerido'),
  correo: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['ESTUDIANTE', 'DOCENTE']).optional().default('ESTUDIANTE'),
  consentimiento: z.boolean().optional().default(false),
});

// Esquema de validación para login
const LoginSchema = z.object({
  correo: z.string().email('Correo electrónico no válido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

/**
 * POST /api/auth/register
 * Registra un nuevo estudiante o docente
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo: data.correo }, { codigoEstudiantil: data.codigoEstudiantil }],
      },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Ya existe un usuario registrado con este correo o código estudiantil.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        codigoEstudiantil: data.codigoEstudiantil,
        correo: data.correo.toLowerCase(),
        password: hashedPassword,
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

    const token = jwt.sign(
      { id: nuevoUsuario.id, rol: nuevoUsuario.rol, correo: nuevoUsuario.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos no válidos', detalles: err.errors });
      return;
    }
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
  }
});

/**
 * POST /api/auth/login
 * Inicia sesión y genera token JWT
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, password } = LoginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { correo: correo.toLowerCase() },
    });

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
      return;
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, correo: usuario.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        codigoEstudiantil: usuario.codigoEstudiantil,
        correo: usuario.correo,
        rol: usuario.rol,
        consentimiento: usuario.consentimiento,
      },
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos no válidos', detalles: err.errors });
      return;
    }
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
  }
});

/**
 * GET /api/auth/me
 * Obtiene el perfil del usuario autenticado
 */
authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autorización requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; rol: string; correo: string };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
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
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});
