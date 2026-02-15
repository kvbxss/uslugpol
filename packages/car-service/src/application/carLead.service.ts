import { desc, eq } from "drizzle-orm";
import { db } from "@repo/shared";
import { transportRequests } from "../infra/car.schema";

export type CreateCarLeadInput = {
  leadId: string;
  vehicleType?: string;
  passengers?: number;
  distanceKm?: number;
  pickupLocation?: string;
};

export type UpdateCarLeadInput = {
  id: string;
  vehicleType?: string | null;
  passengers?: number | null;
  distanceKm?: number | null;
  pickupLocation?: string | null;
};

export async function upsertCarLead(input: CreateCarLeadInput) {
  const [row] = await db
    .insert(transportRequests)
    .values({
      leadId: input.leadId,
      vehicleType: input.vehicleType ?? null,
      passengers: input.passengers ?? null,
      distanceKm: input.distanceKm ?? null,
      pickupLocation: input.pickupLocation ?? null,
    })
    .returning();

  return row;
}

export async function getCarLeads() {
  return db.select().from(transportRequests).orderBy(desc(transportRequests.createdAt));
}

export async function getCarLeadByLeadId(leadId: string) {
  const [row] = await db
    .select()
    .from(transportRequests)
    .where(eq(transportRequests.leadId, leadId));

  return row ?? null;
}

export async function updateCarLead(input: UpdateCarLeadInput) {
  const [row] = await db
    .update(transportRequests)
    .set({
      vehicleType: input.vehicleType ?? null,
      passengers: input.passengers ?? null,
      distanceKm: input.distanceKm ?? null,
      pickupLocation: input.pickupLocation ?? null,
    })
    .where(eq(transportRequests.id, input.id))
    .returning();

  if (!row) {
    throw new Error("Car lead not found");
  }

  return row;
}
