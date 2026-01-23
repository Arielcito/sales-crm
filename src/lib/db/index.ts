import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const isProduction = process.env.NODE_ENV === "production";
const maxConnections = isProduction ? 10 : 20;

declare global {
  var __dbClient: postgres.Sql | undefined;
}

function getClient() {
  if (!global.__dbClient) {
    console.log(`[DB] Initializing connection pool (env: ${process.env.NODE_ENV || 'development'}, max: ${maxConnections})`);
    global.__dbClient = postgres(connectionString, {
      prepare: false,
      ssl: 'require',
      max: maxConnections,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
  }
  return global.__dbClient;
}

export const client = getClient();
export const db = drizzle(client, { schema });
