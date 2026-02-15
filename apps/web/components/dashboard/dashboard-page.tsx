import {
  getLeads,
  getOpportunities,
  getOpportunitiesByTargetService,
} from "@repo/core";
import { getCarLeads } from "@repo/car-service";
import { getEventLeads } from "@repo/event-service";
import { initializeModules } from "../../src/bootstrap";
import {
  createLeadAction,
  decideOpportunityAction,
  reportOpportunityAction,
  updateCarLeadAction,
  updateEventLeadAction,
} from "./dashboard-actions";
import {
  buildDashboardStats,
  formatDashboardDate,
  selectById,
} from "./dashboard-helpers";
import {
  AddLeadModal,
  EditCarLeadModal,
  EditEventLeadModal,
} from "./dashboard-modals";
import { CarModule } from "./modules/car-module";
import { CleaningModule } from "./modules/cleaning-module";
import { CoreModule } from "./modules/core-module";
import { EventModule } from "./modules/event-module";
import { DashboardSidebar } from "./sidebar";

async function loadDashboardData() {
  initializeModules();

  const [leads, opportunities, eventLeads, carOpportunities, carLeads] =
    await Promise.all([
      getLeads(),
      getOpportunities(),
      getEventLeads(),
      getOpportunitiesByTargetService("car"),
      getCarLeads(),
    ]);

  return {
    leads,
    opportunities,
    eventLeads,
    carOpportunities,
    carLeads,
  };
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
  const { leads, opportunities, eventLeads, carOpportunities, carLeads } =
    await loadDashboardData();

  const stats = buildDashboardStats(leads, opportunities);
  const selectedEventLead = selectById(eventLeads, editEventId);
  const selectedCarLead = selectById(carLeads, editCarId);
  const isModalOpen = Boolean(
    isAddLeadOpen || selectedEventLead || selectedCarLead,
  );

  return (
    <main className="bw-layout">
      <DashboardSidebar />

      <section className="bw-content">
        <div className="bw-hero">
          <div>
            <p className="bw-hero-kicker">Orkiestracja leadow</p>
            <h1 className="bw-hero-title">Centrum operacyjne</h1>
            <p className="bw-hero-subtitle">
              Jeden widok do kontroli Core oraz poszczegolnych modulow.
            </p>
          </div>
          <div className="bw-chip-list" aria-label="Kluczowe metryki">
            <span className="bw-chip">
              Nowe <strong>{stats.newCount}</strong>
            </span>
            <span className="bw-chip">
              Zakwalifikowane <strong>{stats.qualifiedCount}</strong>
            </span>
            <span className="bw-chip">
              Skonwertowane <strong>{stats.convertedCount}</strong>
            </span>
            <span className="bw-chip">
              Dzis <strong>{stats.opportunitiesToday}</strong>
            </span>
          </div>
        </div>

        <CoreModule
          basePath={basePath}
          stats={stats}
          leads={leads.slice(0, 6).map((lead) => ({
            id: lead.id,
            category: lead.category,
            channel: lead.channel,
            location: lead.location,
            status: lead.status,
            createdAtLabel: formatDashboardDate(lead.createdAt),
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
            eventLeads={eventLeads.map((lead) => ({
              id: lead.id,
              leadId: lead.leadId,
            }))}
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

        {isModalOpen ? (
          <div className="bw-content-backdrop" aria-hidden />
        ) : null}

        {isAddLeadOpen ? (
          <AddLeadModal
            basePath={basePath}
            createLeadAction={createLeadAction}
          />
        ) : null}

        {selectedEventLead ? (
          <EditEventLeadModal
            basePath={basePath}
            eventLead={selectedEventLead}
            updateEventLeadAction={updateEventLeadAction}
          />
        ) : null}

        {selectedCarLead ? (
          <EditCarLeadModal
            basePath={basePath}
            carLead={selectedCarLead}
            updateCarLeadAction={updateCarLeadAction}
          />
        ) : null}
      </section>
    </main>
  );
}
