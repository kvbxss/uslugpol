import { db } from "../../../shared/src/db";
import { transportRequests } from "../infra/car.schema";

export type CreateCarLeadInput = {
  leadId: string;
  vehicleType?: string;
  passengers?: number;
  distanceKm?: number;
  pickupLocation?: string;
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

