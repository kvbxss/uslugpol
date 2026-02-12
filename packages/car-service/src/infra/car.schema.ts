import { pgSchema, uuid, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const carService = pgSchema("car_service");

export const transportRequests = carService.table("transport_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  passengers: integer("passengers"),
  distanceKm: integer("distance_km"),
  pickupLocation: varchar("pickup_location", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});

