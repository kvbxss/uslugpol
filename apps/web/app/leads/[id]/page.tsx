import {
  convertLead,
  getLeadById,
  getLeadOpportunities,
  qualifyLead,
} from "@repo/core";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initializeModules } from "@/src/bootstrap";

type Params = {
  id: string;
};

function mapLeadStatus(status: string) {
  if (status === "new") return "nowy";
  if (status === "qualified") return "zakwalifikowany";
  if (status === "converted") return "skonwertowany";
  return status;
}

function mapOpportunityStatus(status: string) {
  if (status === "open") return "otwarta";
  if (status === "accepted") return "zaakceptowana";
  if (status === "rejected") return "odrzucona";
  return status;
}

function mapCategory(category: string) {
  if (category === "event") return "event";
  if (category === "car") return "transport";
  if (category === "cleaning") return "sprzatanie";
  return category;
}

function mapChannel(channel: string) {
  if (channel === "form") return "formularz";
  if (channel === "email") return "e-mail";
  if (channel === "phone") return "telefon";
  return channel;
}

async function updateStatusAction(formData: FormData) {
  "use server";
  initializeModules();

  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");
  const changedBy = String(formData.get("changedBy") ?? "ui-user");

  if (status === "qualified") {
    await qualifyLead(leadId, { changedBy });
  }

  if (status === "converted") {
    await convertLead(leadId, { changedBy });
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  initializeModules();

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) {
    notFound();
  }

  const opportunities = await getLeadOpportunities(lead.id);

  return (
    <main className="dashboard-shell lead-shell">
      <Link className="link lead-back-link" href="/">
        Powrot do dashboardu
      </Link>

      <header className="lead-hero">
        <p className="lead-kicker">Szczegoly leada</p>
        <h1 className="lead-title">
          {mapCategory(lead.category)} #{lead.id.slice(0, 8)}
        </h1>
        <p className="lead-subtitle">Kontrola statusu i okazji cross-sell dla pojedynczego rekordu.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
          <CardDescription>
            Podstawowe informacje i zmiana statusu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="detail-grid">
            <div className="detail-item">
              <dt>ID</dt>
              <dd>{lead.id}</dd>
            </div>
            <div className="detail-item">
              <dt>Kategoria</dt>
              <dd>{mapCategory(lead.category)}</dd>
            </div>
            <div className="detail-item">
              <dt>Status</dt>
              <dd>
                <Badge>{mapLeadStatus(lead.status)}</Badge>
              </dd>
            </div>
            <div className="detail-item">
              <dt>Kanal</dt>
              <dd>{mapChannel(lead.channel)}</dd>
            </div>
            <div className="detail-item">
              <dt>Lokalizacja</dt>
              <dd>{lead.location}</dd>
            </div>
            <div className="detail-item">
              <dt>Opis</dt>
              <dd>{lead.description ?? "-"}</dd>
            </div>
            <div className="detail-item">
              <dt>Zrodlo</dt>
              <dd>{lead.source ? JSON.stringify(lead.source) : "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zmien status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateStatusAction} className="status-form">
            <input type="hidden" name="leadId" value={lead.id} />
            <Input
              name="changedBy"
              placeholder="kto zmienia"
              defaultValue="ui-user"
            />
            <div className="status-actions">
              {lead.status === "new" ? (
                <Button type="submit" name="status" value="qualified">
                  nowy do zakwalifikowanego
                </Button>
              ) : null}
              {lead.status === "qualified" ? (
                <Button
                  type="submit"
                  name="status"
                  value="converted"
                  variant="outline"
                >
                  zakwalifikowany do skonwertowanego
                </Button>
              ) : null}
              {lead.status === "converted" ? (
                <p className="muted">Lead jest juz skonwertowany. Brak kolejnych przejsc.</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Okazje</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list">
            {opportunities.map((item) => (
              <li key={item.id} className="list-item">
                <div className="row-between">
                  <strong>{mapCategory(item.targetService)}</strong>
                  <Badge>{mapOpportunityStatus(item.status)}</Badge>
                </div>
                <p className="muted">{item.reason}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
