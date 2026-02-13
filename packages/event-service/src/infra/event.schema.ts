import {
  pgSchema,
  uuid,
  integer,
  numeric,
  date,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const eventService = pgSchema("event_service");

export const eventData = eventService.table("event_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  eventDate: date("event_date"),
  location: varchar("location", { length: 255 }),
  eventType: varchar("event_type", { length: 255 }),
  guestCount: integer("guest_count"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});
