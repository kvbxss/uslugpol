import { createLead } from "@repo/core";
import { initializeModules } from "../../../src/bootstrap";

initializeModules();

export async function POST(req: Request) {
  const body = await req.json();
  const lead = await createLead(body);
  return Response.json(lead);
}
