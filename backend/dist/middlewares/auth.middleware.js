"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticarTokenOpcional = exports.requerirDocente = exports.autenticarToken = exports.asegurarConexionBD = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const obtenerJwtSecret = () => process.env.JWT_SECRET || 'manos_seguras_default_secret_key';
/**
 * Middleware para verificar o despertar la conexión con Supabase si estuvo en pausa
 */
const asegurarConexionBD = async (_req, res, next) => {
    try {
        await (0, prisma_1.ejecutarConReconexion)(() => prisma_1.prisma.$queryRaw `SELECT 1`, 2);
        next();
    }
    catch (error) {
        console.error('[Middleware BD] Error al reconectar con Supabase:', error);
        res.status(503).json({
            error: 'La base de datos de Supabase se está reactivando tras estar en pausa. Por favor intenta nuevamente en unos segundos.',
        });
    }
};
exports.asegurarConexionBD = asegurarConexionBD;
/**
 * Middleware para autenticar y validar el token JWT proveniente del encabezado Authorization
 */
const autenticarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Token de autorización requerido. Formato: Bearer <token>',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, obtenerJwtSecret());
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'El token de sesión ha expirado. Inicia sesión nuevamente.' });
            return;
        }
        if ((0, prisma_1.esErrorConexionTransitorio)(error)) {
            res.status(503).json({
                error: 'Reconectando con la base de datos de Supabase. Intenta de nuevo en unos segundos.',
            });
            return;
        }
        res.status(401).json({ error: 'Token de autenticación no válido.' });
    }
};
exports.autenticarToken = autenticarToken;
/**
 * Middleware para restringir acceso exclusivamente al personal con rol DOCENTE (RBAC)
 */
const requerirDocente = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
    }
    if (req.user.rol !== 'DOCENTE') {
        res.status(403).json({
            error: 'Acceso restringido a personal docente',
        });
        return;
    }
    next();
};
exports.requerirDocente = requerirDocente;
/**
 * Middleware opcional para verificar token si está presente, sin bloquear si no lo está
 */
const autenticarTokenOpcional = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, obtenerJwtSecret());
            req.user = decoded;
        }
        catch {
            // Token ausente, expirado o inválido; continuar sin req.user
        }
    }
    next();
};
exports.autenticarTokenOpcional = autenticarTokenOpcional;
