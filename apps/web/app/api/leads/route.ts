import { createLead } from "@repo/core";

export async function POST(req: Request) {
  const body = await req.json();
  const lead = await createLead(body);
  return Response.json(lead);
}
