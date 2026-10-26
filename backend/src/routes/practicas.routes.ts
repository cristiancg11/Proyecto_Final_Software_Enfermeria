import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export const practicasRouter = Router();

const RegistrarPracticaSchema = z.object({
  usuarioId: z.string().uuid('ID de estudiante no válido'),
  calificacion: z.number().min(0).max(10, 'La calificación debe estar entre 0 y 10'),
  aprobado: z.boolean(),
  detallePasosJson: z.any(),
});

/**
 * POST /api/practicas
 * Registra un intento de práctica de lavado de manos clínico y emite certificado si es aprobado
 */
practicasRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = RegistrarPracticaSchema.parse(req.body);

    // Verificar que el estudiante existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Estudiante no encontrado' });
      return;
    }

    // Crear el intento de práctica
    const intento = await prisma.intentoPractica.create({
      data: {
        usuarioId: data.usuarioId,
        calificacion: data.calificacion,
        aprobado: data.aprobado,
        detallePasosJson: data.detallePasosJson,
        ...(data.aprobado
          ? {
              certificado: {
                create: {},
              },
            }
          : {}),
      },
      include: {
        certificado: true,
      },
    });

    res.status(201).json({
      mensaje: data.aprobado
        ? '¡Práctica aprobada con éxito! Se ha generado tu certificado de competencia clínica.'
        : 'Intento de práctica registrado.',
      intento,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos de práctica no válidos', detalles: err.errors });
      return;
    }
    console.error('Error al registrar práctica:', err);
    res.status(500).json({ error: 'Error interno al registrar la sesión de práctica' });
  }
});

/**
 * GET /api/practicas/usuario/:usuarioId
 * Obtiene el historial de intentos de práctica de un estudiante
 */
practicasRouter.get('/usuario/:usuarioId', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.params.usuarioId as string;

    const intentos = await prisma.intentoPractica.findMany({
      where: { usuarioId },
      include: {
        certificado: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ intentos });
  } catch (err) {
    console.error('Error al consultar historial de prácticas:', err);
    res.status(500).json({ error: 'Error al consultar las prácticas del usuario' });
  }
});

/**
 * GET /api/practicas/certificado/:codigo
 * Verifica la autenticidad de un certificado emitido
 */
practicasRouter.get('/certificado/:codigo', async (req: Request, res: Response): Promise<void> => {
  try {
    const codigo = req.params.codigo as string;

    const certificado: any = await prisma.certificado.findUnique({
      where: { codigoVerificacion: codigo },
      include: {
        intentoPractica: {
          include: {
            usuario: {
              select: {
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
        codigoVerificacion: certificado.codigoVerificacion,
        fechaEmision: certificado.fechaEmision,
        calificacion: certificado.intentoPractica?.calificacion,
        estudiante: certificado.intentoPractica?.usuario?.nombre,
        codigoEstudiantil: certificado.intentoPractica?.usuario?.codigoEstudiantil,
      },
    });
  } catch (err) {
    console.error('Error al verificar certificado:', err);
    res.status(500).json({ error: 'Error al verificar el certificado' });
  }
});
