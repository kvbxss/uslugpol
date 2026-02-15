import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/event-service/src/infra/event.schema.ts",
  out: "./packages/event-service/src/infra/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "__drizzle_migrations_event_service",
    schema: "event_service",
  },
} satisfies Config;
