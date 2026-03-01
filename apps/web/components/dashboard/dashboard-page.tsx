import {
  getLeads,
  getOpportunities,
  getOpportunitiesByTargetService,
} from "@repo/core";
import { getCarLeads } from "@repo/car-service";
import { getEventLeads } from "@repo/event-service";
import { can, type AuthContext } from "@/lib/auth/clerk-auth";
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

type DashboardAccess = {
  canViewCore: boolean;
  canViewEvent: boolean;
  canViewCar: boolean;
};

async function loadDashboardData(access: DashboardAccess) {
  initializeModules();

  type LeadsResult = Awaited<ReturnType<typeof getLeads>>;
  type OpportunitiesResult = Awaited<ReturnType<typeof getOpportunities>>;
  type EventLeadsResult = Awaited<ReturnType<typeof getEventLeads>>;
  type CarOpportunitiesResult = Awaited<
    ReturnType<typeof getOpportunitiesByTargetService>
  >;
  type CarLeadsResult = Awaited<ReturnType<typeof getCarLeads>>;

  const leadsPromise: Promise<LeadsResult> = access.canViewCore
    ? getLeads()
    : Promise.resolve([]);
  const opportunitiesPromise: Promise<OpportunitiesResult> = access.canViewCore
    ? getOpportunities()
    : Promise.resolve([]);
  const eventLeadsPromise: Promise<EventLeadsResult> = access.canViewEvent
    ? getEventLeads()
    : Promise.resolve([]);
  const carOpportunitiesPromise: Promise<CarOpportunitiesResult> =
    access.canViewCar ? getOpportunitiesByTargetService("car") : Promise.resolve([]);
  const carLeadsPromise: Promise<CarLeadsResult> = access.canViewCar
    ? getCarLeads()
    : Promise.resolve([]);

  const [leads, opportunities, eventLeads, carOpportunities, carLeads] =
    await Promise.all([
      leadsPromise,
      opportunitiesPromise,
      eventLeadsPromise,
      carOpportunitiesPromise,
      carLeadsPromise,
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
  authContext,
  isAddLeadOpen,
  editEventId,
  editCarId,
  basePath,
}: {
  authContext: AuthContext;
  isAddLeadOpen: boolean;
  editEventId?: string;
  editCarId?: string;
  basePath: string;
}) {
  const canViewCore = can(authContext, "module.core.view");
  const canViewEvent = can(authContext, "module.event.view");
  const canViewCar = can(authContext, "module.car.view");
  const canViewCleaning = can(authContext, "module.cleaning.view");
  const canCreateLead = can(authContext, "lead.create");
  const canViewLeadDetails = can(authContext, "lead.view");
  const canReportOpportunity = can(
    authContext,
    "module.event.report_opportunity",
  );
  const canUpdateEventLead = can(authContext, "module.event.update");
  const canUpdateCarLead = can(authContext, "module.car.update");
  const canDecideCarOpportunity = can(
    authContext,
    "module.car.decide_opportunity",
  );

  const { leads, opportunities, eventLeads, carOpportunities, carLeads } =
    await loadDashboardData({
      canViewCore,
      canViewEvent,
      canViewCar,
    });

  const stats = buildDashboardStats(leads, opportunities);
  const selectedEventLead = canUpdateEventLead
    ? selectById(eventLeads, editEventId)
    : null;
  const selectedCarLead = canUpdateCarLead ? selectById(carLeads, editCarId) : null;
  const shouldShowAddLeadModal = isAddLeadOpen && canCreateLead;
  const isModalOpen = Boolean(
    shouldShowAddLeadModal || selectedEventLead || selectedCarLead,
  );

  return (
    <main className="bw-layout">
      <DashboardSidebar
        roleLabel={authContext.roleLabel}
        displayName={authContext.displayName}
      />

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

        {canViewCore ? (
          <CoreModule
            basePath={basePath}
            roleLabel={authContext.roleLabel}
            canCreateLead={canCreateLead}
            canViewLeadDetails={canViewLeadDetails}
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
        ) : null}

        <div className="bw-right-column">
          {canViewEvent ? (
            <EventModule
              basePath={basePath}
              roleLabel={authContext.roleLabel}
              canEditEventLead={canUpdateEventLead}
              canReportOpportunity={canReportOpportunity}
              eventLeads={eventLeads.map((lead) => ({
                id: lead.id,
                leadId: lead.leadId,
              }))}
              reportOpportunityAction={reportOpportunityAction}
            />
          ) : null}
          {canViewCar ? (
            <CarModule
              basePath={basePath}
              roleLabel={authContext.roleLabel}
              canEditCarLead={canUpdateCarLead}
              canDecideOpportunity={canDecideCarOpportunity}
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
          ) : null}
          {canViewCleaning ? (
            <CleaningModule roleLabel={authContext.roleLabel} />
          ) : null}
        </div>

        {isModalOpen ? (
          <div className="bw-content-backdrop" aria-hidden />
        ) : null}

        {shouldShowAddLeadModal ? (
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
