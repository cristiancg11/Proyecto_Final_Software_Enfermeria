import { Router } from 'express';
import {
  registrarEncuesta,
  obtenerEncuestasDocente,
} from '../controllers/encuesta.controller';
import {
  autenticarToken,
  requerirDocente,
  autenticarTokenOpcional,
} from '../middlewares/auth.middleware';

export const encuestaRouter = Router();

// Endpoint para registrar respuestas de la encuesta de usabilidad
encuestaRouter.post('/', autenticarTokenOpcional, registrarEncuesta);

// Endpoint protegido para que el docente consulte métricas de satisfacción
encuestaRouter.get('/docente', autenticarToken, requerirDocente, obtenerEncuestasDocente);
