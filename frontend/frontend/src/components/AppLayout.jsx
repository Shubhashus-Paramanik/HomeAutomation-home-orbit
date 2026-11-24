
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "My Homes", path: "/homes", icon: "home" },
  { name: "Devices", path: "/devices", icon: "device" },
  { name: "Controllers", path: "/controllers", icon: "controller" },
  { name: "Schedules", path: "/schedules", icon: "schedule" },
  { name: "Settings", path: "/settings", icon: "settings" },
];

function NavigationIcon({ name }) {
  const iconPaths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    device: <><path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" /></>,
    controller: <><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="M8 9v6M6 12h4M16.5 10h.01M16.5 15h.01" /></>,
    schedule: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2M8 2v3M16 2v3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.5a7.8 7.8 0 0 1-1.7 1l-.2 1.5h-2.4l-.3-1.5a7.8 7.8 0 0 1-1.7-1l-1.4.5-1.2-2.1 1.2-.9a7.2 7.2 0 0 1 0-2l-1.2-.9 1.2-2.1 1.4.5a7.8 7.8 0 0 1 1.7-1l.3-1.5h2.4l.2 1.5a7.8 7.8 0 0 1 1.7 1l1.4-.5 1.2 2.1-1.2.9a7.2 7.2 0 0 1 0 1Z" transform="translate(-1 -1)" /></>,
  };

  return (
    <svg
      className="sidebar-link-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {iconPaths[name]}
    </svg>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("homeOrbitTheme") ||
      localStorage.getItem("homeSyncTheme");
    document.documentElement.dataset.theme =
      savedTheme === "light" ? "light" : "dark";
  }, []);

  return (
    <div className="app-layout">
      <aside className="app-sidebar" aria-label="Main sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />
            </svg>
          </span>
          <div>
            <h2>HomeOrbit</h2>
            <small>SMART HOME</small>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              className={({ isActive }) =>
                `sidebar-link icon-${item.icon} ${isActive ? "active" : ""}`
              }
            >
              <NavigationIcon name={item.icon} />
              <span className="sidebar-link-label">{item.name}</span>
              <span className="sidebar-active-marker" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span aria-hidden="true">↪</span>
            <span className="sidebar-link-label">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
