"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.practicasRouter = void 0;
const express_1 = require("express");
const practica_controller_1 = require("../controllers/practica.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.practicasRouter = (0, express_1.Router)();
// Endpoint exclusivo para supervisión docente de todas las prácticas de estudiantes
exports.practicasRouter.get('/docente', auth_middleware_1.autenticarToken, auth_middleware_1.requerirDocente, practica_controller_1.obtenerPracticasDocente);
// Registrar práctica realizada por un estudiante (autenticado opcionalmente)
exports.practicasRouter.post('/', auth_middleware_1.autenticarTokenOpcional, practica_controller_1.registrarPractica);
// Obtener historial de prácticas por usuario
exports.practicasRouter.get('/usuario/:usuarioId', auth_middleware_1.autenticarToken, practica_controller_1.obtenerHistorialUsuario);
// Verificación pública de certificados mediante código QR o verificación manual
exports.practicasRouter.get('/certificado/:codigo', practica_controller_1.verificarCertificado);
exports.practicasRouter.get('/certificados/validar/:codigo', practica_controller_1.verificarCertificado);
exports.practicasRouter.get('/validar/:codigo', practica_controller_1.verificarCertificado);
