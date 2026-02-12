import type { LeadCategory, LeadStatus } from "./types";

export const EventNames = {
  LeadCreated: "core.lead.created",
  LeadQualified: "core.lead.qualified",
  OpportunityDetected: "core.opportunity.detected",
  LeadEnriched: "module.lead.enriched",
  OpportunitySuggested: "module.opportunity.suggested",
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

export type LeadCreatedPayload = {
  leadId: string;
  category: LeadCategory;
  location: string;
  description: string | null;
  status: LeadStatus;
};

export type LeadQualifiedPayload = {
  leadId: string;
  category: LeadCategory;
};

export type OpportunityDetectedPayload = {
  leadId: string;
  targetService: LeadCategory;
  reason: string;
};

