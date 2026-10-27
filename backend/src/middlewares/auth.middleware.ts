import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'manos_seguras_default_secret_key';

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
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'El token de sesión ha expirado.' });
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
      const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
      req.user = decoded;
    } catch {
      // Token ausente, expirado o inválido; continuar sin req.user
    }
  }

  next();
};
