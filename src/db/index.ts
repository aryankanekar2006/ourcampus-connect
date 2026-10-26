import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      const host = process.env.SQL_HOST || process.env.DB_HOST || process.env.PGHOST || 'localhost';
      const port = Number(process.env.SQL_PORT || process.env.DB_PORT || process.env.PGPORT || 5432);
      const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER || process.env.DB_USER || process.env.PGUSER || 'postgres';
      const password = String(process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || '');
      const database = process.env.SQL_DB_NAME || process.env.DB_NAME || process.env.PGDATABASE || 'postgres';

      global._postgresPool = new Pool({
        host,
        port,
        user,
        password,
        database,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', () => {
      console.error('Unexpected error on idle SQL pool client.');
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
