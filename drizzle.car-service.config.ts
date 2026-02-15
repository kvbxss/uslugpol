import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/car-service/src/infra/car.schema.ts",
  out: "./packages/car-service/src/infra/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "__drizzle_migrations_car_service",
    schema: "car_service",
  },
} satisfies Config;
