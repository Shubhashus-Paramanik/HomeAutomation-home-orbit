import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import homeService from "../services/homeService";
import roomService from "../services/roomService";
import controllerService from "../services/controllerService";
import deviceService from "../services/deviceService";

import {
  FaHome,
  FaDoorOpen,
  FaMicrochip,
  FaLightbulb,
  FaClock,
  FaPlug,
  FaArrowRight,
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [stats, setStats] = useState({
    totalHomes: 0,
    totalRooms: 0,
    totalControllers: 0,
    totalDevices: 0,
    devicesOn: 0,
    devicesOff: 0,
    onlineControllers: 0,
    offlineControllers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load dashboard information from backend
  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError("");

        const [userResponse, homesData] = await Promise.all([
          api.get("/auth/me"),
          homeService.getHomes(),
        ]);

        // Fetch rooms for every home
        const homeResults = await Promise.all(
          homesData.map(async (home) => {
            const rooms = await roomService.getRooms(home.id);

            return { home, rooms };
          }),
        );

        // Fetch controllers and devices for every room
        const roomResults = await Promise.all(
          homeResults.flatMap(({ home, rooms }) =>
            rooms.map(async (room) => {
              const [controllers, devices] = await Promise.all([
                controllerService.getControllers(home.id, room.id),
                deviceService.getDevices(home.id, room.id),
              ]);

              return { controllers, devices };
            }),
          ),
        );

        const allControllers = roomResults.flatMap(
          (result) => result.controllers,
        );

        const allDevices = roomResults.flatMap((result) => result.devices);

        if (active) {
          setUser({
            email: userResponse.data.email ?? userResponse.data.Email,
          });

          setStats({
            totalHomes: homesData.length,

            totalRooms: homeResults.reduce(
              (total, result) => total + result.rooms.length,
              0,
            ),

            totalControllers: allControllers.length,

            totalDevices: allDevices.length,

            devicesOn: allDevices.filter((device) => device.powerState === "ON")
              .length,

            devicesOff: allDevices.filter(
              (device) => device.powerState !== "ON",
            ).length,

            onlineControllers: allControllers.filter(
              (controller) => controller.status === "ONLINE",
            ).length,

            offlineControllers: allControllers.filter(
              (controller) => controller.status !== "ONLINE",
            ).length,
          });
        }
      } catch (err) {
        if (active) {
          if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login", { replace: true });
          } else {
            setError(
              err.response?.data?.message ||
                "Unable to load dashboard information.",
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    // Automatically refresh dashboard every 5 seconds
    const refreshInterval = setInterval(() => {
      loadDashboard();
    }, 5000);

    // Cleanup when component unmounts
    return () => {
      active = false;
      clearInterval(refreshInterval);
    };
  }, [navigate, refreshKey]);

  // // Logout
  // function handleLogout() {
  //   localStorage.removeItem("accessToken");
  //   navigate("/login", { replace: true });
  // }

  function handleRefresh() {
    setLoading(true);
    setRefreshKey((value) => value + 1);
  }

  if (loading) {
    return (
      <main className="dashboard dashboard-loading">
        <div className="dashboard-loader" aria-label="Loading dashboard" />
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.email?.split("@")[0]?.replace(/[._-]/g, " ") || "Homeowner";
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const deviceActivity =
    stats.totalDevices === 0
      ? 0
      : Math.round((stats.devicesOn / stats.totalDevices) * 100);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-date">{today}</span>
          <h1>Good to see you, {displayName}</h1>
        </div>
        <button
          type="button"
          className="dashboard-refresh"
          onClick={handleRefresh}
          aria-label="Refresh dashboard"
        >
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </header>

      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-badge">
            <span className="welcome-badge-dot" />
            Smart home overview
          </span>
          <h2>Your home is under control.</h2>
          <p>
            {stats.devicesOn} devices are active across {stats.totalHomes}{" "}
            {stats.totalHomes === 1 ? "home" : "homes"}.
          </p>
          <button
            type="button"
            className="welcome-action"
            onClick={() => navigate("/devices")}
          >
            Manage devices <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="activity-ring-wrap">
          <div
            className="activity-ring"
            style={{ "--activity": `${deviceActivity * 3.6}deg` }}
          >
            <div>
              <strong>{deviceActivity}%</strong>
              <span>Active</span>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {success && <div className="success-message">{success}</div>}

      <section className="dashboard-section-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h2>System summary</h2>
        </div>
      </section>

     
<section className="dashboard-stats">
  <StatCard
    icon={<FaHome />}
    iconType="home"
    title="Homes"
    value={stats.totalHomes}
  />

  <StatCard
    icon={<FaDoorOpen />}
    iconType="room"
    title="Rooms"
    value={stats.totalRooms}
  />

  <StatCard
    icon={<FaMicrochip />}
    iconType="controller"
    title="Controllers"
    value={stats.totalControllers}
  />

  <StatCard
    icon={<FaLightbulb />}
    iconType="device"
    title="Smart devices"
    value={stats.totalDevices}
  />
</section>


      <section className="dashboard-content-grid">
        <div className="status-section">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">LIVE STATUS</span>
              <h2>Connected systems</h2>
            </div>
            <span className="live-label">
              <span /> Live
            </span>
          </div>

          <div className="status-list">
            <StatusCard
              title="Devices online"
              value={stats.devicesOn}
              total={stats.totalDevices}
              type="online"
            />
            <StatusCard
              title="Devices offline"
              value={stats.devicesOff}
              total={stats.totalDevices}
              type="offline"
            />
            <StatusCard
              title="Controllers online"
              value={stats.onlineControllers}
              total={stats.totalControllers}
              type="online"
            />
            <StatusCard
              title="Controllers offline"
              value={stats.offlineControllers}
              total={stats.totalControllers}
              type="offline"
            />
          </div>
        </div>

        <aside className="quick-actions-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">SHORTCUTS</span>
              <h2>Quick actions</h2>
            </div>
          </div>
         
<div className="quick-actions">

  <button type="button" onClick={() => navigate("/devices")}>
    <span className="quick-action-icon devices-icon">
      <FaPlug />
    </span>

    <span>
      <strong>Manage devices</strong>
      <small>Control your appliances</small>
    </span>

    <span className="quick-action-arrow">
      <FaArrowRight />
    </span>
  </button>

  <button type="button" onClick={() => navigate("/homes")}>
    <span className="quick-action-icon homes-icon">
      <FaHome />
    </span>

    <span>
      <strong>View homes</strong>
      <small>Rooms and properties</small>
    </span>

    <span className="quick-action-arrow">
      <FaArrowRight />
    </span>
  </button>

  <button type="button" onClick={() => navigate("/schedules")}>
    <span className="quick-action-icon schedules-icon">
      <FaClock />
    </span>

    <span>
      <strong>Schedules</strong>
      <small>Automate routines</small>
    </span>

    <span className="quick-action-arrow">
      <FaArrowRight />
    </span>
  </button>

</div>

        </aside>
      </section>
    </main>
  );
}

// Reusable statistic card

function StatCard({ icon, iconType, title, value }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon-box ${iconType}`}>
        {icon}
      </div>

      <div className="stat-card-copy">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </article>
  );
}

// Reusable status card
function StatusCard({ title, value, total, type }) {
  const percentage =
    total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <article className="status-card">
      <div className="status-card-top">
        <div>
          <span className={`status-dot ${type}`} />
          <p>{title}</p>
        </div>
        <h3>{value}</h3>
      </div>
      <div className="status-progress" aria-hidden="true">
        <span
          className={type}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </article>
  );
}
