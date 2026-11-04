"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encuestaRouter = void 0;
const express_1 = require("express");
const encuesta_controller_1 = require("../controllers/encuesta.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.encuestaRouter = (0, express_1.Router)();
// Endpoint para registrar respuestas de la encuesta de usabilidad
exports.encuestaRouter.post('/', auth_middleware_1.autenticarTokenOpcional, encuesta_controller_1.registrarEncuesta);
// Endpoint protegido para que el docente consulte métricas de satisfacción
exports.encuestaRouter.get('/docente', auth_middleware_1.autenticarToken, auth_middleware_1.requerirDocente, encuesta_controller_1.obtenerEncuestasDocente);
