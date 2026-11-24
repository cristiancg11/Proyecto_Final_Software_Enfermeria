"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCertificado = exports.verificarCertificado = exports.obtenerHistorialUsuario = exports.registrarPractica = exports.obtenerPracticasDocente = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const RegistrarPracticaSchema = zod_1.z.object({
    usuarioId: zod_1.z.string().uuid('ID de estudiante no válido').optional(),
    calificacion: zod_1.z.number().min(0).max(10, 'La calificación debe estar entre 0 y 10').optional(),
    notaPractica: zod_1.z.number().min(0).max(10).optional(),
    notaTeorica: zod_1.z.number().min(0).max(10).optional(),
    notaFinal: zod_1.z.number().min(0).max(10).optional(),
    aprobado: zod_1.z.boolean().optional(),
    detallePasosJson: zod_1.z.any(),
});
/**
 * GET /api/practicas/docente
 * Consulta todas las prácticas realizadas por estudiantes y todos los estudiantes registrados en la tabla Usuario de Supabase.
 * Protegido: autenticarToken + requerirDocente
 */
const obtenerPracticasDocente = async (req, res) => {
    try {
        const [intentos, estudiantesRegistrados] = await (0, prisma_1.ejecutarConReconexion)((db) => Promise.all([
            db.intentoPractica.findMany({
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            codigoEstudiantil: true,
                            correo: true,
                        },
                    },
                    certificado: {
                        select: {
                            id: true,
                            codigoVerificacion: true,
                            fechaEmision: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.usuario.findMany({
                where: { rol: 'ESTUDIANTE' },
                select: {
                    id: true,
                    nombre: true,
                    codigoEstudiantil: true,
                    correo: true,
                    fechaRegistro: true,
                },
                orderBy: {
                    fechaRegistro: 'desc',
                },
            }),
        ]));
        const usuariosConIntento = new Set();
        const practicasDeIntentos = intentos.map((intento) => {
            usuariosConIntento.add(intento.usuarioId);
            const detalle = (intento.detallePasosJson || {});
            const notaFinal = intento.calificacion;
            const notaPractica = detalle.notaPractica !== undefined
                ? Number(detalle.notaPractica)
                : (Array.isArray(detalle.records) && detalle.records.length > 0
                    ? Math.min(10, Math.round((detalle.records.reduce((acc, r) => acc + (r.score || 0), 0)) * 10) / 10)
                    : notaFinal);
            const notaTeorica = detalle.notaTeorica !== undefined
                ? Number(detalle.notaTeorica)
                : (detalle.quizScore !== undefined && detalle.totalQuizQuestions
                    ? Math.round((detalle.quizScore / detalle.totalQuizQuestions) * 100) / 10
                    : 0);
            return {
                id: intento.id,
                estudianteId: intento.usuarioId,
                nombre: intento.usuario.nombre,
                codigo: intento.usuario.codigoEstudiantil,
                correo: intento.usuario.correo,
                fecha: intento.createdAt,
                calificacion: notaFinal,
                notaPractica,
                notaTeorica,
                notaFinal,
                aprobado: intento.aprobado,
                estado: intento.aprobado ? 'Aprobado' : 'Requiere práctica',
                certificado: intento.certificado
                    ? {
                        id: intento.certificado.id,
                        codigoVerificacion: intento.certificado.codigoVerificacion,
                        fechaEmision: intento.certificado.fechaEmision,
                    }
                    : null,
                detallePasos: intento.detallePasosJson,
            };
        });
        const estudiantesSinPractica = estudiantesRegistrados
            .filter((est) => !usuariosConIntento.has(est.id))
            .map((est) => ({
            id: `reg-${est.id}`,
            estudianteId: est.id,
            nombre: est.nombre,
            codigo: est.codigoEstudiantil,
            correo: est.correo,
            fecha: est.fechaRegistro,
            calificacion: 0,
            notaPractica: 0,
            notaTeorica: 0,
            notaFinal: 0,
            aprobado: false,
            estado: 'Registrado (En curso)',
            certificado: null,
            detallePasos: { records: [] },
        }));
        const practicas = [...practicasDeIntentos, ...estudiantesSinPractica];
        // ------------------------------------------------------------------
        // Seguimiento de investigación: etapas completadas por estudiante
        // (Pre-Test, Práctica/Simulación, Post-Test y Encuesta) + porcentajes
        // ------------------------------------------------------------------
        let seguimiento = [];
        let resumen = null;
        try {
            const [diagnosticos, encuestas] = await (0, prisma_1.ejecutarConReconexion)((db) => Promise.all([
                db.intentoDiagnostico.findMany({
                    select: { usuarioId: true, tipo: true, puntaje: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                }),
                db.encuestaPlataforma.findMany({
                    select: {
                        usuarioId: true,
                        facilidadUso: true,
                        utilidadGuia: true,
                        claridadFeed: true,
                        recomendacion: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                }),
            ]));
            const redondear = (n) => Math.round(n * 10) / 10;
            const pct = (parte, total) => (total > 0 ? redondear((parte / total) * 100) : 0);
            const promedio = (valores) => valores.length > 0 ? redondear(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;
            const maxFecha = (...fechas) => fechas.filter((f) => !!f).reduce((acc, f) => (!acc || f > acc ? f : acc), null);
            seguimiento = estudiantesRegistrados.map((est) => {
                const intentosEst = intentos.filter((i) => i.usuarioId === est.id);
                const preEst = diagnosticos.filter((d) => d.usuarioId === est.id && d.tipo === 'PRE');
                const postEst = diagnosticos.filter((d) => d.usuarioId === est.id && d.tipo === 'POST');
                const encEst = encuestas.filter((e) => e.usuarioId === est.id);
                const ultimoPre = preEst.length > 0 ? preEst[preEst.length - 1] : null;
                const ultimoPost = postEst.length > 0 ? postEst[postEst.length - 1] : null;
                const ultimaEnc = encEst.length > 0 ? encEst[encEst.length - 1] : null;
                // intentos viene ordenado desc: el primero es el más reciente
                const ultimoIntento = intentosEst.length > 0 ? intentosEst[0] : null;
                const mejorNota = intentosEst.length > 0 ? Math.max(...intentosEst.map((i) => i.calificacion)) : 0;
                const etapas = [!!ultimoPre, intentosEst.length > 0, !!ultimoPost, !!ultimaEnc];
                const etapasCompletadas = etapas.filter(Boolean).length;
                const ultimaActividad = maxFecha(ultimoPre?.createdAt, ultimoIntento?.createdAt, ultimoPost?.createdAt, ultimaEnc?.createdAt);
                return {
                    estudianteId: est.id,
                    nombre: est.nombre,
                    codigo: est.codigoEstudiantil,
                    correo: est.correo,
                    fechaRegistro: est.fechaRegistro,
                    ultimaActividad: ultimaActividad || null,
                    estadoActividad: etapasCompletadas === 0 ? 'Sin iniciar' : etapasCompletadas === 4 ? 'Flujo completo' : 'En curso',
                    preTest: {
                        completado: !!ultimoPre,
                        intentos: preEst.length,
                        puntaje: ultimoPre ? redondear(ultimoPre.puntaje) : null,
                        fecha: ultimoPre?.createdAt || null,
                    },
                    practica: {
                        completado: intentosEst.length > 0,
                        intentos: intentosEst.length,
                        mejorNota: intentosEst.length > 0 ? redondear(mejorNota) : null,
                        ultimaNota: ultimoIntento ? redondear(ultimoIntento.calificacion) : null,
                        aprobado: intentosEst.some((i) => i.aprobado),
                        certificado: intentosEst.some((i) => !!i.certificado),
                        fecha: ultimoIntento?.createdAt || null,
                    },
                    postTest: {
                        completado: !!ultimoPost,
                        intentos: postEst.length,
                        puntaje: ultimoPost ? redondear(ultimoPost.puntaje) : null,
                        fecha: ultimoPost?.createdAt || null,
                    },
                    encuesta: {
                        completada: !!ultimaEnc,
                        promedio: ultimaEnc
                            ? redondear((ultimaEnc.facilidadUso + ultimaEnc.utilidadGuia + ultimaEnc.claridadFeed + ultimaEnc.recomendacion) / 4)
                            : null,
                        fecha: ultimaEnc?.createdAt || null,
                    },
                    mejoraPrePost: ultimoPre && ultimoPost ? redondear(ultimoPost.puntaje - ultimoPre.puntaje) : null,
                    etapasCompletadas,
                    porcentajeAvance: pct(etapasCompletadas, 4),
                };
            });
            const total = seguimiento.length;
            const conPre = seguimiento.filter((s) => s.preTest.completado);
            const conPractica = seguimiento.filter((s) => s.practica.completado);
            const conPost = seguimiento.filter((s) => s.postTest.completado);
            const conEncuesta = seguimiento.filter((s) => s.encuesta.completada);
            const conActividad = seguimiento.filter((s) => s.etapasCompletadas > 0);
            const completos = seguimiento.filter((s) => s.etapasCompletadas === 4);
            const aprobados = conPractica.filter((s) => s.practica.aprobado);
            const conMejora = seguimiento.filter((s) => s.mejoraPrePost !== null);
            resumen = {
                totalEstudiantes: total,
                conActividad: conActividad.length,
                porcentajeParticipacion: pct(conActividad.length, total),
                preTest: {
                    completados: conPre.length,
                    porcentaje: pct(conPre.length, total),
                    promedioPuntaje: promedio(conPre.map((s) => s.preTest.puntaje ?? 0)),
                },
                practica: {
                    completados: conPractica.length,
                    porcentaje: pct(conPractica.length, total),
                    promedioNota: promedio(conPractica.map((s) => s.practica.mejorNota ?? 0)),
                    aprobados: aprobados.length,
                    porcentajeAprobacion: pct(aprobados.length, conPractica.length),
                },
                postTest: {
                    completados: conPost.length,
                    porcentaje: pct(conPost.length, total),
                    promedioPuntaje: promedio(conPost.map((s) => s.postTest.puntaje ?? 0)),
                },
                encuesta: {
                    completados: conEncuesta.length,
                    porcentaje: pct(conEncuesta.length, total),
                    promedioSatisfaccion: promedio(conEncuesta.map((s) => s.encuesta.promedio ?? 0)),
                },
                flujoCompleto: {
                    completados: completos.length,
                    porcentaje: pct(completos.length, total),
                },
                avancePromedio: promedio(seguimiento.map((s) => s.porcentajeAvance)),
                mejoraPromedioPrePost: conMejora.length > 0 ? promedio(conMejora.map((s) => s.mejoraPrePost)) : null,
            };
        }
        catch (errSeguimiento) {
            // El seguimiento es complementario: si falla no debe bloquear la lista de prácticas
            console.error('Aviso al construir seguimiento docente:', errSeguimiento);
        }
        res.json({
            total: practicas.length,
            practicas,
            seguimiento,
            resumen,
        });
    }
    catch (err) {
        console.error('Error en obtenerPracticasDocente:', err);
        res.status(500).json({ error: 'Error al consultar el registro de prácticas para supervisión docente' });
    }
};
exports.obtenerPracticasDocente = obtenerPracticasDocente;
/**
 * POST /api/practicas
 * Registra un intento de práctica de lavado de manos clínico y emite certificado si es aprobado
 */
const registrarPractica = async (req, res) => {
    try {
        const data = RegistrarPracticaSchema.parse(req.body);
        let usuarioId = req.user?.id || data.usuarioId;
        if (!usuarioId) {
            // Buscar si se envió correo o código en el cuerpo o en detallePasosJson
            const correo = req.body.correo || data.detallePasosJson?.student?.email;
            const codigo = req.body.codigoEstudiantil || data.detallePasosJson?.student?.studentCode;
            if (correo || codigo) {
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
            // Si aún no hay usuario, buscar el primer estudiante o fallar
            if (!usuarioId) {
                const defaultStudent = await prisma_1.prisma.usuario.findFirst({
                    where: { rol: 'ESTUDIANTE' },
                });
                if (defaultStudent) {
                    usuarioId = defaultStudent.id;
                }
                else {
                    res.status(400).json({ error: 'Se requiere el ID del estudiante para registrar la práctica.' });
                    return;
                }
            }
        }
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { id: usuarioId },
        });
        if (!usuario) {
            res.status(404).json({ error: 'Estudiante no encontrado en la base de datos.' });
            return;
        }
        // Calcular consolidación de notas (60% práctica + 40% teórica)
        const detalle = (data.detallePasosJson || {});
        const notaPractica = data.notaPractica !== undefined
            ? data.notaPractica
            : (detalle.notaPractica !== undefined ? Number(detalle.notaPractica) : (data.calificacion || 0));
        const notaTeorica = data.notaTeorica !== undefined
            ? data.notaTeorica
            : (detalle.notaTeorica !== undefined ? Number(detalle.notaTeorica) : 0);
        const notaFinalCalculada = Math.round(((notaPractica * 0.6) + (notaTeorica * 0.4)) * 10) / 10;
        const notaFinal = data.notaFinal !== undefined
            ? data.notaFinal
            : (data.calificacion !== undefined ? data.calificacion : notaFinalCalculada);
        const esAprobado = data.aprobado !== undefined ? data.aprobado : (notaFinal >= 6.0);
        const detalleConsolidado = {
            ...detalle,
            notaPractica,
            notaTeorica,
            notaFinal,
            aprobado: esAprobado,
        };
        // Generar código institucional único para el certificado si es aprobado
        const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const codigoCertificadoGenerado = `UCC-MS-${new Date().getFullYear()}-${randomCode}`;
        const intento = await prisma_1.prisma.intentoPractica.create({
            data: {
                usuarioId,
                calificacion: notaFinal,
                aprobado: esAprobado,
                detallePasosJson: detalleConsolidado,
                ...(esAprobado
                    ? {
                        certificado: {
                            create: {
                                codigoVerificacion: codigoCertificadoGenerado,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                certificado: true,
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
        const codigoCertificado = intento.certificado?.codigoVerificacion || null;
        res.status(201).json({
            mensaje: data.aprobado
                ? '¡Práctica aprobada con éxito! Se ha generado tu certificado de competencia clínica.'
                : 'Intento de práctica registrado.',
            intento,
            codigoCertificado,
            codigoVerificacion: codigoCertificado,
            certificado: intento.certificado || null,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Datos de práctica no válidos', detalles: err.errors });
            return;
        }
        console.error('Error al registrar práctica:', err);
        res.status(500).json({ error: 'Error interno al registrar la sesión de práctica' });
    }
};
exports.registrarPractica = registrarPractica;
/**
 * GET /api/practicas/usuario/:usuarioId
 * Obtiene el historial de intentos de práctica de un estudiante
 */
const obtenerHistorialUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        const intentos = await prisma_1.prisma.intentoPractica.findMany({
            where: { usuarioId },
            include: {
                certificado: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ intentos });
    }
    catch (err) {
        console.error('Error al consultar historial de prácticas:', err);
        res.status(500).json({ error: 'Error al consultar las prácticas del usuario' });
    }
};
exports.obtenerHistorialUsuario = obtenerHistorialUsuario;
/**
 * GET /api/certificados/validar/:codigo y GET /api/practicas/certificado/:codigo
 * Verifica la autenticidad institucional de un certificado emitido
 */
const verificarCertificado = async (req, res) => {
    try {
        const codigo = req.params.codigo?.trim();
        if (!codigo) {
            res.status(400).json({ valido: false, error: 'Código de certificado no proporcionado' });
            return;
        }
        const certificado = await prisma_1.prisma.certificado.findUnique({
            where: { codigoVerificacion: codigo },
            include: {
                intentoPractica: {
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
                },
            },
        });
        if (!certificado) {
            res.status(404).json({
                valido: false,
                error: 'Certificado no encontrado o código de verificación inválido.',
            });
            return;
        }
        res.json({
            valido: true,
            certificado: {
                id: certificado.id,
                codigoVerificacion: certificado.codigoVerificacion,
                codigo: certificado.codigoVerificacion,
                fechaEmision: certificado.fechaEmision,
                fecha: certificado.fechaEmision,
                calificacion: certificado.intentoPractica?.calificacion,
                estudiante: certificado.intentoPractica?.usuario?.nombre,
                nombre: certificado.intentoPractica?.usuario?.nombre,
                codigoEstudiantil: certificado.intentoPractica?.usuario?.codigoEstudiantil,
                codigoInstitucional: certificado.intentoPractica?.usuario?.codigoEstudiantil,
                correo: certificado.intentoPractica?.usuario?.correo,
                aprobado: certificado.intentoPractica?.aprobado,
                detallePasos: certificado.intentoPractica?.detallePasosJson,
            },
        });
    }
    catch (err) {
        console.error('Error al verificar certificado:', err);
        res.status(500).json({ error: 'Error al verificar el certificado' });
    }
};
exports.verificarCertificado = verificarCertificado;
// Alias para consistencia
exports.validarCertificado = exports.verificarCertificado;
