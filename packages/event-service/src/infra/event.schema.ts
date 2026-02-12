import { pgSchema, uuid, integer, boolean, numeric, date, timestamp } from "drizzle-orm/pg-core";

export const eventService = pgSchema("event_service");

export const eventData = eventService.table("event_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  eventDate: date("event_date"),
  guestCount: integer("guest_count"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  isOutdoor: boolean("is_outdoor"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});

