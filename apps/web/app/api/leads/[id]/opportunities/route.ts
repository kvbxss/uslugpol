import { getLeadOpportunities } from "@repo/core";
import { initializeModules } from "../../../../../src/bootstrap";

initializeModules();

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const rows = await getLeadOpportunities(id);
  return Response.json(rows);
}

