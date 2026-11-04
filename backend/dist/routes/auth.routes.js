"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.authRouter = (0, express_1.Router)();
// Registro de usuarios (estudiantes o docentes)
exports.authRouter.post('/registro', auth_controller_1.registrarUsuario);
exports.authRouter.post('/register', auth_controller_1.registrarUsuario); // Alias compatible
// Inicio de sesión
exports.authRouter.post('/login', auth_controller_1.loginUsuario);
// Perfil del usuario autenticado
exports.authRouter.get('/me', auth_middleware_1.autenticarToken, auth_controller_1.obtenerPerfil);
// Actualización de perfil y cambio de contraseña
exports.authRouter.put('/perfil', auth_middleware_1.autenticarToken, auth_controller_1.actualizarPerfil);
