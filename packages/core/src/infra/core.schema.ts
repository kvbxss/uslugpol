import { pgSchema, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const core = pgSchema("core");

export const leads = core.table("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});

export const leadMetadata = core.table("lead_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
});
