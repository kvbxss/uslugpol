import type { LeadCategory, OpportunityDetectedPayload } from "@repo/shared";

type LeadForRules = {
  id: string;
  category: LeadCategory;
  location: string;
  description: string | null;
};

function extractDistanceKm(input: string) {
  const match = input.match(/(\d+)\s*km/i);
  return match ? Number(match[1]) : null;
}

export function detectCrossSellOpportunities(lead: LeadForRules): OpportunityDetectedPayload[] {
  if (lead.category !== "event") {
    return [];
  }

  const descriptionDistance = lead.description ? extractDistanceKm(lead.description) : null;
  const locationDistance = extractDistanceKm(lead.location);
  const distanceKm = descriptionDistance ?? locationDistance;

  if (distanceKm === null || distanceKm <= 50) {
    return [];
  }

  return [
    {
      leadId: lead.id,
      targetService: "car",
      reason: `Event distance ${distanceKm}km is above 50km.`,
    },
  ];
}
