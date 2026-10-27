import { Router } from 'express';
import {
  obtenerPracticasDocente,
  registrarPractica,
  obtenerHistorialUsuario,
  verificarCertificado,
} from '../controllers/practica.controller';
import { autenticarToken, requerirDocente, autenticarTokenOpcional } from '../middlewares/auth.middleware';

export const practicasRouter = Router();

// Endpoint exclusivo para supervisión docente de todas las prácticas de estudiantes
practicasRouter.get(
  '/docente',
  autenticarToken,
  requerirDocente,
  obtenerPracticasDocente
);

// Registrar práctica realizada por un estudiante (autenticado opcionalmente)
practicasRouter.post('/', autenticarTokenOpcional, registrarPractica);

// Obtener historial de prácticas por usuario
practicasRouter.get('/usuario/:usuarioId', autenticarToken, obtenerHistorialUsuario);

// Verificación pública de certificados mediante código QR o verificación manual
practicasRouter.get('/certificado/:codigo', verificarCertificado);
practicasRouter.get('/certificados/validar/:codigo', verificarCertificado);
practicasRouter.get('/validar/:codigo', verificarCertificado);
