import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { buildDashboardHref } from "./dashboard-url";

type ModuleFocus = "all" | "core" | "event" | "car" | "cleaning";

export function DashboardSidebar({
  basePath,
  navigationQuery,
  activeFocus,
  roleLabel,
  displayName,
}: {
  basePath: string;
  navigationQuery?: string;
  activeFocus: ModuleFocus;
  roleLabel: string;
  displayName: string;
}) {
  const navItems = [
    {
      id: "core",
      label: "Modul Core",
      panelId: "core-panel",
    },
    {
      id: "event",
      label: "Modul Event",
      panelId: "event-panel",
    },
    {
      id: "cleaning",
      label: "Modul Sprzatanie",
      panelId: "cleaning-panel",
    },
    {
      id: "car",
      label: "Modul Transport",
      panelId: "car-panel",
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
              const href = `${buildDashboardHref(basePath, navigationQuery, {
                focus: itemFocus,
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
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
