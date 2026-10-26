import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export const preguntasRouter = Router();

// Validación para creación de pregunta
const CrearPreguntaSchema = z.object({
  enunciado: z.string().min(5, 'El enunciado debe tener al menos 5 caracteres'),
  justificacion: z.string().optional(),
  creadaPorId: z.string().uuid('ID de docente no válido'),
  opciones: z
    .array(
      z.object({
        texto: z.string().min(1, 'El texto de la opción es requerido'),
        esCorrecta: z.boolean(),
      })
    )
    .min(2, 'Debe haber al menos 2 opciones de respuesta')
    .refine((ops) => ops.some((o) => o.esCorrecta), {
      message: 'Al menos una opción debe ser marcada como correcta',
    }),
});

/**
 * GET /api/preguntas
 * Retorna las preguntas clínicas activas con sus opciones para el test diagnóstico
 */
preguntasRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const preguntas = await prisma.pregunta.findMany({
      where: { activa: true },
      include: {
        opciones: {
          select: {
            id: true,
            texto: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ preguntas });
  } catch (err) {
    console.error('Error al obtener preguntas:', err);
    res.status(500).json({ error: 'Error al consultar las preguntas clínicas' });
  }
});

/**
 * GET /api/preguntas/admin
 * Retorna todas las preguntas con detalle de respuestas correctas (para panel docente)
 */
preguntasRouter.get('/admin', async (_req: Request, res: Response): Promise<void> => {
  try {
    const preguntas = await prisma.pregunta.findMany({
      include: {
        opciones: true,
        creadaPor: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ preguntas });
  } catch (err) {
    console.error('Error en /preguntas/admin:', err);
    res.status(500).json({ error: 'Error al consultar las preguntas en modo docente' });
  }
});

/**
 * POST /api/preguntas
 * Crea una nueva pregunta clínica con sus opciones de respuesta
 */
preguntasRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = CrearPreguntaSchema.parse(req.body);

    const nuevaPregunta = await prisma.pregunta.create({
      data: {
        enunciado: data.enunciado,
        justificacion: data.justificacion,
        creadaPorId: data.creadaPorId,
        opciones: {
          create: data.opciones.map((op) => ({
            texto: op.texto,
            esCorrecta: op.esCorrecta,
          })),
        },
      },
      include: {
        opciones: true,
      },
    });

    res.status(201).json({
      mensaje: 'Pregunta clínica creada exitosamente',
      pregunta: nuevaPregunta,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos no válidos', detalles: err.errors });
      return;
    }
    console.error('Error al crear pregunta:', err);
    res.status(500).json({ error: 'Error interno al registrar la pregunta' });
  }
});

/**
 * POST /api/preguntas/diagnostico
 * Registra un intento de test diagnóstico (PRE o POST) y calcula el puntaje
 */
preguntasRouter.post('/diagnostico', async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioId, tipo, respuestas } = req.body as {
      usuarioId: string;
      tipo: 'PRE' | 'POST';
      respuestas: { preguntaId: string; opcionSeleccionadaId: string }[];
    };

    if (!usuarioId || !tipo || !Array.isArray(respuestas)) {
      res.status(400).json({ error: 'Faltan campos obligatorios para registrar el diagnóstico' });
      return;
    }

    // Consultar opciones seleccionadas para calificar
    const opcionIds = respuestas.map((r) => r.opcionSeleccionadaId);
    const opciones = await prisma.opcionRespuesta.findMany({
      where: { id: { in: opcionIds } },
    });

    const aciertos = opciones.filter((o) => o.esCorrecta).length;
    const totalPreguntas = respuestas.length || 1;
    const puntaje = Math.round((aciertos / totalPreguntas) * 100 * 10) / 10; // escala 0 - 100

    const intento = await prisma.intentoDiagnostico.create({
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

    res.status(201).json({
      mensaje: `Diagnóstico ${tipo} registrado con éxito`,
      intentoId: intento.id,
      puntaje,
      aciertos,
      totalPreguntas,
    });
  } catch (err) {
    console.error('Error al registrar intento diagnóstico:', err);
    res.status(500).json({ error: 'Error al procesar el intento de diagnóstico' });
  }
});
