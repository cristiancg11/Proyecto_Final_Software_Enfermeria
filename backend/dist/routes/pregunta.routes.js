"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preguntaRouter = void 0;
const express_1 = require("express");
const pregunta_controller_1 = require("../controllers/pregunta.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.preguntaRouter = (0, express_1.Router)();
// Crear una pregunta con opciones (Solo Docentes)
exports.preguntaRouter.post('/', auth_middleware_1.autenticarToken, auth_middleware_1.requerirDocente, pregunta_controller_1.crearPregunta);
// Obtener preguntas clínicas para estudiantes (Sin revelar esCorrecta)
exports.preguntaRouter.get('/estudiante', auth_middleware_1.autenticarToken, pregunta_controller_1.obtenerPreguntasEstudiante);
// Alias raíz para facilitar la integración general del test
exports.preguntaRouter.get('/', auth_middleware_1.autenticarToken, pregunta_controller_1.obtenerPreguntasEstudiante);
// Obtener todas las preguntas con respuestas correctas y estadísticas (Solo Docentes)
exports.preguntaRouter.get('/docente', auth_middleware_1.autenticarToken, auth_middleware_1.requerirDocente, pregunta_controller_1.obtenerPreguntasDocente);
// Eliminar o desactivar pregunta (Solo Docentes)
exports.preguntaRouter.delete('/:id', auth_middleware_1.autenticarToken, auth_middleware_1.requerirDocente, pregunta_controller_1.eliminarPregunta);
// Registrar intento y calificación de test diagnóstico (PRE o POST)
exports.preguntaRouter.post('/diagnostico', auth_middleware_1.autenticarToken, pregunta_controller_1.registrarDiagnostico);
