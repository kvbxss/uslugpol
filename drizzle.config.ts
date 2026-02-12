import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/core/src/infra/core.schema.ts",
  out: "./packages/core/src/infra/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
