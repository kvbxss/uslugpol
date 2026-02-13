import {
  EventNames,
  type LeadCategory,
  type LeadStatus,
  type LeadCreatedPayload,
  type LeadStatusChangedPayload,
} from "@repo/shared";
import { eq } from "drizzle-orm";
import { logAudit } from "../audit/audit.service";
import { detectCrossSellOpportunities } from "../crossSell/crossSell.engine";
import { getCoreEventBus } from "../events/domainEventBus";
import { db } from "../infra/db";
import { leads } from "../infra/core.schema";
import { createOpportunity } from "../opportunity/opportunity.service";

export type CreateLeadInput = {
  category: LeadCategory;
  location: string;
  description?: string;
};

type AuditActor = {
  changedBy: string;
};

type LeadRow = typeof leads.$inferSelect;

const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
  new: ["qualified"],
  qualified: ["converted"],
  converted: [],
};

function toLeadStatus(status: string): LeadStatus {
  if (status === "new" || status === "qualified" || status === "converted") {
    return status;
  }
  throw new Error(`Invalid lead status: ${status}`);
}

function toLeadCategory(category: string): LeadCategory {
  if (category === "cleaning" || category === "event" || category === "car") {
    return category;
  }
  throw new Error(`Invalid lead category: ${category}`);
}

async function updateLeadStatus(
  leadId: string,
  nextStatus: LeadStatus,
  actor: AuditActor,
): Promise<{ row: LeadRow; from: LeadStatus; to: LeadStatus; changedBy: string }> {
  const [current] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!current) {
    throw new Error("Lead not found");
  }

  const currentStatus = toLeadStatus(current.status);
  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`Invalid transition ${currentStatus} -> ${nextStatus}`);
  }

  const [updated] = await db
    .update(leads)
    .set({ status: nextStatus })
    .where(eq(leads.id, leadId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update lead status");
  }

  return {
    row: updated,
    from: currentStatus,
    to: nextStatus,
    changedBy: actor.changedBy,
  };
}

export async function createLead(input: CreateLeadInput) {
  const eventBus = getCoreEventBus();
  const [row] = await db
    .insert(leads)
    .values({
      category: input.category,
      location: input.location,
      description: input.description ?? null,
      status: "new",
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create lead");
  }

  const payload: LeadCreatedPayload = {
    leadId: row.id,
    category: toLeadCategory(row.category),
    location: row.location,
    description: row.description ?? null,
    status: toLeadStatus(row.status),
  };

  await eventBus.publish(EventNames.LeadCreated, payload);
  await logAudit(EventNames.LeadCreated, payload);

  return row;
}

export async function qualifyLead(leadId: string, actor: AuditActor) {
  const eventBus = getCoreEventBus();
  const transition = await updateLeadStatus(leadId, "qualified", actor);
  const payload: LeadStatusChangedPayload = {
    leadId: transition.row.id,
    category: toLeadCategory(transition.row.category),
    from: transition.from,
    to: transition.to,
  };

  await eventBus.publish(EventNames.LeadStatusChanged, payload);
  await logAudit(EventNames.LeadStatusChanged, {
    ...payload,
    changedBy: transition.changedBy,
  });

  const opportunities = detectCrossSellOpportunities({
    id: transition.row.id,
    category: payload.category,
    location: transition.row.location,
    description: transition.row.description,
  });

  for (const opportunity of opportunities) {
    const savedOpportunity = await createOpportunity({
      leadId: opportunity.leadId,
      targetService: opportunity.targetService,
      reason: opportunity.reason,
    });

    await eventBus.publish(EventNames.OpportunityDetected, opportunity);
    await logAudit(EventNames.OpportunityDetected, {
      ...opportunity,
      opportunityId: savedOpportunity.id,
    });
  }

  return transition.row;
}

export async function convertLead(leadId: string, actor: AuditActor) {
  const eventBus = getCoreEventBus();
  const transition = await updateLeadStatus(leadId, "converted", actor);
  const payload: LeadStatusChangedPayload = {
    leadId: transition.row.id,
    category: toLeadCategory(transition.row.category),
    from: transition.from,
    to: transition.to,
  };

  await eventBus.publish(EventNames.LeadStatusChanged, payload);
  await logAudit(EventNames.LeadStatusChanged, {
    ...payload,
    changedBy: transition.changedBy,
  });

  return transition.row;
}
