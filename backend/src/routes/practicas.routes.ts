import { Router } from 'express';
import {
  obtenerPracticasDocente,
  registrarPractica,
  obtenerHistorialUsuario,
  verificarCertificado,
} from '../controllers/practica.controller';
import { autenticarToken, requerirDocente } from '../middlewares/auth.middleware';

export const practicasRouter = Router();

// Endpoint exclusivo para supervisión docente de todas las prácticas de estudiantes
practicasRouter.get(
  '/docente',
  autenticarToken,
  requerirDocente,
  obtenerPracticasDocente
);

// Registrar práctica realizada por un estudiante (con o sin token)
practicasRouter.post('/', autenticarToken, registrarPractica);

// Obtener historial de prácticas por usuario
practicasRouter.get('/usuario/:usuarioId', autenticarToken, obtenerHistorialUsuario);

// Verificación pública de certificados mediante código QR o verificación manual
practicasRouter.get('/certificado/:codigo', verificarCertificado);
