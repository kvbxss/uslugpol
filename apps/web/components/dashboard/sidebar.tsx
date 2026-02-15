export function DashboardSidebar() {
  return (
    <aside className="bw-sidebar">
      <div className="bw-brand">
        <span className="bw-logo-dot" />
        <span>UslugPOL</span>
      </div>
      <nav className="bw-nav">
        <a className="bw-nav-item bw-nav-item-active" href="#core-panel">
          Core
        </a>
        <a className="bw-nav-item" href="#event-panel">
          Event
        </a>
        <a className="bw-nav-item" href="#cleaning-panel">
          Cleaning
        </a>
        <a className="bw-nav-item" href="#car-panel">
          Car
        </a>
      </nav>
    </aside>
  );
}
