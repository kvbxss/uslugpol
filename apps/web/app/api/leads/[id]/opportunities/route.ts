import { getLeadOpportunities } from "@repo/core";
import { initializeModules } from "@/src/bootstrap";
import { requireApiPermission } from "@/lib/auth/clerk-auth";

initializeModules();

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const permission = await requireApiPermission("core.opportunity.view");
  if (!permission.ok) {
    return permission.response;
  }

  const { id } = await context.params;
  const rows = await getLeadOpportunities(id);
  return Response.json(rows);
}
