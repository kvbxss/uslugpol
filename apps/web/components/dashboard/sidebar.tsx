import Link from "next/link";
import {
  Activity,
  Blocks,
  Bus,
  Gauge,
  LayoutDashboard,
  Sparkles,
  Sparkle,
  SprayCan,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { buildDashboardHref } from "./dashboard-url";

type ModuleFocus = "all" | "core" | "event" | "car" | "cleaning";

export function DashboardSidebar({
  basePath,
  navigationQuery,
  activeFocus,
  summary,
  roleLabel,
  displayName,
}: {
  basePath: string;
  navigationQuery?: string;
  activeFocus: ModuleFocus;
  summary: {
    leadCount: number;
    openOpportunityCount: number;
    conversionRate: number;
  };
  roleLabel: string;
  displayName: string;
}) {
  const navItems = [
    {
      id: "all",
      label: "Command Center",
      panelId: "bw-command-center",
      icon: LayoutDashboard,
    },
    {
      id: "core",
      label: "Modul Core",
      panelId: "core-panel",
      icon: Blocks,
    },
    {
      id: "event",
      label: "Modul Event",
      panelId: "event-panel",
      icon: Sparkles,
    },
    {
      id: "cleaning",
      label: "Modul Sprzatanie",
      panelId: "cleaning-panel",
      icon: SprayCan,
    },
    {
      id: "car",
      label: "Modul Transport",
      panelId: "car-panel",
      icon: Bus,
    },
  ] as const;

  return (
    <aside className="bw-sidebar">
      <div className="bw-sidebar-top">
        <Link href={buildDashboardHref(basePath, navigationQuery, { focus: undefined })}>
          <div className="bw-brand">
            <span className="bw-logo-dot" />
            <span>UslugPOL</span>
          </div>
        </Link>
        <p className="bw-brand-subtitle">Control Tower</p>

        <div className="bw-nav-group">
          <p className="bw-nav-label">Konteksty domenowe</p>
          <nav className="bw-nav">
            {navItems.map((item) => {
              const itemFocus = item.id;
              const Icon = item.icon;
              const href = `${buildDashboardHref(basePath, navigationQuery, {
                focus: itemFocus === "all" ? undefined : itemFocus,
              })}#${item.panelId}`;
              const isActive = activeFocus === itemFocus;

              return (
                <Link
                  key={item.id}
                  className={`bw-nav-item ${isActive ? "bw-nav-item-active" : ""}`}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="bw-nav-dot" />
                  <Icon size={14} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="bw-sidebar-metrics">
          <div className="bw-sidebar-metric">
            <p>
              <Gauge size={13} aria-hidden />
              Leady w widoku
            </p>
            <strong>{summary.leadCount}</strong>
          </div>
          <div className="bw-sidebar-metric">
            <p>
              <Activity size={13} aria-hidden />
              Otwarte okazje
            </p>
            <strong>{summary.openOpportunityCount}</strong>
          </div>
          <div className="bw-sidebar-metric">
            <p>
              <Sparkle size={13} aria-hidden />
              Conversion
            </p>
            <strong>{summary.conversionRate}%</strong>
          </div>
        </div>
      </div>

      <div className="bw-help-card">
        <p className="bw-help-title">{displayName}</p>
        <p className="bw-help-text">Rola: {roleLabel}</p>
        <p className="bw-help-meta">Status: online</p>
        <SignOutButton>
          <Button type="button" size="sm" className="mt-3 w-full">
            Wyloguj
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
