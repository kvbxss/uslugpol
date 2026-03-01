import { createLead } from "@repo/core";
import { initializeModules } from "@/src/bootstrap";
import { requireApiPermission } from "@/lib/auth/clerk-auth";

initializeModules();

export async function POST(req: Request) {
  const permission = await requireApiPermission("lead.create");
  if (!permission.ok) {
    return permission.response;
  }

  const body = await req.json();
  const lead = await createLead(body);
  return Response.json(lead);
}
