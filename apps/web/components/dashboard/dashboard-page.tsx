import {
  createOpportunity,
  decideOpportunity,
  getLeads,
  getOpportunities,
  getOpportunitiesByTargetService,
  intakeLead,
} from "@repo/core";
import { getCarLeadByLeadId, getCarLeads, upsertCarLead, updateCarLead } from "@repo/car-service";
import { getEventLeads, updateEventLead } from "@repo/event-service";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { initializeModules } from "../../src/bootstrap";
import { CarModule } from "./modules/car-module";
import { CleaningModule } from "./modules/cleaning-module";
import { CoreModule } from "./modules/core-module";
import { EventModule } from "./modules/event-module";
import { DashboardSidebar } from "./sidebar";

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function toNullableText(value: FormDataEntryValue | null): string | null {
  const parsed = String(value ?? "").trim();
  return parsed ? parsed : null;
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    return null;
  }
  const numeric = Number(parsed);
  return Number.isFinite(numeric) ? numeric : null;
}

async function createLeadAction(formData: FormData) {
  "use server";
  initializeModules();

  const channel = String(formData.get("channel") ?? "form");
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? "/");

  if (!description) {
    return;
  }

  const categoryOverride =
    category === "cleaning" || category === "event" || category === "car"
      ? category
      : undefined;

  if (channel === "phone") {
    await intakeLead({
      channel: "phone",
      category: categoryOverride,
      raw: {
        note: description,
        callerPhone: "manual",
        location: location || "nie podano",
      },
    });
  } else if (channel === "email") {
    await intakeLead({
      channel: "email",
      category: categoryOverride,
      raw: {
        from: "client@manual.local",
        subject: "Dashboard intake",
        message: description,
        location: location || "nie podano",
      },
    });
  } else {
    await intakeLead({
      channel: "form",
      category: categoryOverride,
      raw: {
        serviceHint: categoryOverride,
        location: location || "nie podano",
        description,
      },
    });
  }

  revalidatePath(returnPath);
}

async function reportOpportunityAction(formData: FormData) {
  "use server";
  initializeModules();

  const leadId = String(formData.get("leadId") ?? "").trim();
  const passengersRaw = String(formData.get("passengers") ?? "").trim();
  const passengers = Number(passengersRaw);
  const returnPath = String(formData.get("returnPath") ?? "/");

  if (!leadId) {
    return;
  }

  const reason =
    Number.isFinite(passengers) && passengers > 0
      ? `Feedback modulu event: potrzebujemy transportu dla ${passengers} osob.`
      : "Feedback modulu event: potrzebujemy transportu.";

  await createOpportunity({
    leadId,
    targetService: "car",
    reason,
  });

  revalidatePath(returnPath);
}

async function decideOpportunityAction(formData: FormData) {
  "use server";
  initializeModules();

  const opportunityId = String(formData.get("opportunityId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? "/");

  if (!opportunityId) {
    return;
  }
  if (decision !== "accepted" && decision !== "rejected") {
    return;
  }

  const opportunity = await decideOpportunity(opportunityId, decision, "car-ui");
  if (decision === "accepted") {
    const existingCarLead = await getCarLeadByLeadId(opportunity.leadId);
    if (!existingCarLead) {
      await upsertCarLead({
        leadId: opportunity.leadId,
      });
    }
  }

  revalidatePath(returnPath);
}

async function updateEventLeadAction(formData: FormData) {
  "use server";
  initializeModules();

  const id = String(formData.get("id") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? "/");
  if (!id) {
    return;
  }

  await updateEventLead({
    id,
    eventDate: toNullableText(formData.get("eventDate")),
    location: toNullableText(formData.get("location")),
    eventType: toNullableText(formData.get("eventType")),
    guestCount: toNullableNumber(formData.get("guestCount")),
    budget: toNullableText(formData.get("budget")),
  });

  revalidatePath(returnPath);
}

async function updateCarLeadAction(formData: FormData) {
  "use server";
  initializeModules();

  const id = String(formData.get("id") ?? "").trim();
  const returnPath = String(formData.get("returnPath") ?? "/");
  if (!id) {
    return;
  }

  await updateCarLead({
    id,
    vehicleType: toNullableText(formData.get("vehicleType")),
    passengers: toNullableNumber(formData.get("passengers")),
    distanceKm: toNullableNumber(formData.get("distanceKm")),
    pickupLocation: toNullableText(formData.get("pickupLocation")),
  });

  revalidatePath(returnPath);
}

export async function DashboardPage({
  isAddLeadOpen,
  editEventId,
  editCarId,
  basePath,
}: {
  isAddLeadOpen: boolean;
  editEventId?: string;
  editCarId?: string;
  basePath: string;
}) {
  initializeModules();
  const [leads, opportunities, eventLeads, carOpportunities, carLeads] = await Promise.all([
    getLeads(),
    getOpportunities(),
    getEventLeads(),
    getOpportunitiesByTargetService("car"),
    getCarLeads(),
  ]);

  const stats = {
    newCount: leads.filter((lead) => lead.status === "new").length,
    qualifiedCount: leads.filter((lead) => lead.status === "qualified").length,
    convertedCount: leads.filter((lead) => lead.status === "converted").length,
    opportunitiesToday: opportunities.filter((item) =>
      item.createdAt ? item.createdAt.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) : false,
    ).length,
  };

  const selectedEventLead = editEventId ? eventLeads.find((lead) => lead.id === editEventId) : null;
  const selectedCarLead = editCarId ? carLeads.find((lead) => lead.id === editCarId) : null;

  return (
    <main className="bw-layout">
      <DashboardSidebar />

      <section className="bw-content">
        <CoreModule
          basePath={basePath}
          stats={stats}
          leads={leads.slice(0, 6).map((lead) => ({
            id: lead.id,
            category: lead.category,
            channel: lead.channel,
            location: lead.location,
            status: lead.status,
            createdAtLabel: formatDate(lead.createdAt),
          }))}
          opportunities={opportunities.slice(0, 4).map((item) => ({
            id: item.id,
            leadId: item.leadId,
            targetService: item.targetService,
            reason: item.reason,
            status: item.status,
          }))}
        />

        <div className="bw-right-column">
          <EventModule
            basePath={basePath}
            eventLeads={eventLeads.map((lead) => ({ id: lead.id, leadId: lead.leadId }))}
            reportOpportunityAction={reportOpportunityAction}
          />
          <CarModule
            basePath={basePath}
            carLeads={carLeads.map((lead) => ({
              id: lead.id,
              leadId: lead.leadId,
              passengers: lead.passengers,
              pickupLocation: lead.pickupLocation,
            }))}
            carOpportunities={carOpportunities.map((item) => ({
              id: item.id,
              leadId: item.leadId,
              reason: item.reason,
              status: item.status,
            }))}
            decideOpportunityAction={decideOpportunityAction}
          />
          <CleaningModule />
        </div>

        {isAddLeadOpen ? (
          <Card className="bw-modal-card">
            <CardHeader>
              <CardTitle>Dodaj lead</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createLeadAction} className="lead-form">
                <input type="hidden" name="returnPath" value={basePath} />
                <label className="field">
                  <span>Kanal</span>
                  <Select name="channel" defaultValue="form">
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kanal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">form</SelectItem>
                      <SelectItem value="email">email</SelectItem>
                      <SelectItem value="phone">phone</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="field">
                  <span>Kategoria</span>
                  <Select name="category" defaultValue="event">
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">event</SelectItem>
                      <SelectItem value="car">car</SelectItem>
                      <SelectItem value="cleaning">cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="field">
                  <span>Lokalizacja</span>
                  <Input name="location" defaultValue="Krakow" />
                </label>
                <label className="field">
                  <span>Opis</span>
                  <Textarea name="description" defaultValue="Corporate party in Krakow" />
                </label>
                <div className="bw-modal-actions">
                  <Link href={basePath}>
                    <Button type="button" variant="outline">
                      Anuluj
                    </Button>
                  </Link>
                  <Button type="submit">Utworz lead</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {selectedEventLead ? (
          <Card className="bw-modal-card">
            <CardHeader>
              <CardTitle>Edytuj lead event</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateEventLeadAction} className="lead-form">
                <input type="hidden" name="id" value={selectedEventLead.id} />
                <input type="hidden" name="returnPath" value={basePath} />
                <label className="field">
                  <span>Data eventu</span>
                  <Input type="date" name="eventDate" defaultValue={selectedEventLead.eventDate ?? ""} />
                </label>
                <label className="field">
                  <span>Lokalizacja eventu</span>
                  <Input name="location" defaultValue={selectedEventLead.location ?? ""} />
                </label>
                <label className="field">
                  <span>Typ eventu</span>
                  <Input name="eventType" defaultValue={selectedEventLead.eventType ?? ""} />
                </label>
                <label className="field">
                  <span>Liczba gosci</span>
                  <Input type="number" name="guestCount" defaultValue={selectedEventLead.guestCount ?? ""} />
                </label>
                <label className="field">
                  <span>Budzet</span>
                  <Input type="number" step="0.01" name="budget" defaultValue={selectedEventLead.budget ?? ""} />
                </label>
                <div className="bw-modal-actions">
                  <Link href={basePath}>
                    <Button type="button" variant="outline">
                      Anuluj
                    </Button>
                  </Link>
                  <Button type="submit">Zapisz</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {selectedCarLead ? (
          <Card className="bw-modal-card">
            <CardHeader>
              <CardTitle>Edytuj lead car</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateCarLeadAction} className="lead-form">
                <input type="hidden" name="id" value={selectedCarLead.id} />
                <input type="hidden" name="returnPath" value={basePath} />
                <label className="field">
                  <span>Typ pojazdu</span>
                  <Input name="vehicleType" defaultValue={selectedCarLead.vehicleType ?? ""} />
                </label>
                <label className="field">
                  <span>Liczba osob</span>
                  <Input type="number" name="passengers" defaultValue={selectedCarLead.passengers ?? ""} />
                </label>
                <label className="field">
                  <span>Dystans (km)</span>
                  <Input type="number" name="distanceKm" defaultValue={selectedCarLead.distanceKm ?? ""} />
                </label>
                <label className="field">
                  <span>Miejsce odbioru</span>
                  <Input name="pickupLocation" defaultValue={selectedCarLead.pickupLocation ?? ""} />
                </label>
                <div className="bw-modal-actions">
                  <Link href={basePath}>
                    <Button type="button" variant="outline">
                      Anuluj
                    </Button>
                  </Link>
                  <Button type="submit">Zapisz</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
