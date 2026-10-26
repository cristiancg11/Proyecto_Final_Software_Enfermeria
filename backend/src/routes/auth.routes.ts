import { Router } from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
} from '../controllers/auth.controller';
import { autenticarToken } from '../middlewares/auth.middleware';

export const authRouter = Router();

// Registro de usuarios (estudiantes o docentes)
authRouter.post('/registro', registrarUsuario);
authRouter.post('/register', registrarUsuario); // Alias compatible

// Inicio de sesión
authRouter.post('/login', loginUsuario);

// Perfil del usuario autenticado
authRouter.get('/me', autenticarToken, obtenerPerfil);
