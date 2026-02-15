import { intakeLead, type LeadIntakeInput } from "@repo/core";
import { initializeModules } from "@/src/bootstrap";

initializeModules();

export async function POST(req: Request) {
  const body = (await req.json()) as LeadIntakeInput;
  const lead = await intakeLead(body);
  return Response.json(lead, { status: 201 });
}
