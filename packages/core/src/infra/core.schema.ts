import { pgSchema, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

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

export const auditLog = core.table("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 120 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});

export const opportunities = core.table("opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull(),
  targetService: varchar("target_service", { length: 50 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: false }),
  decidedBy: varchar("decided_by", { length: 120 }),
});
