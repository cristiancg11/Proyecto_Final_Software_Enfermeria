"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarDiagnostico = exports.eliminarPregunta = exports.obtenerPreguntasDocente = exports.obtenerPreguntasEstudiante = exports.crearPregunta = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
// Esquema de validación para la creación de preguntas
const CrearPreguntaSchema = zod_1.z.object({
    enunciado: zod_1.z.string().min(5, 'El enunciado debe contener al menos 5 caracteres'),
    justificacion: zod_1.z.string().optional(),
    opciones: zod_1.z
        .array(zod_1.z.object({
        texto: zod_1.z.string().min(1, 'El texto de la opción no puede estar vacío'),
        esCorrecta: zod_1.z.boolean(),
    }))
        .min(2, 'Debe proporcionar al menos 2 opciones de respuesta')
        .refine((opciones) => opciones.some((op) => op.esCorrecta), {
        message: 'Al menos una de las opciones debe ser marcada como correcta',
    }),
});
/**
 * POST /api/preguntas
 * Crea una pregunta con sus opciones en una sola transacción
 * Protegido: autenticarToken + requerirDocente
 */
const crearPregunta = async (req, res) => {
    try {
        const docenteId = req.user?.id;
        if (!docenteId) {
            res.status(401).json({ error: 'Sesión no válida o usuario no identificado' });
            return;
        }
        const data = CrearPreguntaSchema.parse(req.body);
        // Creación atómica de pregunta y opciones con Prisma
        const nuevaPregunta = await prisma_1.prisma.pregunta.create({
            data: {
                enunciado: data.enunciado.trim(),
                justificacion: data.justificacion?.trim(),
                creadaPorId: docenteId,
                activa: true,
                opciones: {
                    create: data.opciones.map((opcion) => ({
                        texto: opcion.texto.trim(),
                        esCorrecta: opcion.esCorrecta,
                    })),
                },
            },
            include: {
                opciones: {
                    select: {
                        id: true,
                        texto: true,
                        esCorrecta: true,
                    },
                },
            },
        });
        res.status(201).json({
            mensaje: 'Pregunta clínica creada exitosamente',
            pregunta: nuevaPregunta,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Datos de pregunta inválidos',
                detalles: error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
            });
            return;
        }
        console.error('Error en crearPregunta:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear la pregunta' });
    }
};
exports.crearPregunta = crearPregunta;
/**
 * GET /api/preguntas/estudiante
 * Retorna las preguntas activas OMITIENDO esCorrecta para evitar trampas en inspección de red
 * Protegido: autenticarToken
 */
const obtenerPreguntasEstudiante = async (req, res) => {
    try {
        const preguntas = await prisma_1.prisma.pregunta.findMany({
            where: { activa: true },
            select: {
                id: true,
                enunciado: true,
                justificacion: false, // Ocultar justificación previa al examen
                opciones: {
                    select: {
                        id: true,
                        texto: true,
                        // IMPORTANTE: esCorrecta se excluye intencionalmente para estudiantes
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json({
            total: preguntas.length,
            preguntas,
        });
    }
    catch (error) {
        console.error('Error en obtenerPreguntasEstudiante:', error);
        res.status(500).json({ error: 'Error al consultar las preguntas del examen diagnóstico' });
    }
};
exports.obtenerPreguntasEstudiante = obtenerPreguntasEstudiante;
/**
 * GET /api/preguntas/docente
 * Retorna todas las preguntas con opciones completas (incluyendo esCorrecta) y estadísticas de respuestas
 * Protegido: autenticarToken + requerirDocente
 */
const obtenerPreguntasDocente = async (req, res) => {
    try {
        const preguntas = await prisma_1.prisma.pregunta.findMany({
            include: {
                opciones: {
                    select: {
                        id: true,
                        texto: true,
                        esCorrecta: true,
                        _count: {
                            select: { respuestas: true },
                        },
                    },
                },
                creadaPor: {
                    select: {
                        id: true,
                        nombre: true,
                        correo: true,
                    },
                },
                _count: {
                    select: { respuestas: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Formatear estadísticas legibles para el panel docente
        const resultado = preguntas.map((p) => ({
            id: p.id,
            enunciado: p.enunciado,
            justificacion: p.justificacion,
            activa: p.activa,
            fechaCreacion: p.createdAt,
            creadaPor: p.creadaPor.nombre,
            totalRespuestas: p._count.respuestas,
            opciones: p.opciones.map((o) => ({
                id: o.id,
                texto: o.texto,
                esCorrecta: o.esCorrecta,
                vecesElegida: o._count.respuestas,
            })),
        }));
        res.json({
            total: resultado.length,
            preguntas: resultado,
        });
    }
    catch (error) {
        console.error('Error en obtenerPreguntasDocente:', error);
        res.status(500).json({ error: 'Error al consultar las preguntas en el panel docente' });
    }
};
exports.obtenerPreguntasDocente = obtenerPreguntasDocente;
/**
 * DELETE /api/preguntas/:id
 * Elimina o desactiva una pregunta clínica
 * Protegido: autenticarToken + requerirDocente
 */
const eliminarPregunta = async (req, res) => {
    try {
        const id = req.params.id;
        const pregunta = await prisma_1.prisma.pregunta.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { respuestas: true },
                },
            },
        });
        if (!pregunta) {
            res.status(404).json({ error: 'La pregunta especificada no existe.' });
            return;
        }
        // Si la pregunta ya tiene respuestas de estudiantes asociadas, realizamos soft-delete
        if (pregunta._count.respuestas > 0) {
            await prisma_1.prisma.pregunta.update({
                where: { id },
                data: { activa: false },
            });
            res.json({
                mensaje: 'La pregunta fue desactivada para preservar el historial académico de los estudiantes evaluados.',
                accion: 'desactivada',
            });
            return;
        }
        // Si no tiene respuestas asociadas, se puede eliminar físicamente
        await prisma_1.prisma.pregunta.delete({
            where: { id },
        });
        res.json({
            mensaje: 'Pregunta eliminada de manera permanente.',
            accion: 'eliminada',
        });
    }
    catch (error) {
        console.error('Error en eliminarPregunta:', error);
        res.status(500).json({ error: 'Error interno al intentar eliminar la pregunta' });
    }
};
exports.eliminarPregunta = eliminarPregunta;
/**
 * POST /api/preguntas/diagnostico
 * Registra un intento de diagnóstico y calcula el puntaje
 * Protegido: autenticarToken
 */
const registrarDiagnostico = async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            res.status(401).json({ error: 'Sesión no válida' });
            return;
        }
        const { tipo, respuestas } = req.body;
        if (!tipo || !Array.isArray(respuestas) || respuestas.length === 0) {
            res.status(400).json({ error: 'Debes enviar el tipo de diagnóstico y tus respuestas seleccionadas.' });
            return;
        }
        // Consultar opciones seleccionadas para calificar y las preguntas completas con su justificación
        const opcionIds = respuestas.map((r) => r.opcionSeleccionadaId);
        const opcionesSeleccionadas = await prisma_1.prisma.opcionRespuesta.findMany({
            where: { id: { in: opcionIds } },
        });
        const aciertos = opcionesSeleccionadas.filter((o) => o.esCorrecta).length;
        const totalPreguntas = respuestas.length;
        const puntaje = Math.round((aciertos / totalPreguntas) * 100 * 10) / 10; // 0 - 100%
        const calificacion10 = Math.round((aciertos / totalPreguntas) * 10 * 10) / 10; // 0 - 10
        const intento = await prisma_1.prisma.intentoDiagnostico.create({
            data: {
                usuarioId,
                tipo,
                puntaje,
                respuestas: {
                    create: respuestas.map((r) => ({
                        preguntaId: r.preguntaId,
                        opcionSeleccionadaId: r.opcionSeleccionadaId,
                    })),
                },
            },
            include: {
                respuestas: true,
            },
        });
        // Cargar preguntas con opciones para generar la retroalimentación pedagógica
        const preguntasIds = respuestas.map((r) => r.preguntaId);
        const preguntasCompletas = await prisma_1.prisma.pregunta.findMany({
            where: { id: { in: preguntasIds } },
            include: {
                opciones: true,
            },
        });
        const retroalimentacion = preguntasCompletas.map((p) => {
            const respUser = respuestas.find((r) => r.preguntaId === p.id);
            const opcionUser = p.opciones.find((o) => o.id === respUser?.opcionSeleccionadaId);
            const opcionCorrecta = p.opciones.find((o) => o.esCorrecta);
            const esCorrecta = !!opcionUser?.esCorrecta;
            return {
                preguntaId: p.id,
                enunciado: p.enunciado,
                justificacion: p.justificacion || 'Protocolo estandarizado OMS de higiene de manos.',
                opcionSeleccionada: opcionUser ? { id: opcionUser.id, texto: opcionUser.texto } : null,
                opcionCorrecta: opcionCorrecta ? { id: opcionCorrecta.id, texto: opcionCorrecta.texto } : null,
                esCorrecta,
            };
        });
        res.status(201).json({
            mensaje: `Evaluación ${tipo} calificada y registrada exitosamente.`,
            intentoId: intento.id,
            tipo,
            puntaje,
            calificacion10,
            aciertos,
            totalPreguntas,
            retroalimentacion,
        });
    }
    catch (error) {
        console.error('Error en registrarDiagnostico:', error);
        res.status(500).json({ error: 'Error al registrar el intento diagnóstico' });
    }
};
exports.registrarDiagnostico = registrarDiagnostico;
