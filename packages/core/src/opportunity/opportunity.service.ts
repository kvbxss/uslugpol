import { desc, eq } from "drizzle-orm";
import type { LeadCategory } from "@repo/shared";
import { db } from "../infra/db";
import { opportunities } from "../infra/core.schema";

export type CreateOpportunityInput = {
  leadId: string;
  targetService: LeadCategory;
  reason: string;
};

export async function createOpportunity(input: CreateOpportunityInput) {
  const [row] = await db
    .insert(opportunities)
    .values({
      leadId: input.leadId,
      targetService: input.targetService,
      reason: input.reason,
      status: "open",
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create opportunity");
  }

  return row;
}

export async function getLeadOpportunities(leadId: string) {
  return db
    .select()
    .from(opportunities)
    .where(eq(opportunities.leadId, leadId))
    .orderBy(desc(opportunities.createdAt));
}
