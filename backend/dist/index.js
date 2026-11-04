"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./lib/prisma");
const auth_routes_1 = require("./routes/auth.routes");
const pregunta_routes_1 = require("./routes/pregunta.routes");
const practicas_routes_1 = require("./routes/practicas.routes");
const encuesta_routes_1 = require("./routes/encuesta.routes");
const ia_routes_1 = require("./routes/ia.routes");
const practica_controller_1 = require("./controllers/practica.controller");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Configuración dinámica de CORS para Angular Local y despliegues en Vercel
const allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    process.env.FRONTEND_URL,
].filter(Boolean);
// Permitir Private Network Access (peticiones desde https://*.vercel.app hacia http://localhost:3000 en navegadores Chromium)
app.use((req, res, next) => {
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (como apps móviles, Postman o curl)
        if (!origin)
            return callback(null, true);
        // Permitir dominios definidos o cualquier subdominio en Vercel
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV !== 'production';
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origen no permitido por CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Log de auditoría en consola para todas las peticiones entrantes al backend
app.use((req, res, next) => {
    const inicio = Date.now();
    res.on('finish', () => {
        const duracion = Date.now() - inicio;
        console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion}ms)`);
    });
    next();
});
// Endpoint de Diagnóstico y Salud del Servicio (incluye verificación de conexión con Supabase)
app.get('/api/health', async (_req, res) => {
    try {
        await (0, prisma_1.ejecutarConReconexion)(() => prisma_1.prisma.$queryRaw `SELECT 1`, 2);
        res.json({
            status: 'ok',
            database: 'connected',
            servicio: 'Manos Seguras API',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            entorno: process.env.NODE_ENV || 'development',
        });
    }
    catch (err) {
        res.status(503).json({
            status: 'degraded',
            database: 'disconnected',
            error: err?.message || 'Error de conexión con Supabase',
            timestamp: new Date().toISOString(),
        });
    }
});
// Rutas de la API
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/preguntas', pregunta_routes_1.preguntaRouter);
app.use('/api/practicas', practicas_routes_1.practicasRouter);
app.use('/api/encuesta', encuesta_routes_1.encuestaRouter);
app.use('/api/ia', ia_routes_1.iaRouter);
app.get('/api/certificados/validar/:codigo', practica_controller_1.verificarCertificado);
// Manejador de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});
// Manejador global de errores
app.use((err, _req, res, _next) => {
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
exports.default = app;
