import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma, ejecutarConReconexion } from './lib/prisma';
import { authRouter } from './routes/auth.routes';
import { preguntaRouter } from './routes/pregunta.routes';
import { practicasRouter } from './routes/practicas.routes';
import { encuestaRouter } from './routes/encuesta.routes';
import { iaRouter } from './routes/ia.routes';
import { verificarCertificado } from './controllers/practica.controller';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configuración dinámica de CORS para Angular Local y despliegues en Vercel
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Permitir Private Network Access (peticiones desde https://*.vercel.app hacia http://localhost:3000 en navegadores Chromium)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como apps móviles, Postman o curl)
      if (!origin) return callback(null, true);

      // Permitir dominios definidos o cualquier subdominio en Vercel
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Log de auditoría en consola para todas las peticiones entrantes al backend
app.use((req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion}ms)`);
  });
  next();
});

// Endpoint de Diagnóstico y Salud del Servicio (incluye verificación de conexión con Supabase)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await ejecutarConReconexion(() => prisma.$queryRaw`SELECT 1`, 2);
    res.json({
      status: 'ok',
      database: 'connected',
      servicio: 'Manos Seguras API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      entorno: process.env.NODE_ENV || 'development',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: err?.message || 'Error de conexión con Supabase',
      timestamp: new Date().toISOString(),
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRouter);
app.use('/api/preguntas', preguntaRouter);
app.use('/api/practicas', practicasRouter);
app.use('/api/encuesta', encuestaRouter);
app.use('/api/ia', iaRouter);
app.get('/api/certificados/validar/:codigo', verificarCertificado);

// Manejador de rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    error: 'Ocurrió un error inesperado en el servidor.',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Inicialización del Servidor HTTP (en local; en Vercel Serverless se exporta `app` directamente)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Servidor Manos Seguras API corriendo`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🛡️ Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

export default app;
