import { db } from "../../../shared/src/db";
import { eventData } from "../infra/event.schema";

export type CreateEventLeadInput = {
  leadId: string;
  eventDate?: string;
  guestCount?: number;
  budget?: number;
  isOutdoor?: boolean;
};

export async function upsertEventLead(input: CreateEventLeadInput) {
  const [row] = await db
    .insert(eventData)
    .values({
      leadId: input.leadId,
      eventDate: input.eventDate ?? null,
      guestCount: input.guestCount ?? null,
      budget: input.budget ?? null,
      isOutdoor: input.isOutdoor ?? null,
    })
    .returning();

  return row;
}

