import { eventBus, EventNames, type LeadCategory, type LeadStatus } from "../../../shared/src";
import { db } from "../infra/db";
import { leads } from "../infra/core.schema";

export type CreateLeadInput = {
  category: LeadCategory;
  location: string;
  description?: string;
};

export async function createLead(input: CreateLeadInput) {
  const [row] = await db
    .insert(leads)
    .values({
      category: input.category,
      location: input.location,
      description: input.description ?? null,
      status: "new",
    })
    .returning();

  eventBus.publish(EventNames.LeadCreated, {
    leadId: row.id,
    category: row.category as LeadCategory,
    location: row.location,
    description: row.description ?? null,
    status: row.status as LeadStatus,
  });

  return row;
}
