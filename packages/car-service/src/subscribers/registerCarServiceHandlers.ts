import { eventBus, EventNames, type LeadCreatedPayload } from "@repo/shared";
import { upsertCarLead } from "../application/carLead.service";

export function registerCarServiceHandlers() {
  eventBus.subscribe(EventNames.LeadCreated, async (payload: LeadCreatedPayload) => {
    if (payload.category !== "car") {
      return;
    }

    await upsertCarLead({
      leadId: payload.leadId,
    });
  });
}
