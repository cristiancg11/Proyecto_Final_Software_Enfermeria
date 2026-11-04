import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Garantizar carga del archivo .env del backend independientemente del directorio de ejecución
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_SUPABASE_POOLER_URL =
  'postgresql://postgres.pogefcmywndmbpphczhe:ManosSeguras2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30&connect_timeout=20';

const DEFAULT_SUPABASE_DIRECT_URL =
  'postgresql://postgres.pogefcmywndmbpphczhe:ManosSeguras2026@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=20';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('connection_limit=1')) {
  process.env.DATABASE_URL = DEFAULT_SUPABASE_POOLER_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_SUPABASE_DIRECT_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDirect: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

export const prismaDirect =
  globalForPrisma.prismaDirect ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDirect = prismaDirect;
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
  operacion: (client: PrismaClient) => Promise<T>,
  reintentos = 3
): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 0; intento <= reintentos; intento++) {
    const clienteActivo = intento >= 2 ? prismaDirect : prisma;
    try {
      return await operacion(clienteActivo);
    } catch (error) {
      ultimoError = error;
      const errObj = error as any;
      console.error(
        `⚠️ [Prisma Supabase Error - Intento ${intento + 1}/${reintentos + 1}] Código: ${errObj?.code || 'N/A'} | Nombre: ${errObj?.name || 'Error'} | Mensaje: ${errObj?.message || errObj}`,
        errObj?.meta ? { meta: errObj.meta } : ''
      );
      if (intento < reintentos && esErrorConexionTransitorio(error)) {
        console.warn(
          `🔄 [Prisma Supabase] Reintentando operación en base de datos Supabase (intento ${intento + 1}/${reintentos}, usando ${intento + 1 >= 2 ? 'DIRECT_URL:5432' : 'POOLER:6543'})...`
        );
        await new Promise((resolve) => setTimeout(resolve, 450 * (intento + 1)));
        try {
          await (intento + 1 >= 2 ? prismaDirect : prisma).$connect();
        } catch (connErr: any) {
          console.error('⚠️ [Prisma Supabase] Error al reconectar cliente Prisma:', connErr?.message || connErr);
        }
        continue;
      }
      throw error;
    }
  }

  throw ultimoError;
}
