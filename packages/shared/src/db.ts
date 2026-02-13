import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
// @ts-ignore no pg types are installed in this workspace yet
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
