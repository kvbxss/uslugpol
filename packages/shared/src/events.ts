import type { LeadCategory, LeadChannel, LeadStatus } from "./types";

export const EventNames = {
  LeadCreated: "core.lead.created",
  LeadStatusChanged: "core.lead.status_changed",
  OpportunityDetected: "core.opportunity.detected",
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

export type LeadCreatedPayload = {
  leadId: string;
  category: LeadCategory;
  channel: LeadChannel;
  location: string;
  description: string | null;
  status: LeadStatus;
};

export type LeadStatusChangedPayload = {
  leadId: string;
  category: LeadCategory;
  from: LeadStatus;
  to: LeadStatus;
};

export type OpportunityDetectedPayload = {
  leadId: string;
  targetService: LeadCategory;
  reason: string;
};

export type EventPayloadMap = {
  [EventNames.LeadCreated]: LeadCreatedPayload;
  [EventNames.LeadStatusChanged]: LeadStatusChangedPayload;
  [EventNames.OpportunityDetected]: OpportunityDetectedPayload;
};
