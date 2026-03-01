import { convertLead, qualifyLead } from "@repo/core";
import { initializeModules } from "@/src/bootstrap";
import { requireApiPermission } from "@/lib/auth/clerk-auth";

initializeModules();

type StatusUpdateInput = {
  status: "qualified" | "converted";
  changedBy?: string;
};

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const permission = await requireApiPermission("lead.status.update");
  if (!permission.ok) {
    return permission.response;
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as StatusUpdateInput;
    const changedBy = body.changedBy ?? permission.context.userId;
    const actor = { changedBy };

    if (body.status === "qualified") {
      const lead = await qualifyLead(id, actor);
      return Response.json(lead);
    }

    if (body.status === "converted") {
      const lead = await convertLead(id, actor);
      return Response.json(lead);
    }

    return Response.json(
      { message: "Status must be qualified or converted." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Lead not found") {
      return Response.json({ message }, { status: 404 });
    }
    if (message.startsWith("Invalid transition")) {
      return Response.json({ message }, { status: 400 });
    }
    return Response.json({ message }, { status: 500 });
  }
}
