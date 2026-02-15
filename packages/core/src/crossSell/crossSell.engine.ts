import type { LeadCategory, OpportunityDetectedPayload } from "@repo/shared";

type LeadForRules = {
  id: string;
  category: LeadCategory;
  location: string;
  description: string | null;
};

const OFFICE_CITY = (process.env.USLUGPOL_OFFICE_CITY ?? "Krakow").trim();
const DISTANCE_THRESHOLD_KM = 50;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractDistanceKm(input: string) {
  const match = input.match(/(\d+)\s*km/i);
  return match ? Number(match[1]) : null;
}

function hasOfficeContext(input: string): boolean {
  const text = normalize(input);
  const office = normalize(OFFICE_CITY);

  return (
    text.includes("od miasta") ||
    text.includes("od biura") ||
    text.includes(`od ${office}`) ||
    text.includes("od siedziby")
  );
}

export function detectCrossSellOpportunities(lead: LeadForRules): OpportunityDetectedPayload[] {
  if (lead.category !== "event") {
    return [];
  }

  const descriptionDistance =
    lead.description && hasOfficeContext(lead.description)
      ? extractDistanceKm(lead.description)
      : null;
  const locationDistance = hasOfficeContext(lead.location)
    ? extractDistanceKm(lead.location)
    : null;
  const distanceKm = descriptionDistance ?? locationDistance;

  if (distanceKm === null || distanceKm <= DISTANCE_THRESHOLD_KM) {
    return [];
  }

  return [
    {
      leadId: lead.id,
      targetService: "car",
      reason: `Event is ${distanceKm}km from UslugPOL office (${OFFICE_CITY}), above ${DISTANCE_THRESHOLD_KM}km.`,
    },
  ];
}
