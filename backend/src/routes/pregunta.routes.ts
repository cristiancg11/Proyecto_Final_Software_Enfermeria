import { Router } from 'express';
import {
  crearPregunta,
  obtenerPreguntasEstudiante,
  obtenerPreguntasDocente,
  eliminarPregunta,
  registrarDiagnostico,
} from '../controllers/pregunta.controller';
import {
  autenticarToken,
  requerirDocente,
} from '../middlewares/auth.middleware';

export const preguntaRouter = Router();

// Crear una pregunta con opciones (Solo Docentes)
preguntaRouter.post('/', autenticarToken, requerirDocente, crearPregunta);

// Obtener preguntas clínicas para estudiantes (Sin revelar esCorrecta)
preguntaRouter.get('/estudiante', autenticarToken, obtenerPreguntasEstudiante);
// Alias raíz para facilitar la integración general del test
preguntaRouter.get('/', autenticarToken, obtenerPreguntasEstudiante);

// Obtener todas las preguntas con respuestas correctas y estadísticas (Solo Docentes)
preguntaRouter.get('/docente', autenticarToken, requerirDocente, obtenerPreguntasDocente);

// Eliminar o desactivar pregunta (Solo Docentes)
preguntaRouter.delete('/:id', autenticarToken, requerirDocente, eliminarPregunta);

// Registrar intento y calificación de test diagnóstico (PRE o POST)
preguntaRouter.post('/diagnostico', autenticarToken, registrarDiagnostico);
