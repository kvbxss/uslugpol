import {
  EventNames,
  type LeadCategory,
  type LeadChannel,
  type LeadCreatedPayload,
  type LeadStatus,
  type LeadStatusChangedPayload,
} from "@repo/shared";
import { desc, eq } from "drizzle-orm";
import { logAudit } from "../audit/audit.service";
import { detectCrossSellOpportunities } from "../crossSell/crossSell.engine";
import { getCoreEventBus } from "../events/domainEventBus";
import { getDistanceFromOfficeKm } from "../geo/geo.service";
import { db } from "../infra/db";
import { leads } from "../infra/core.schema";
import { createOpportunity, getLeadOpportunities } from "../opportunity/opportunity.service";

export type CreateLeadInput = {
  category: LeadCategory;
  location: string;
  description?: string;
  channel?: LeadChannel;
  source?: Record<string, unknown> | null;
};

export type LeadIntakeInput = {
  channel: LeadChannel;
  raw: Record<string, unknown>;
  category?: LeadCategory;
};

type AuditActor = {
  changedBy: string;
};

type LeadRow = typeof leads.$inferSelect;

type NormalizedLead = {
  category: LeadCategory;
  location: string;
  description: string | null;
  source: Record<string, unknown>;
};

const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
  new: ["qualified"],
  qualified: ["converted"],
  converted: [],
};
const DISTANCE_THRESHOLD_KM = Number(process.env.USLUGPOL_DISTANCE_THRESHOLD_KM ?? "50");

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

function toLeadChannel(channel: string): LeadChannel {
  if (channel === "phone" || channel === "email" || channel === "form") {
    return channel;
  }
  throw new Error(`Invalid lead channel: ${channel}`);
}

function pickString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function categorize(text: string): LeadCategory {
  const t = text.toLowerCase();

  if (t.includes("wesele") || t.includes("konferencja") || t.includes("event")) {
    return "event";
  }

  if (t.includes("wynajem") || t.includes("auto") || t.includes("bus")) {
    return "car";
  }

  return "cleaning";
}

function normalizeIntake(input: LeadIntakeInput): NormalizedLead {
  const raw = input.raw ?? {};

  if (input.channel === "form") {
    const serviceHint = pickString(raw.serviceHint);
    const location = pickString(raw.location) ?? "niepodano";
    const description = pickString(raw.description) ?? null;

    const inferredCategory = serviceHint
      ? toLeadCategory(serviceHint)
      : categorize(`${location} ${description ?? ""}`);

    return {
      category: input.category ?? inferredCategory,
      location,
      description,
      source: raw,
    };
  }

  if (input.channel === "email") {
    const subject = pickString(raw.subject);
    const message = pickString(raw.message);
    const from = pickString(raw.from);
    const text = `${subject ?? ""} ${message ?? ""}`.trim();
    const location = pickString(raw.location) ?? "niepodano";
    const description = text || from || "Email intake";

    return {
      category: input.category ?? categorize(text || description),
      location,
      description,
      source: raw,
    };
  }

  const note = pickString(raw.note);
  const callerPhone = pickString(raw.callerPhone);
  const location = pickString(raw.location) ?? "niepodano";
  const description = note || callerPhone || "Phone intake";

  return {
    category: input.category ?? categorize(description),
    location,
    description,
    source: raw,
  };
}

async function insertLead(input: {
  category: LeadCategory;
  channel: LeadChannel;
  location: string;
  description: string | null;
  source: Record<string, unknown> | null;
}) {
  const [row] = await db
    .insert(leads)
    .values({
      category: input.category,
      channel: input.channel,
      location: input.location,
      description: input.description,
      source: input.source,
      status: "new",
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create lead");
  }

  return row;
}

async function publishLeadCreated(row: LeadRow) {
  const eventBus = getCoreEventBus();
  const payload: LeadCreatedPayload = {
    leadId: row.id,
    category: toLeadCategory(row.category),
    channel: toLeadChannel(row.channel),
    location: row.location,
    description: row.description ?? null,
    status: toLeadStatus(row.status),
  };

  await eventBus.publish(EventNames.LeadCreated, payload);
  await logAudit(EventNames.LeadCreated, payload);
}

async function detectAndPersistCrossSell(row: LeadRow) {
  const category = toLeadCategory(row.category);
  const eventBus = getCoreEventBus();
  const existing = await getLeadOpportunities(row.id);
  const existingTargets = new Set(existing.map((item) => item.targetService));

  const detected = detectCrossSellOpportunities({
    id: row.id,
    category,
    location: row.location,
    description: row.description,
  });

  for (const opportunity of detected) {
    if (existingTargets.has(opportunity.targetService)) {
      continue;
    }

    const savedOpportunity = await createOpportunity({
      leadId: opportunity.leadId,
      targetService: opportunity.targetService,
      reason: opportunity.reason,
    });
    existingTargets.add(opportunity.targetService);

    await eventBus.publish(EventNames.OpportunityDetected, opportunity);
    await logAudit(EventNames.OpportunityDetected, {
      ...opportunity,
      opportunityId: savedOpportunity.id,
    });
  }

  if (category !== "event" || existingTargets.has("car")) {
    return;
  }

  const distanceFromOfficeKm = await getDistanceFromOfficeKm(row.location);
  if (distanceFromOfficeKm === null || distanceFromOfficeKm <= DISTANCE_THRESHOLD_KM) {
    return;
  }

  const geoOpportunity = {
    leadId: row.id,
    targetService: "car" as const,
    reason: `Geolokalizacja: event w ${row.location} jest ok. ${distanceFromOfficeKm}km od biura, powyzej ${DISTANCE_THRESHOLD_KM}km.`,
  };

  const savedOpportunity = await createOpportunity({
    leadId: geoOpportunity.leadId,
    targetService: geoOpportunity.targetService,
    reason: geoOpportunity.reason,
  });

  await eventBus.publish(EventNames.OpportunityDetected, geoOpportunity);
  await logAudit(EventNames.OpportunityDetected, {
    ...geoOpportunity,
    opportunityId: savedOpportunity.id,
  });
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
  const row = await insertLead({
    category: input.category,
    channel: input.channel ?? "form",
    location: input.location,
    description: input.description ?? null,
    source: input.source ?? null,
  });

  await publishLeadCreated(row);
  await detectAndPersistCrossSell(row);
  return row;
}

export async function intakeLead(input: LeadIntakeInput) {
  const normalized = normalizeIntake(input);
  const row = await insertLead({
    category: normalized.category,
    channel: input.channel,
    location: normalized.location,
    description: normalized.description,
    source: normalized.source,
  });

  await publishLeadCreated(row);
  await detectAndPersistCrossSell(row);
  return row;
}

export async function getLeads() {
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadById(leadId: string) {
  const [row] = await db.select().from(leads).where(eq(leads.id, leadId));
  return row ?? null;
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
  await detectAndPersistCrossSell(transition.row);

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
