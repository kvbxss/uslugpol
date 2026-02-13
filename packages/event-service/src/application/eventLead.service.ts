import { db } from "@repo/shared";
import { eventData } from "../infra/event.schema";

export type CreateEventLeadInput = {
  leadId: string;
  eventDate?: string;
  guestCount?: number;
  budget?: string;
};

export async function upsertEventLead(input: CreateEventLeadInput) {
  const [row] = await db
    .insert(eventData)
    .values({
      leadId: input.leadId,
      eventDate: input.eventDate ?? null,
      guestCount: input.guestCount ?? null,
      budget: input.budget ?? null,
    })
    .returning();

  return row;
}
