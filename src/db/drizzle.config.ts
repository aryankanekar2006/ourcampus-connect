import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

// Load .env explicitly from process.cwd() as well
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const sqlHost = process.env.SQL_HOST || process.env.DB_HOST || process.env.PGHOST || "localhost";
const sqlPort = Number(process.env.SQL_PORT || process.env.DB_PORT || process.env.PGPORT || 5432);
const sqlDbName = process.env.SQL_DB_NAME || process.env.DB_NAME || process.env.PGDATABASE || "postgres";
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER || process.env.DB_USER || process.env.PGUSER || "postgres";
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD;

const dbCredentials = databaseUrl
  ? { url: databaseUrl }
  : {
      host: sqlHost,
      port: sqlPort,
      user: user,
      password: password || undefined,
      database: sqlDbName,
      ssl: false,
    };

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbCredentials as any,
  verbose: true,
});

