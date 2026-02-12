import { eventBus, EventNames, type LeadCreatedPayload, type OpportunityDetectedPayload } from "../../../shared/src";
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

  eventBus.subscribe(EventNames.OpportunityDetected, async (payload: OpportunityDetectedPayload) => {
    if (payload.targetService !== "car") {
      return;
    }

    await upsertCarLead({
      leadId: payload.leadId,
    });
  });
}

