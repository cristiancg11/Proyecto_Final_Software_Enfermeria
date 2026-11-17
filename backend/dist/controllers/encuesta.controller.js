"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerEncuestasDocente = exports.registrarEncuesta = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const CrearEncuestaSchema = zod_1.z.object({
    usuarioId: zod_1.z.string().optional(),
    codigoEstudiantil: zod_1.z.string().optional(),
    correo: zod_1.z.string().optional(),
    facilidadUso: zod_1.z.number().int().min(1).max(5, 'La calificación debe estar entre 1 y 5').optional(),
    utilidadGuia: zod_1.z.number().int().min(1).max(5, 'La calificación debe estar entre 1 y 5').optional(),
    claridadFeed: zod_1.z.number().int().min(1).max(5, 'La calificación debe estar entre 1 y 5').optional(),
    recomendacion: zod_1.z.number().int().min(1).max(5, 'La calificación debe estar entre 1 y 5').optional(),
    gustoExperiencia: zod_1.z.number().int().min(1).max(5).optional(),
    mejoraTecnica: zod_1.z.string().optional(),
    comentarios: zod_1.z.string().optional().nullable(),
});
/**
 * POST /api/encuesta
 * Registra la encuesta de satisfacción y percepción pedagógica de la plataforma
 */
const registrarEncuesta = async (req, res) => {
    try {
        const data = CrearEncuestaSchema.parse(req.body);
        let usuarioId = req.user?.id || data.usuarioId;
        if (!usuarioId) {
            const codigo = data.codigoEstudiantil || req.body.codigo;
            const correo = data.correo || req.body.email;
            if (codigo || correo) {
                const u = await prisma_1.prisma.usuario.findFirst({
                    where: {
                        OR: [
                            ...(correo ? [{ correo: String(correo).trim().toLowerCase() }] : []),
                            ...(codigo ? [{ codigoEstudiantil: String(codigo).trim() }] : []),
                        ],
                    },
                });
                if (u)
                    usuarioId = u.id;
            }
            if (!usuarioId) {
                const defaultStudent = await prisma_1.prisma.usuario.findFirst({
                    where: { rol: 'ESTUDIANTE' },
                    orderBy: { fechaRegistro: 'desc' },
                });
                if (defaultStudent) {
                    usuarioId = defaultStudent.id;
                }
                else {
                    res.status(400).json({ error: 'Se requiere identificación de estudiante para registrar la encuesta.' });
                    return;
                }
            }
        }
        const valorEstrellas = data.gustoExperiencia ?? data.recomendacion ?? data.facilidadUso ?? 5;
        const facilidadUsoFinal = data.facilidadUso ?? valorEstrellas;
        const recomendacionFinal = data.recomendacion ?? valorEstrellas;
        let utilidadFinal = data.utilidadGuia ?? valorEstrellas;
        if (data.mejoraTecnica) {
            const resp = data.mejoraTecnica.toLowerCase();
            if (resp.includes('sí') || resp.includes('si'))
                utilidadFinal = 5;
            else if (resp.includes('parcial'))
                utilidadFinal = 3;
            else if (resp.includes('no'))
                utilidadFinal = 1;
        }
        const claridadFinal = data.claridadFeed ?? valorEstrellas;
        let comentariosFinales = data.comentarios ? data.comentarios.trim() : '';
        if (data.mejoraTecnica && !comentariosFinales.includes('[Mejora Técnica:')) {
            comentariosFinales = `[Mejora Técnica: ${data.mejoraTecnica}] ${comentariosFinales}`.trim();
        }
        const nuevaEncuesta = await prisma_1.prisma.encuestaPlataforma.create({
            data: {
                usuarioId,
                facilidadUso: facilidadUsoFinal,
                utilidadGuia: utilidadFinal,
                claridadFeed: claridadFinal,
                recomendacion: recomendacionFinal,
                comentarios: comentariosFinales || null,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoEstudiantil: true,
                        correo: true,
                    },
                },
            },
        });
        console.log(`[Encuesta] ✅ Encuesta y calificación guardada en Supabase para el usuario ${usuarioId} (${nuevaEncuesta.usuario?.nombre || 'Estudiante'}): recomendación ${recomendacionFinal}/5, facilidad ${facilidadUsoFinal}/5. Mejora Técnica: "${data.mejoraTecnica || 'N/A'}". Comentarios: "${comentariosFinales || 'Sin comentarios'}"`);
        res.status(201).json({
            mensaje: 'Encuesta registrada exitosamente.',
            encuesta: nuevaEncuesta,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Datos de encuesta no válidos',
                detalles: err.errors.map((e) => e.message),
            });
            return;
        }
        console.error('Error al registrar encuesta:', err);
        res.status(500).json({ error: 'Error interno al registrar la encuesta de la plataforma.' });
    }
};
exports.registrarEncuesta = registrarEncuesta;
/**
 * GET /api/encuesta/docente
 * Obtiene métricas consolidadas de satisfacción, usabilidad y retroalimentación para el docente
 */
const obtenerEncuestasDocente = async (_req, res) => {
    try {
        const encuestas = await prisma_1.prisma.encuestaPlataforma.findMany({
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        codigoEstudiantil: true,
                        correo: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const total = encuestas.length;
        if (total === 0) {
            res.json({
                total: 0,
                promedioGeneral: 0,
                promedioFacilidadUso: 0,
                promedioUtilidadGuia: 0,
                promedioClaridadFeed: 0,
                promedioRecomendacion: 0,
                encuestas: [],
            });
            return;
        }
        const sumFacilidad = encuestas.reduce((acc, e) => acc + e.facilidadUso, 0);
        const sumUtilidad = encuestas.reduce((acc, e) => acc + e.utilidadGuia, 0);
        const sumClaridad = encuestas.reduce((acc, e) => acc + e.claridadFeed, 0);
        const sumRecomendacion = encuestas.reduce((acc, e) => acc + e.recomendacion, 0);
        const promedioFacilidadUso = Math.round((sumFacilidad / total) * 10) / 10;
        const promedioUtilidadGuia = Math.round((sumUtilidad / total) * 10) / 10;
        const promedioClaridadFeed = Math.round((sumClaridad / total) * 10) / 10;
        const promedioRecomendacion = Math.round((sumRecomendacion / total) * 10) / 10;
        const promedioGeneral = Math.round(((promedioFacilidadUso + promedioUtilidadGuia + promedioClaridadFeed + promedioRecomendacion) / 4) * 10) / 10;
        const listado = encuestas.map((e) => {
            const promedioIndividual = Math.round(((e.facilidadUso + e.utilidadGuia + e.claridadFeed + e.recomendacion) / 4) * 10) / 10;
            return {
                id: e.id,
                estudianteId: e.usuarioId,
                nombre: e.usuario.nombre,
                codigo: e.usuario.codigoEstudiantil,
                correo: e.usuario.correo,
                facilidadUso: e.facilidadUso,
                utilidadGuia: e.utilidadGuia,
                claridadFeed: e.claridadFeed,
                recomendacion: e.recomendacion,
                promedioIndividual,
                comentarios: e.comentarios,
                fecha: e.createdAt,
            };
        });
        res.json({
            total,
            promedioGeneral,
            promedioFacilidadUso,
            promedioUtilidadGuia,
            promedioClaridadFeed,
            promedioRecomendacion,
            encuestas: listado,
        });
    }
    catch (err) {
        console.error('Error en obtenerEncuestasDocente:', err);
        res.status(500).json({ error: 'Error al consultar las encuestas para supervisión docente.' });
    }
};
exports.obtenerEncuestasDocente = obtenerEncuestasDocente;
