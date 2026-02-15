import { desc, eq } from "drizzle-orm";
import { db } from "@repo/shared";
import { eventData } from "../infra/event.schema";

export type CreateEventLeadInput = {
  leadId: string;
  eventDate?: string;
  location?: string;
  eventType?: string;
  guestCount?: number;
  budget?: string;
};

export type UpdateEventLeadInput = {
  id: string;
  eventDate?: string | null;
  location?: string | null;
  eventType?: string | null;
  guestCount?: number | null;
  budget?: string | null;
};

export async function upsertEventLead(input: CreateEventLeadInput) {
  const [row] = await db
    .insert(eventData)
    .values({
      leadId: input.leadId,
      eventDate: input.eventDate ?? null,
      location: input.location ?? null,
      eventType: input.eventType ?? null,
      guestCount: input.guestCount ?? null,
      budget: input.budget ?? null,
    })
    .returning();

  return row;
}

export async function getEventLeads() {
  return db.select().from(eventData).orderBy(desc(eventData.createdAt));
}

export async function updateEventLead(input: UpdateEventLeadInput) {
  const [row] = await db
    .update(eventData)
    .set({
      eventDate: input.eventDate ?? null,
      location: input.location ?? null,
      eventType: input.eventType ?? null,
      guestCount: input.guestCount ?? null,
      budget: input.budget ?? null,
    })
    .where(eq(eventData.id, input.id))
    .returning();

  if (!row) {
    throw new Error("Event lead not found");
  }

  return row;
}
