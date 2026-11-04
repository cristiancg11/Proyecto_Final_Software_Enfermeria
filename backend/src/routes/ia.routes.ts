import { Router } from 'express';
import { obtenerRankingProgresoIA } from '../controllers/ia.controller';

export const iaRouter = Router();

// GET /api/ia/ranking-progreso
iaRouter.get('/ranking-progreso', obtenerRankingProgresoIA);

