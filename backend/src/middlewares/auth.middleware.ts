import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, ejecutarConReconexion, esErrorConexionTransitorio } from '../lib/prisma';

export interface JwtUserPayload {
  id: string;
  rol: 'ESTUDIANTE' | 'DOCENTE';
  correo: string;
}

// Extensión del tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

const obtenerJwtSecret = (): string =>
  process.env.JWT_SECRET || 'manos_seguras_default_secret_key';

/**
 * Middleware para verificar o despertar la conexión con Supabase si estuvo en pausa
 */
export const asegurarConexionBD = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await ejecutarConReconexion(() => prisma.$queryRaw`SELECT 1`, 2);
    next();
  } catch (error) {
    console.error('[Middleware BD] Error al reconectar con Supabase:', error);
    res.status(503).json({
      error:
        'La base de datos de Supabase se está reactivando tras estar en pausa. Por favor intenta nuevamente en unos segundos.',
    });
  }
};

/**
 * Middleware para autenticar y validar el token JWT proveniente del encabezado Authorization
 */
export const autenticarToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Token de autorización requerido. Formato: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, obtenerJwtSecret()) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'El token de sesión ha expirado. Inicia sesión nuevamente.' });
      return;
    }
    if (esErrorConexionTransitorio(error)) {
      res.status(503).json({
        error: 'Reconectando con la base de datos de Supabase. Intenta de nuevo en unos segundos.',
      });
      return;
    }
    res.status(401).json({ error: 'Token de autenticación no válido.' });
  }
};

/**
 * Middleware para restringir acceso exclusivamente al personal con rol DOCENTE (RBAC)
 */
export const requerirDocente = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  if (req.user.rol !== 'DOCENTE') {
    res.status(403).json({
      error: 'Acceso restringido a personal docente',
    });
    return;
  }

  next();
};

/**
 * Middleware opcional para verificar token si está presente, sin bloquear si no lo está
 */
export const autenticarTokenOpcional = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, obtenerJwtSecret()) as JwtUserPayload;
      req.user = decoded;
    } catch {
      // Token ausente, expirado o inválido; continuar sin req.user
    }
  }

  next();
};
