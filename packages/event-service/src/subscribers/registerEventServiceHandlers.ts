import { eventBus, EventNames, type LeadCreatedPayload } from "@repo/shared";
import { upsertEventLead } from "../application/eventLead.service";

export function registerEventServiceHandlers() {
  eventBus.subscribe(EventNames.LeadCreated, async (payload: LeadCreatedPayload) => {
    if (payload.category !== "event") {
      return;
    }

    await upsertEventLead({
      leadId: payload.leadId,
    });
  });
}
