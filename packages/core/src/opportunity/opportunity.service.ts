import { and, desc, eq, ne } from "drizzle-orm";
import type { LeadCategory } from "@repo/shared";
import { db } from "../infra/db";
import { opportunities } from "../infra/core.schema";

export type CreateOpportunityInput = {
  leadId: string;
  targetService: LeadCategory;
  reason: string;
};

export type OpportunityStatus = "open" | "accepted" | "rejected";

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

export async function getOpportunities() {
  return db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
}

export async function getOpportunitiesByTargetService(targetService: LeadCategory) {
  return db
    .select()
    .from(opportunities)
    .where(
      and(eq(opportunities.targetService, targetService), ne(opportunities.status, "rejected")),
    )
    .orderBy(desc(opportunities.createdAt));
}

export async function decideOpportunity(
  opportunityId: string,
  status: Exclude<OpportunityStatus, "open">,
  decidedBy: string,
) {
  const [row] = await db
    .update(opportunities)
    .set({
      status,
      decidedAt: new Date(),
      decidedBy,
    })
    .where(eq(opportunities.id, opportunityId))
    .returning();

  if (!row) {
    throw new Error("Opportunity not found");
  }

  return row;
}
