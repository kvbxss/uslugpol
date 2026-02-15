type LeadWithStatus = {
  status: string;
};

type OpportunityWithCreatedAt = {
  createdAt: Date | null;
};

export function formatDashboardDate(value: Date | null): string {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function buildDashboardStats(
  leads: LeadWithStatus[],
  opportunities: OpportunityWithCreatedAt[],
) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    newCount: leads.filter((lead) => lead.status === "new").length,
    qualifiedCount: leads.filter((lead) => lead.status === "qualified").length,
    convertedCount: leads.filter((lead) => lead.status === "converted").length,
    opportunitiesToday: opportunities.filter((item) =>
      item.createdAt ? item.createdAt.toISOString().slice(0, 10) === today : false,
    ).length,
  };
}

export function selectById<T extends { id: string }>(
  rows: T[],
  id?: string,
): T | null {
  if (!id) {
    return null;
  }
  return rows.find((row) => row.id === id) ?? null;
}
