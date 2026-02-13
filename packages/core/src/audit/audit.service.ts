import { db } from "../infra/db";
import { auditLog } from "../infra/core.schema";

export async function logAudit(eventType: string, payload: unknown) {
  await db.insert(auditLog).values({
    eventType,
    payload: payload as Record<string, unknown>,
  });
}

