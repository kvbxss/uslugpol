import Link from "next/link";
import {
  AlarmClock,
  ArrowUpRight,
  BarChart3,
  Filter,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

type ModuleFocus = "all" | "core" | "event" | "car" | "cleaning";

type LeadItem = {
  id: string;
  category: string;
  channel: string;
  location: string;
  status: string;
  description: string | null;
  createdAt: Date | null;
};

type OpportunityItem = {
  id: string;
  leadId: string;
  targetService: string;
  reason: string;
  status: string;
  createdAt: Date | null;
};

type EventLeadItem = {
  id: string;
  leadId: string;
  eventDate: string | null;
  location: string | null;
  guestCount: number | null;
};

type CarLeadItem = {
  id: string;
  leadId: string;
  vehicleType: string | null;
  passengers: number | null;
  pickupLocation: string | null;
};

type MonthlyBucket = {
  label: string;
  baseCount: number;
  progressCount: number;
  crossSellCount: number;
  total: number;
};

function toPct(part: number, total: number) {
  if (!total) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

function getFirstName(displayName: string) {
  const [name] = displayName.trim().split(/\s+/);
  return name || "Operator";
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildMonthlyBuckets(
  leads: LeadItem[],
  opportunities: OpportunityItem[],
): MonthlyBucket[] {
  const now = new Date();
  const entries = Array.from({ length: 6 }, (_, index) => {
    const monthOffset = 5 - index;
    const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const key = monthKey(start);
    return {
      key,
      label: start
        .toLocaleString("pl-PL", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
      baseCount: 0,
      progressCount: 0,
      crossSellCount: 0,
    };
  });

  const buckets = new Map<string, (typeof entries)[number]>(
    entries.map((entry) => [entry.key, entry]),
  );

  for (const lead of leads) {
    if (!lead.createdAt) {
      continue;
    }
    const bucket = buckets.get(monthKey(lead.createdAt));
    if (!bucket) {
      continue;
    }
    if (lead.status === "new") {
      bucket.baseCount += 1;
      continue;
    }
    bucket.progressCount += 1;
  }

  for (const opportunity of opportunities) {
    if (!opportunity.createdAt) {
      continue;
    }
    const bucket = buckets.get(monthKey(opportunity.createdAt));
    if (!bucket) {
      continue;
    }
    bucket.crossSellCount += 1;
  }

  return entries.map((entry) => ({
    label: entry.label,
    baseCount: entry.baseCount,
    progressCount: entry.progressCount,
    crossSellCount: entry.crossSellCount,
    total: entry.baseCount + entry.progressCount + entry.crossSellCount,
  }));
}

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function toModuleLabel(value: string) {
  if (value === "event") {
    return "event";
  }
  if (value === "car") {
    return "transport";
  }
  if (value === "cleaning") {
    return "sprzatanie";
  }
  return "core";
}

function toChannelLabel(value: string) {
  if (value === "email") {
    return "e-mail";
  }
  if (value === "phone") {
    return "telefon";
  }
  return "formularz";
}

export function DashboardCommandCenter({
  basePath,
  displayName,
  roleLabel,
  canCreateLead,
  moduleFocus,
  searchQuery,
  windowDays,
  leads,
  opportunities,
  eventLeads,
  carLeads,
}: {
  basePath: string;
  displayName: string;
  roleLabel: string;
  canCreateLead: boolean;
  moduleFocus: ModuleFocus;
  searchQuery: string;
  windowDays: 7 | 30 | 90;
  leads: LeadItem[];
  opportunities: OpportunityItem[];
  eventLeads: EventLeadItem[];
  carLeads: CarLeadItem[];
}) {
  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - windowDays);

  const leadsInWindow = leads.filter((lead) =>
    lead.createdAt ? lead.createdAt >= rangeStart : false,
  );
  const opportunitiesInWindow = opportunities.filter((item) =>
    item.createdAt ? item.createdAt >= rangeStart : false,
  );

  const openOpportunities = opportunities.filter((item) => item.status === "open");
  const qualifiedOrConverted = leads.filter(
    (lead) => lead.status === "qualified" || lead.status === "converted",
  );
  const estimatedPipelineValue = leads.reduce((sum, lead) => {
    if (lead.status === "converted") {
      return sum + 5400;
    }
    if (lead.status === "qualified") {
      return sum + 3100;
    }
    return sum + 1200;
  }, 0);

  const conversionRate = toPct(qualifiedOrConverted.length, leads.length);

  const passengerEntries = carLeads.filter(
    (lead): lead is CarLeadItem & { passengers: number } =>
      typeof lead.passengers === "number",
  );
  const avgPassengers = passengerEntries.length
    ? Math.round(
        passengerEntries.reduce((sum, lead) => sum + lead.passengers, 0) /
          passengerEntries.length,
      )
    : 0;

  const completeEventLeads = eventLeads.filter(
    (lead) => Boolean(lead.eventDate) && Boolean(lead.location) && Boolean(lead.guestCount),
  ).length;
  const completeCarLeads = carLeads.filter(
    (lead) =>
      Boolean(lead.vehicleType) &&
      Boolean(lead.pickupLocation) &&
      typeof lead.passengers === "number" &&
      lead.passengers > 0,
  ).length;

  const eventCompleteness = toPct(completeEventLeads, eventLeads.length);
  const carCompleteness = toPct(completeCarLeads, carLeads.length);

  const monthlyBuckets = buildMonthlyBuckets(leads, opportunities);
  const maxMonthlyTotal = Math.max(
    1,
    ...monthlyBuckets.map((bucket) => bucket.total),
  );

  const staleLeads = leads.filter((lead) => {
    if (!lead.createdAt) {
      return false;
    }
    return lead.status === "new" && lead.createdAt < rangeStart;
  });

  const quickContacts = leads.slice(0, 5).map((lead) => ({
    id: lead.id,
    title: `Lead ${lead.id.slice(0, 6).toUpperCase()}`,
    subtitle: `${toModuleLabel(lead.category)} | ${toChannelLabel(lead.channel)}`,
    meta: lead.location,
    initial: lead.category.slice(0, 1).toUpperCase(),
  }));

  const actionItems = [
    {
      id: "opportunities-open",
      label: "Otwarte okazje",
      value: openOpportunities.length,
      hint: "Wymagaja decyzji zespolu",
      href: "car",
      panelId: "car-panel",
    },
    {
      id: "stale-leads",
      label: "Leady bez progresu",
      value: staleLeads.length,
      hint: `Nowe leady starsze niz ${windowDays} dni`,
      href: "core",
      panelId: "core-panel",
    },
    {
      id: "event-quality",
      label: "Jakosc danych event",
      value: eventCompleteness,
      hint: "Odsetek kompletnych rekordow",
      href: "event",
      panelId: "event-panel",
      suffix: "%",
    },
  ];

  const focusParam = moduleFocus === "all" ? undefined : moduleFocus;
  const windowParam = windowDays === 30 ? undefined : String(windowDays);
  const searchParam = searchQuery.trim() || undefined;
  const addLeadHref = buildHref(basePath, {
    q: searchParam,
    focus: focusParam,
    window: windowParam,
    addLead: "1",
  });
  const getModuleHref = (
    focus: Exclude<ModuleFocus, "all">,
    panelId: string,
  ) =>
    `${buildHref(basePath, {
      q: searchParam,
      focus,
      window: windowParam,
    })}#${panelId}`;
  const fullLeadListHref = getModuleHref("core", "core-panel");
  const dataAuditHref = getModuleHref("event", "event-panel");
  const recommendationsHref = getModuleHref("core", "core-panel");

  return (
    <section
      id="bw-command-center"
      className="bw-command-center"
      aria-label="Rozszerzony dashboard"
    >
      <Card className="bw-cc-toolbar-card">
        <CardContent className="bw-cc-toolbar-content">
          <div className="bw-cc-greeting">
            <p className="bw-cc-kicker">Centrum dowodzenia</p>
            <h2>Czesc, {getFirstName(displayName)}!</h2>
            <p>{todayLabel}</p>
          </div>

          <form action={basePath} method="get" className="bw-cc-toolbar-form">
            <div className="bw-cc-search-wrap">
              <Search className="bw-cc-search-icon" size={16} aria-hidden />
              <Input
                name="q"
                defaultValue={searchQuery}
                className="bw-cc-search-input"
                placeholder="Szukaj po ID, lokalizacji lub opisie"
                aria-label="Szukaj w dashboardzie"
              />
            </div>

            <label className="bw-cc-inline-field">
              <Filter size={15} aria-hidden />
              <select name="focus" defaultValue={moduleFocus} className="bw-cc-select">
                <option value="all">Wszystkie moduly</option>
                <option value="core">core</option>
                <option value="event">event</option>
                <option value="car">transport</option>
                <option value="cleaning">sprzatanie</option>
              </select>
            </label>

            <label className="bw-cc-inline-field">
              <AlarmClock size={15} aria-hidden />
              <select
                name="window"
                defaultValue={String(windowDays)}
                className="bw-cc-select"
              >
                <option value="7">7 dni</option>
                <option value="30">30 dni</option>
                <option value="90">90 dni</option>
              </select>
            </label>

            <Button size="sm" type="submit">
              Filtruj
            </Button>
            <Link href={basePath}>
              <Button size="sm" variant="outline" type="button">
                Resetuj
              </Button>
            </Link>

            {canCreateLead ? (
              <Link href={addLeadHref}>
                <Button size="sm" variant="outline" type="button">
                  + Szybki lead
                </Button>
              </Link>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="bw-cc-main-grid">
        <div className="bw-cc-left-stack">
          <Card className="bw-cc-info-card">
            <CardHeader>
              <CardTitle className="bw-cc-card-title">
                <TrendingUp size={16} aria-hidden />
                Puls portfela
              </CardTitle>
            </CardHeader>
            <CardContent className="bw-cc-info-content">
              <p className="bw-cc-kpi">{formatCurrency(estimatedPipelineValue)}</p>
              <p className="bw-cc-kpi-meta">
                Szacowana wartosc pipeline przy roli: {roleLabel.toLowerCase()}
              </p>
              <div className="bw-cc-stat-row">
                <span>Skutecznosc kwalifikacji</span>
                <strong>{conversionRate}%</strong>
              </div>
              <div className="bw-cc-stat-row">
                <span>Otwarte okazje</span>
                <strong>{openOpportunities.length}</strong>
              </div>
              <div className="bw-cc-stat-row">
                <span>Srednia liczba osob (transport)</span>
                <strong>{avgPassengers || "-"}</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="bw-cc-actions-card">
            <CardHeader>
              <CardTitle className="bw-cc-card-title">
                <Target size={16} aria-hidden />
                Kolejka zadan
              </CardTitle>
            </CardHeader>
            <CardContent className="bw-cc-actions-content">
              <ul className="bw-cc-actions-list">
                {actionItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={getModuleHref(
                        item.href as Exclude<ModuleFocus, "all">,
                        item.panelId,
                      )}
                      className="bw-cc-action-link"
                    >
                      <div>
                        <p>{item.label}</p>
                        <span>{item.hint}</span>
                      </div>
                      <strong>
                        {item.value}
                        {item.suffix ?? ""}
                      </strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bw-cc-upgrade-card">
            <CardContent className="bw-cc-upgrade-content">
              <p className="bw-cc-upgrade-title">Strumien usprawnien</p>
              <p>
                Dashboard dziala juz jako centrum dowodzenia: analityka + kolejka zadan
                + filtry runtime.
              </p>
              <Badge variant="info" className="bw-cc-upgrade-badge">
                aktywne usprawnienie
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bw-cc-growth-card">
          <CardHeader className="bw-cc-growth-header">
            <div>
              <CardTitle className="bw-cc-card-title">
                <BarChart3 size={16} aria-hidden />
                Dynamika pipeline
              </CardTitle>
              <p className="bw-cc-growth-subtitle">
                Ostatnie 6 miesiecy. Zakres aktywnosci: {windowDays} dni.
              </p>
            </div>
            <div className="bw-cc-growth-meta">
              <span>
                +{leadsInWindow.length} leadow
              </span>
              <span>
                +{opportunitiesInWindow.length} okazji
              </span>
            </div>
          </CardHeader>
          <CardContent className="bw-cc-growth-content">
            <div className="bw-cc-growth-legend">
              <span>
                <i className="bw-cc-dot bw-cc-dot-base" />
                Start
              </span>
              <span>
                <i className="bw-cc-dot bw-cc-dot-progress" />
                Kwalifikacja
              </span>
              <span>
                <i className="bw-cc-dot bw-cc-dot-cross" />
                Okazje
              </span>
            </div>

            <div className="bw-cc-bars">
              {monthlyBuckets.map((bucket) => {
                const stackHeight = Math.max(
                  64,
                  64 + Math.round((bucket.total / maxMonthlyTotal) * 134),
                );

                return (
                  <div key={bucket.label} className="bw-cc-bar-col">
                    <div className="bw-cc-stack" style={{ height: `${stackHeight}px` }}>
                      {bucket.total ? (
                        <>
                          {bucket.baseCount ? (
                            <div
                              className="bw-cc-segment bw-cc-segment-base"
                              style={{ flexGrow: bucket.baseCount }}
                              aria-hidden
                            />
                          ) : null}
                          {bucket.progressCount ? (
                            <div
                              className="bw-cc-segment bw-cc-segment-progress"
                              style={{ flexGrow: bucket.progressCount }}
                              aria-hidden
                            />
                          ) : null}
                          {bucket.crossSellCount ? (
                            <div
                              className="bw-cc-segment bw-cc-segment-cross"
                              style={{ flexGrow: bucket.crossSellCount }}
                              aria-hidden
                            />
                          ) : null}
                        </>
                      ) : (
                        <div className="bw-cc-segment-empty" aria-hidden />
                      )}
                    </div>
                    <p>{bucket.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bw-cc-bottom-grid">
        <Card className="bw-cc-contacts-card">
          <CardHeader className="bw-cc-list-header">
            <CardTitle className="bw-cc-card-title">
              <Users size={16} aria-hidden />
              Ostatnie leady
            </CardTitle>
            <Link href={fullLeadListHref} className="bw-cc-inline-link">
              Pelna lista
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="bw-cc-contact-list">
              {quickContacts.length ? (
                quickContacts.map((contact) => (
                  <li key={contact.id}>
                    <div className="bw-cc-avatar">{contact.initial}</div>
                    <div className="bw-cc-contact-meta">
                      <p>{contact.title}</p>
                      <span>{contact.subtitle}</span>
                    </div>
                    <small>{contact.meta}</small>
                  </li>
                ))
              ) : (
                <li className="bw-cc-contact-empty">Brak leadow do pokazania.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="bw-cc-health-card">
          <CardHeader className="bw-cc-list-header">
            <CardTitle className="bw-cc-card-title">
              <Sparkles size={16} aria-hidden />
              Kondycja danych
            </CardTitle>
            <Link href={dataAuditHref} className="bw-cc-inline-link">
              Audyt danych
            </Link>
          </CardHeader>
          <CardContent className="bw-cc-health-content">
            <div className="bw-cc-health-item">
              <p>Kompletnosc event</p>
              <div className="bw-cc-meter">
                <span style={{ width: `${eventCompleteness}%` }} />
              </div>
              <strong>{eventCompleteness}%</strong>
            </div>
            <div className="bw-cc-health-item">
              <p>Kompletnosc transport</p>
              <div className="bw-cc-meter">
                <span style={{ width: `${carCompleteness}%` }} />
              </div>
              <strong>{carCompleteness}%</strong>
            </div>
            <div className="bw-cc-health-item">
              <p>Konwersja core</p>
              <div className="bw-cc-meter">
                <span style={{ width: `${conversionRate}%` }} />
              </div>
              <strong>{conversionRate}%</strong>
            </div>
            <Link href={recommendationsHref} className="bw-cc-reco-link">
              Zobacz rekomendacje operacyjne <ArrowUpRight size={15} aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
