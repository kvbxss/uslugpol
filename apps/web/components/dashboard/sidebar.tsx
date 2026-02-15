export function DashboardSidebar() {
  return (
    <aside className="bw-sidebar">
      <div className="bw-sidebar-top">
        <div className="bw-brand">
          <span className="bw-logo-dot" />
          <span>UslugPOL</span>
        </div>

        <div className="bw-nav-group">
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
    </aside>
  );
}
