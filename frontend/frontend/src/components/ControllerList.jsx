import { useEffect, useState } from "react";
import controllerService from "../services/controllerService";

export default function ControllerList({ homeId, room }) {
  const [controllers, setControllers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    model: "ESP32_8_CHANNEL",
  });


  
  // Load controllers
  async function handleExpand() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (!nextExpanded) return;

    setError("");
    setLoading(true);

    try {
      const data = await controllerService.getControllers(homeId, room.id);

      setControllers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load controllers.");
    } finally {
      setLoading(false);
    }
  }

  // Form input
  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  // Register controller
  async function handleCreateController(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const createdController = await controllerService.createController(
        homeId,
        room.id,
        form,
      );

      setControllers((previous) => [createdController, ...previous]);

      setForm({
        name: "",
        model: "ESP32_8_CHANNEL",
      });

      setFormOpen(false);
      setSuccess("Controller registered successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to register controller.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="controller-section">
      <button
        type="button"
        className="controller-toggle"
        onClick={handleExpand}
        aria-expanded={expanded}
      >
        <span className="controller-toggle-title">
          <span className="controller-toggle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M9 9h6v6H9zM2 9h3m-3 3h3m-3 3h3m14-6h3m-3 3h3m-3 3h3M9 2v3m3-3v3m3-3v3m-6 14v3m3-3v3m3-3v3" />
            </svg>
          </span>
          <span>Controllers</span>
          <span className="controller-count">{controllers.length}</span>
        </span>
        <span className="controller-toggle-action">
          {expanded ? "Hide" : "View"}
          <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
        </span>
      </button>

      {expanded && (
        <div className="controller-content">
          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          <div className="controller-content-heading">
            <div>
              <h4>Controllers in {room.name}</h4>
              {!loading && (
                <span>{controllers.length} {controllers.length === 1 ? "controller" : "controllers"}</span>
              )}
            </div>
            <button
              type="button"
              className="controller-form-toggle"
              onClick={() => setFormOpen((open) => !open)}
              aria-expanded={formOpen}
            >
              {formOpen ? "Cancel" : "Register controller"}
            </button>
          </div>

          {loading ? (
            <p className="page-message">Loading controllers...</p>
          ) : controllers.length === 0 ? (
            <p className="empty-message">No controllers registered yet.</p>
          ) : (
            <div className="controller-grid">
              {controllers.map((controller) => (
                <ControllerCard
                  key={controller.id}
                  homeId={homeId}
                  roomId={room.id}
                  controller={controller}
                />
              ))}
            </div>
          )}

          {formOpen && (
            <div className="create-controller-section">
              <h4>Register an ESP32 controller</h4>

              <form className="controller-form" onSubmit={handleCreateController}>
                <label htmlFor={`controllerName-${room.id}`}>
                  Controller name
                </label>

                <input
                  id={`controllerName-${room.id}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Living Room ESP32"
                  maxLength={100}
                  required
                />

                <label htmlFor={`controllerModel-${room.id}`}>
                  Controller model
                </label>

                <select
                  id={`controllerModel-${room.id}`}
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                >
                  <option value="ESP32_8_CHANNEL">ESP32 - 8 Channel</option>
                </select>

                <button type="submit" disabled={creating}>
                  {creating ? "Registering..." : "Register Controller"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Individual controller card
function ControllerCard({ homeId, roomId, controller }) {
  const [ports, setPorts] = useState([]);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [portsLoaded, setPortsLoaded] = useState(false);
  const [error, setError] = useState("");

  async function handleShowPorts() {
    if (portsLoaded) {
      setPortsLoaded(false);
      return;
    }

    setLoadingPorts(true);
    setError("");

    try {
      const data = await controllerService.getControllerPorts(
        homeId,
        roomId,
        controller.id,
      );

      setPorts(data);
      setPortsLoaded(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load controller ports.",
      );
    } finally {
      setLoadingPorts(false);
    }
  }

  async function handleRefreshPorts() {
    setLoadingPorts(true);
    setError("");

    try {
      const data = await controllerService.getControllerPorts(
        homeId,
        roomId,
        controller.id,
      );

      setPorts(data);
      setPortsLoaded(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to refresh controller ports.",
      );
    } finally {
      setLoadingPorts(false);
    }
  }

  return (
    <article className="controller-card">
      <div className="controller-card-header">
        <span className="controller-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <path d="M9 9h6v6H9zM2 9h3m-3 3h3m-3 3h3m14-6h3m-3 3h3m-3 3h3M9 2v3m3-3v3m3-3v3m-6 14v3m3-3v3m3-3v3" />
          </svg>
        </span>

        <span
          className={`controller-status ${
            controller.status === "ONLINE" ? "online" : "offline"
          }`}
        >
          {controller.status}
        </span>
      </div>

      <h3>{controller.name}</h3>

      <p>{controller.model}</p>

      <p>{controller.totalPorts} Channels</p>

      <small>Controller ID: {controller.id}</small>

      <div className="controller-port-actions">
        <button
          type="button"
          className="ports-button"
          onClick={handleShowPorts}
          disabled={loadingPorts}
          aria-expanded={portsLoaded}
        >
          {loadingPorts
            ? "Loading..."
            : portsLoaded
              ? "Hide ports"
              : "View ports"}
        </button>
        <button
          type="button"
          className="refresh-ports-button"
          onClick={handleRefreshPorts}
          disabled={loadingPorts}
        >
          {loadingPorts ? "Refreshing..." : "↻ Refresh Ports"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {portsLoaded && (
        <div className="port-grid">
          {ports.map((port) => (
            <div
              className={`port-card ${
                port.available ? "available" : "occupied"
              }`}
              key={port.portNumber}
            >
              <span>Port {port.portNumber}</span>

              <strong>{port.available ? "Available" : "Occupied"}</strong>

              {!port.available && (
                <small>{port.deviceName || "Assigned device"}</small>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
