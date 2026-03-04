import { SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

export function DashboardSidebar({
  roleLabel,
  displayName,
}: {
  roleLabel: string;
  displayName: string;
}) {
  return (
    <aside className="bw-sidebar">
      <div className="bw-sidebar-top">
        <div className="bw-brand">
          <span className="bw-logo-dot" />
          <span>UslugPOL</span>
        </div>
        <p className="bw-brand-subtitle">Control Tower</p>

        <div className="bw-nav-group">
          <p className="bw-nav-label">Konteksty domenowe</p>
          <nav className="bw-nav">
            <a className="bw-nav-item bw-nav-item-active">
              <span className="bw-nav-dot" />
              Modul Core
            </a>
            <a className="bw-nav-item">
              <span className="bw-nav-dot" />
              Modul Event
            </a>
            <a className="bw-nav-item">
              <span className="bw-nav-dot" />
              Modul Sprzatanie
            </a>
            <a className="bw-nav-item">
              <span className="bw-nav-dot" />
              Modul Transport
            </a>
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
