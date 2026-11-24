import { Router } from 'express';
import {
  obtenerRankingProgresoIA,
  obtenerRankingRetoExtremo,
  registrarIntentoRetoExtremo,
  obtenerPreguntasRetoExtremo,
} from '../controllers/ia.controller';

export const iaRouter = Router();

// GET /api/ia/ranking-progreso
iaRouter.get('/ranking-progreso', obtenerRankingProgresoIA);

// GET y POST para el Modo "Trivia Reto Extremo" con ranking competitivo en tiempo real
iaRouter.get('/reto-extremo/ranking', obtenerRankingRetoExtremo);
iaRouter.post('/reto-extremo/registrar', registrarIntentoRetoExtremo);
iaRouter.get('/reto-extremo/preguntas', obtenerPreguntasRetoExtremo);
