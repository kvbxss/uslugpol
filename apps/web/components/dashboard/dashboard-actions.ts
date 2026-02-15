"use server";

import {
  createOpportunity,
  decideOpportunity,
  intakeLead,
} from "@repo/core";
import {
  getCarLeadByLeadId,
  upsertCarLead,
  updateCarLead,
} from "@repo/car-service";
import { updateEventLead } from "@repo/event-service";
import { revalidatePath } from "next/cache";
import { initializeModules } from "../../src/bootstrap";

const DEFAULT_RETURN_PATH = "/";

function getText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getReturnPath(formData: FormData): string {
  return getText(formData, "returnPath") || DEFAULT_RETURN_PATH;
}

function toNullableText(value: FormDataEntryValue | null): string | null {
  const parsed = String(value ?? "").trim();
  return parsed ? parsed : null;
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    return null;
  }
  const numeric = Number(parsed);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function createLeadAction(formData: FormData) {
  initializeModules();

  const channel = getText(formData, "channel") || "form";
  const category = getText(formData, "category");
  const location = getText(formData, "location");
  const description = getText(formData, "description");
  const returnPath = getReturnPath(formData);

  if (!description) {
    return;
  }

  const categoryOverride =
    category === "cleaning" || category === "event" || category === "car"
      ? category
      : undefined;

  if (channel === "phone") {
    await intakeLead({
      channel: "phone",
      category: categoryOverride,
      raw: {
        note: description,
        callerPhone: "manual",
        location: location || "nie podano",
      },
    });
  } else if (channel === "email") {
    await intakeLead({
      channel: "email",
      category: categoryOverride,
      raw: {
        from: "client@manual.local",
        subject: "Przyjecie z panelu",
        message: description,
        location: location || "nie podano",
      },
    });
  } else {
    await intakeLead({
      channel: "form",
      category: categoryOverride,
      raw: {
        serviceHint: categoryOverride,
        location: location || "nie podano",
        description,
      },
    });
  }

  revalidatePath(returnPath);
}

export async function reportOpportunityAction(formData: FormData) {
  initializeModules();

  const leadId = getText(formData, "leadId");
  const passengersRaw = getText(formData, "passengers");
  const passengers = Number(passengersRaw);
  const returnPath = getReturnPath(formData);

  if (!leadId) {
    return;
  }

  const reason =
    Number.isFinite(passengers) && passengers > 0
      ? `Informacja z modulu event: potrzebujemy transportu dla ${passengers} osob.`
      : "Informacja z modulu event: potrzebujemy transportu.";

  await createOpportunity({
    leadId,
    targetService: "car",
    reason,
  });

  revalidatePath(returnPath);
}

export async function decideOpportunityAction(formData: FormData) {
  initializeModules();

  const opportunityId = getText(formData, "opportunityId");
  const decision = getText(formData, "decision");
  const returnPath = getReturnPath(formData);

  if (!opportunityId) {
    return;
  }
  if (decision !== "accepted" && decision !== "rejected") {
    return;
  }

  const opportunity = await decideOpportunity(opportunityId, decision, "car-ui");
  if (decision === "accepted") {
    const existingCarLead = await getCarLeadByLeadId(opportunity.leadId);
    if (!existingCarLead) {
      await upsertCarLead({
        leadId: opportunity.leadId,
      });
    }
  }

  revalidatePath(returnPath);
}

export async function updateEventLeadAction(formData: FormData) {
  initializeModules();

  const id = getText(formData, "id");
  const returnPath = getReturnPath(formData);
  if (!id) {
    return;
  }

  await updateEventLead({
    id,
    eventDate: toNullableText(formData.get("eventDate")),
    location: toNullableText(formData.get("location")),
    eventType: toNullableText(formData.get("eventType")),
    guestCount: toNullableNumber(formData.get("guestCount")),
    budget: toNullableText(formData.get("budget")),
  });

  revalidatePath(returnPath);
}

export async function updateCarLeadAction(formData: FormData) {
  initializeModules();

  const id = getText(formData, "id");
  const returnPath = getReturnPath(formData);
  if (!id) {
    return;
  }

  await updateCarLead({
    id,
    vehicleType: toNullableText(formData.get("vehicleType")),
    passengers: toNullableNumber(formData.get("passengers")),
    distanceKm: toNullableNumber(formData.get("distanceKm")),
    pickupLocation: toNullableText(formData.get("pickupLocation")),
  });

  revalidatePath(returnPath);
}
