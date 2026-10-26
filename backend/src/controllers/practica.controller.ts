import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const RegistrarPracticaSchema = z.object({
  usuarioId: z.string().uuid('ID de estudiante no válido').optional(),
  calificacion: z.number().min(0).max(10, 'La calificación debe estar entre 0 y 10'),
  aprobado: z.boolean(),
  detallePasosJson: z.any(),
});

/**
 * GET /api/practicas/docente
 * Consulta todas las prácticas realizadas por estudiantes con su detalle biomecánico y certificado.
 * Protegido: autenticarToken + requerirDocente
 */
export const obtenerPracticasDocente = async (req: Request, res: Response): Promise<void> => {
  try {
    const intentos = await prisma.intentoPractica.findMany({
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
    });

    const practicas = intentos.map((intento) => ({
      id: intento.id,
      estudianteId: intento.usuarioId,
      nombre: intento.usuario.nombre,
      codigo: intento.usuario.codigoEstudiantil,
      correo: intento.usuario.correo,
      fecha: intento.createdAt,
      calificacion: intento.calificacion,
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
    }));

    res.json({
      total: practicas.length,
      practicas,
    });
  } catch (err) {
    console.error('Error en obtenerPracticasDocente:', err);
    res.status(500).json({ error: 'Error al consultar el registro de prácticas para supervisión docente' });
  }
};

/**
 * POST /api/practicas
 * Registra un intento de práctica de lavado de manos clínico y emite certificado si es aprobado
 */
export const registrarPractica = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = RegistrarPracticaSchema.parse(req.body);
    const usuarioId = data.usuarioId || req.user?.id;

    if (!usuarioId) {
      res.status(400).json({ error: 'Se requiere el ID del estudiante para registrar la práctica.' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Estudiante no encontrado en la base de datos.' });
      return;
    }

    const intento = await prisma.intentoPractica.create({
      data: {
        usuarioId,
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
};

/**
 * GET /api/practicas/usuario/:usuarioId
 * Obtiene el historial de intentos de práctica de un estudiante
 */
export const obtenerHistorialUsuario = async (req: Request, res: Response): Promise<void> => {
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
};

/**
 * GET /api/practicas/certificado/:codigo
 * Verifica la autenticidad de un certificado emitido
 */
export const verificarCertificado = async (req: Request, res: Response): Promise<void> => {
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
};
