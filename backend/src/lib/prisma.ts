import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Garantizar carga del archivo .env del backend independientemente del directorio de ejecución
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Detecta si un error de Prisma corresponde a una caída temporal, timeout o pausa de Supabase/PgBouncer
 */
export function esErrorConexionTransitorio(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();

  const codigosTransitorios = ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'];
  if (codigosTransitorios.includes(code)) {
    return true;
  }

  return (
    msg.includes("can't reach database server") ||
    msg.includes('server has closed the connection') ||
    msg.includes('connection reset') ||
    msg.includes('connection terminated') ||
    msg.includes('timed out') ||
    msg.includes('prepared statement') ||
    msg.includes('engine is not yet connected')
  );
}

/**
 * Ejecuta una operación de Prisma con reconexión automática en caso de que Supabase
 * haya estado en pausa o el pooler haya cerrado una conexión inactiva.
 */
export async function ejecutarConReconexion<T>(
  operacion: () => Promise<T>,
  reintentos = 2
): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      return await operacion();
    } catch (error) {
      ultimoError = error;
      if (intento < reintentos && esErrorConexionTransitorio(error)) {
        console.warn(
          `[Prisma Supabase] Reconectando a la base de datos tras inactividad (intento ${intento + 1}/${reintentos})...`
        );
        try {
          await prisma.$disconnect();
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 600 * (intento + 1)));
        try {
          await prisma.$connect();
        } catch {}
        continue;
      }
      throw error;
    }
  }

  throw ultimoError;
}
