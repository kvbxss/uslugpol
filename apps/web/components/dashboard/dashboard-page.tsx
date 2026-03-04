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
import { DashboardCommandCenter } from "./dashboard-command-center";
import { buildDashboardHref } from "./dashboard-url";
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

type ModuleFocus = "all" | "core" | "event" | "car" | "cleaning";
type WindowDays = 7 | 30 | 90;

type LeadResult = Awaited<ReturnType<typeof getLeads>>[number];
type OpportunityResult = Awaited<ReturnType<typeof getOpportunities>>[number];
type EventLeadResult = Awaited<ReturnType<typeof getEventLeads>>[number];
type CarLeadResult = Awaited<ReturnType<typeof getCarLeads>>[number];
type CarOpportunityResult = Awaited<
  ReturnType<typeof getOpportunitiesByTargetService>
>[number];

function normalizeModuleFocus(value?: string): ModuleFocus {
  if (value === "core") {
    return "core";
  }
  if (value === "event") {
    return "event";
  }
  if (value === "car") {
    return "car";
  }
  if (value === "cleaning") {
    return "cleaning";
  }
  return "all";
}

function normalizeWindowDays(value?: string): WindowDays {
  if (value === "7") {
    return 7;
  }
  if (value === "90") {
    return 90;
  }
  return 30;
}

function normalizeQuery(value?: string) {
  return (value ?? "").trim();
}

function includesQuery(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function matchesLeadQuery(lead: LeadResult, query: string) {
  return (
    includesQuery(lead.id, query) ||
    includesQuery(lead.location, query) ||
    includesQuery(lead.description, query) ||
    includesQuery(lead.category, query) ||
    includesQuery(lead.channel, query) ||
    includesQuery(lead.status, query)
  );
}

function matchesOpportunityQuery(opportunity: OpportunityResult, query: string) {
  return (
    includesQuery(opportunity.id, query) ||
    includesQuery(opportunity.leadId, query) ||
    includesQuery(opportunity.reason, query) ||
    includesQuery(opportunity.targetService, query) ||
    includesQuery(opportunity.status, query)
  );
}

function matchesEventLeadQuery(lead: EventLeadResult, query: string) {
  return (
    includesQuery(lead.id, query) ||
    includesQuery(lead.leadId, query) ||
    includesQuery(lead.location, query) ||
    includesQuery(lead.eventType, query) ||
    includesQuery(lead.eventDate, query) ||
    includesQuery(String(lead.guestCount ?? ""), query)
  );
}

function matchesCarLeadQuery(lead: CarLeadResult, query: string) {
  return (
    includesQuery(lead.id, query) ||
    includesQuery(lead.leadId, query) ||
    includesQuery(lead.pickupLocation, query) ||
    includesQuery(lead.vehicleType, query) ||
    includesQuery(String(lead.passengers ?? ""), query) ||
    includesQuery(String(lead.distanceKm ?? ""), query)
  );
}

function matchesCarOpportunityQuery(
  opportunity: CarOpportunityResult,
  query: string,
) {
  return (
    includesQuery(opportunity.id, query) ||
    includesQuery(opportunity.leadId, query) ||
    includesQuery(opportunity.reason, query) ||
    includesQuery(opportunity.status, query)
  );
}

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
  searchQuery,
  moduleFocus,
  windowParam,
}: {
  authContext: AuthContext;
  isAddLeadOpen: boolean;
  editEventId?: string;
  editCarId?: string;
  basePath: string;
  searchQuery?: string;
  moduleFocus?: string;
  windowParam?: string;
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

  const normalizedQuery = normalizeQuery(searchQuery);
  const activeQuery = normalizedQuery.toLowerCase();
  const activeFocus = normalizeModuleFocus(moduleFocus);
  const activeWindowDays = normalizeWindowDays(windowParam);
  const navigationQuery = new URLSearchParams(
    [
      normalizedQuery ? ["q", normalizedQuery] : null,
      activeFocus !== "all" ? ["focus", activeFocus] : null,
      activeWindowDays !== 30 ? ["window", String(activeWindowDays)] : null,
    ].filter((entry): entry is [string, string] => Boolean(entry)),
  ).toString();
  const returnPath = buildDashboardHref(basePath, navigationQuery);

  const filteredLeads = activeQuery
    ? leads.filter((lead) => matchesLeadQuery(lead, activeQuery))
    : leads;
  const filteredOpportunities = activeQuery
    ? opportunities.filter((item) => matchesOpportunityQuery(item, activeQuery))
    : opportunities;
  const filteredEventLeads = activeQuery
    ? eventLeads.filter((lead) => matchesEventLeadQuery(lead, activeQuery))
    : eventLeads;
  const filteredCarLeads = activeQuery
    ? carLeads.filter((lead) => matchesCarLeadQuery(lead, activeQuery))
    : carLeads;
  const filteredCarOpportunities = activeQuery
    ? carOpportunities.filter((item) => matchesCarOpportunityQuery(item, activeQuery))
    : carOpportunities;

  const stats = buildDashboardStats(filteredLeads, filteredOpportunities);
  const selectedEventLead = canUpdateEventLead
    ? selectById(eventLeads, editEventId)
    : null;
  const selectedCarLead = canUpdateCarLead ? selectById(carLeads, editCarId) : null;
  const shouldShowAddLeadModal = isAddLeadOpen && canCreateLead;
  const isModalOpen = Boolean(
    shouldShowAddLeadModal || selectedEventLead || selectedCarLead,
  );
  const showCore = canViewCore && (activeFocus === "all" || activeFocus === "core");
  const showEvent = canViewEvent && (activeFocus === "all" || activeFocus === "event");
  const showCar = canViewCar && (activeFocus === "all" || activeFocus === "car");
  const showCleaning =
    canViewCleaning && (activeFocus === "all" || activeFocus === "cleaning");
  const showRightColumn = showEvent || showCar || showCleaning;
  const convertedLeadCount = filteredLeads.filter(
    (lead) => lead.status === "converted",
  ).length;
  const sidebarConversionRate = filteredLeads.length
    ? Math.round((convertedLeadCount / filteredLeads.length) * 100)
    : 0;
  const sidebarOpenOpportunities = filteredOpportunities.filter(
    (item) => item.status === "open",
  ).length;
  const shouldOpenOperationalPanels =
    activeFocus !== "all" || shouldShowAddLeadModal || Boolean(selectedEventLead) || Boolean(selectedCarLead);

  return (
    <main className="bw-layout">
      <DashboardSidebar
        basePath={basePath}
        navigationQuery={navigationQuery}
        activeFocus={activeFocus}
        summary={{
          leadCount: filteredLeads.length,
          openOpportunityCount: sidebarOpenOpportunities,
          conversionRate: sidebarConversionRate,
        }}
        roleLabel={authContext.roleLabel}
        displayName={authContext.displayName}
      />

      <section className="bw-content">
        <DashboardCommandCenter
          basePath={basePath}
          displayName={authContext.displayName}
          roleLabel={authContext.roleLabel}
          canCreateLead={canCreateLead}
          moduleFocus={activeFocus}
          searchQuery={normalizedQuery}
          windowDays={activeWindowDays}
          leads={filteredLeads.map((lead) => ({
            id: lead.id,
            category: lead.category,
            channel: lead.channel,
            location: lead.location,
            status: lead.status,
            description: lead.description,
            createdAt: lead.createdAt,
          }))}
          opportunities={filteredOpportunities.map((item) => ({
            id: item.id,
            leadId: item.leadId,
            targetService: item.targetService,
            reason: item.reason,
            status: item.status,
            createdAt: item.createdAt,
          }))}
          eventLeads={filteredEventLeads.map((lead) => ({
            id: lead.id,
            leadId: lead.leadId,
            eventDate: lead.eventDate,
            location: lead.location,
            guestCount: lead.guestCount,
          }))}
          carLeads={filteredCarLeads.map((lead) => ({
            id: lead.id,
            leadId: lead.leadId,
            vehicleType: lead.vehicleType,
            passengers: lead.passengers,
            pickupLocation: lead.pickupLocation,
          }))}
        />

        <details className="bw-ops-shell" open={shouldOpenOperationalPanels}>
          <summary className="bw-ops-summary">
            <span>Panele operacyjne</span>
            <small>Core, Event, Transport, Sprzatanie</small>
          </summary>
          <div className="bw-ops-grid">
            {showCore ? (
              <div className={showRightColumn ? "bw-core-slot" : "bw-core-slot bw-core-slot-full"}>
                <CoreModule
                  basePath={basePath}
                  navigationQuery={navigationQuery}
                  roleLabel={authContext.roleLabel}
                  canCreateLead={canCreateLead}
                  canViewLeadDetails={canViewLeadDetails}
                  stats={stats}
                  leads={filteredLeads.slice(0, 8).map((lead) => ({
                    id: lead.id,
                    category: lead.category,
                    channel: lead.channel,
                    location: lead.location,
                    status: lead.status,
                    createdAtLabel: formatDashboardDate(lead.createdAt),
                  }))}
                  opportunities={filteredOpportunities.slice(0, 8).map((item) => ({
                    id: item.id,
                    leadId: item.leadId,
                    targetService: item.targetService,
                    reason: item.reason,
                    status: item.status,
                  }))}
                />
              </div>
            ) : null}

            {showRightColumn ? (
              <div
                className={
                  showCore ? "bw-right-column" : "bw-right-column bw-right-column-full"
                }
              >
                {showEvent ? (
                  <EventModule
                    basePath={basePath}
                    navigationQuery={navigationQuery}
                    returnPath={returnPath}
                    roleLabel={authContext.roleLabel}
                    canEditEventLead={canUpdateEventLead}
                    canReportOpportunity={canReportOpportunity}
                    eventLeads={filteredEventLeads.map((lead) => ({
                      id: lead.id,
                      leadId: lead.leadId,
                    }))}
                    reportOpportunityAction={reportOpportunityAction}
                  />
                ) : null}
                {showCar ? (
                  <CarModule
                    basePath={basePath}
                    navigationQuery={navigationQuery}
                    returnPath={returnPath}
                    roleLabel={authContext.roleLabel}
                    canEditCarLead={canUpdateCarLead}
                    canDecideOpportunity={canDecideCarOpportunity}
                    carLeads={filteredCarLeads.map((lead) => ({
                      id: lead.id,
                      leadId: lead.leadId,
                      passengers: lead.passengers,
                      pickupLocation: lead.pickupLocation,
                    }))}
                    carOpportunities={filteredCarOpportunities.map((item) => ({
                      id: item.id,
                      leadId: item.leadId,
                      reason: item.reason,
                      status: item.status,
                    }))}
                    decideOpportunityAction={decideOpportunityAction}
                  />
                ) : null}
                {showCleaning ? (
                  <CleaningModule roleLabel={authContext.roleLabel} />
                ) : null}
              </div>
            ) : null}

            {!showCore && !showRightColumn ? (
              <div className="bw-focus-empty">
                Brak paneli dla wybranego filtra i uprawnien.
              </div>
            ) : null}
          </div>
        </details>

        {isModalOpen ? (
          <div className="bw-content-backdrop" aria-hidden />
        ) : null}

        {shouldShowAddLeadModal ? (
          <AddLeadModal
            returnPath={returnPath}
            createLeadAction={createLeadAction}
          />
        ) : null}

        {selectedEventLead ? (
          <EditEventLeadModal
            returnPath={returnPath}
            eventLead={selectedEventLead}
            updateEventLeadAction={updateEventLeadAction}
          />
        ) : null}

        {selectedCarLead ? (
          <EditCarLeadModal
            returnPath={returnPath}
            carLead={selectedCarLead}
            updateCarLeadAction={updateCarLeadAction}
          />
        ) : null}
      </section>
    </main>
  );
}
