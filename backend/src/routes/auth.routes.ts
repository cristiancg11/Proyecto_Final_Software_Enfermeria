import { Router } from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
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

// Actualización de perfil y cambio de contraseña
authRouter.put('/perfil', autenticarToken, actualizarPerfil);

