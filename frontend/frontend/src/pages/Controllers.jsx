
import { useCallback, useEffect, useState } from "react";

import homeService from "../services/homeService";
import roomService from "../services/roomService";
import controllerService from "../services/controllerService";

export default function Controllers() {
  const [controllers, setControllers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingController, setEditingController] = useState(null);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load controllers from all homes and rooms
  const loadControllers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    setError("");

    try {
      const homes = await homeService.getHomes();

      const results = await Promise.all(
        homes.map(async (home) => {
          const rooms = await roomService.getRooms(home.id);

          const roomResults = await Promise.all(
            rooms.map(async (room) => {
              const roomControllers =
                await controllerService.getControllers(
                  home.id,
                  room.id
                );

              return Promise.all(
                roomControllers.map(async (controller) => {
                  let ports = [];

                  try {
                    ports = await controllerService.getControllerPorts(
                      home.id,
                      room.id,
                      controller.id
                    );
                  } catch (portError) {
                    console.error(
                      `Unable to load ports for controller ${controller.id}`,
                      portError
                    );
                  }

                  return {
                    ...controller,
                    homeId: home.id,
                    homeName: home.name,
                    roomId: room.id,
                    roomName: room.name,
                    ports,
                  };
                })
              );
            })
          );

          return roomResults.flat();
        })
      );

      setControllers(results.flat());
    } catch (err) {
      console.error("Controller loading error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to load controllers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadControllers();

    const interval = setInterval(() => {
      loadControllers(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadControllers]);

  // Controller statistics
  const totalControllers = controllers.length;

  const onlineControllers = controllers.filter(
    (controller) => controller.status === "ONLINE"
  ).length;

  const offlineControllers = totalControllers - onlineControllers;

  const totalPorts = controllers.reduce(
    (sum, controller) =>
      sum + (controller.totalPorts || 0),
    0
  );

  const occupiedPorts = controllers.reduce(
    (sum, controller) =>
      sum + controller.ports.filter((port) => !port.available).length,
    0
  );

  const availablePorts = totalPorts - occupiedPorts;

  const filteredControllers = controllers.filter((controller) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && controller.status === "ONLINE") ||
      (statusFilter === "OFFLINE" && controller.status !== "ONLINE");
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      controller.name?.toLowerCase().includes(searchText) ||
      controller.model?.toLowerCase().includes(searchText) ||
      controller.homeName?.toLowerCase().includes(searchText) ||
      controller.roomName?.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  // Expand/collapse port list
  function togglePorts(controllerId) {
    setExpandedId((previous) =>
      previous === controllerId ? null : controllerId
    );
  }

  // Edit controller name
  function openEdit(controller) {
    setEditingController(controller);
    setNewName(controller.name);
    setError("");
    setSuccess("");
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!editingController || !newName.trim()) {
      setError("Controller name is required.");
      return;
    }

    setBusyId(editingController.id);
    setError("");
    setSuccess("");

    try {
      const updated = await controllerService.updateController(
        editingController.homeId,
        editingController.roomId,
        editingController.id,
        { name: newName.trim() }
      );

      setControllers((previous) =>
        previous.map((controller) =>
          controller.id === editingController.id
            ? { ...controller, ...updated }
            : controller
        )
      );

      setSuccess("Controller name updated successfully.");
      setEditingController(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update controller."
      );
    } finally {
      setBusyId(null);
    }
  }

  // Delete controller
  async function handleDelete(controller) {
    const confirmed = window.confirm(
      `Delete ${controller.name}?\n\nThe backend will reject deletion if devices are still assigned.`
    );

    if (!confirmed) return;

    setBusyId(controller.id);
    setError("");
    setSuccess("");

    try {
      await controllerService.deleteController(
        controller.homeId,
        controller.roomId,
        controller.id
      );

      setControllers((previous) =>
        previous.filter((item) => item.id !== controller.id)
      );

      setSuccess(`${controller.name} deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to delete controller."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <main className="content-page controllers-page controllers-loading">
        <div className="dashboard-loader" aria-label="Loading controllers" />
        <p>Loading your controllers...</p>
      </main>
    );
  }

  return (
    <main className="content-page controllers-page">

      <div className="page-heading controllers-page-heading">
        <div>
          <span className="eyebrow">CONTROLLER MANAGEMENT</span>
          <h1>Controllers</h1>
          <p>
            Manage ESP32 controllers and their port assignments
            across all your homes.
          </p>
        </div>

        <button
          type="button"
          className="controllers-refresh-button"
          onClick={() => loadControllers()}
        >
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Statistics */}
      <section className="controller-stats">

        <article className="controller-stat-card">
          <div className="controller-stat-icon total">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
              <path d="M9 9h6v6H9zM3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3M9 3v3m3-3v3m3-3v3m-6 12v3m3-3v3m3-3v3" />
            </svg>
          </div>
          <div><p>Total controllers</p><h2>{totalControllers}</h2></div>
        </article>

        <article className="controller-stat-card">
          <div className="controller-stat-icon online">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>
          <div><p>Online</p><h2>{onlineControllers}</h2></div>
        </article>

        <article className="controller-stat-card">
          <div className="controller-stat-icon offline">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="m9 9 6 6m0-6-6 6" />
            </svg>
          </div>
          <div><p>Offline</p><h2>{offlineControllers}</h2></div>
        </article>

        <article className="controller-stat-card">
          <div className="controller-stat-icon ports">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M8 10v4m4-4v4m4-4v4M7 18v2m10-2v2" />
            </svg>
          </div>
          <div><p>Total ports</p><h2>{totalPorts}</h2></div>
        </article>

        <article className="controller-stat-card">
          <div className="controller-stat-icon occupied">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M8 10v4m8-4v4m-7-1 6-4" />
            </svg>
          </div>
          <div><p>Occupied</p><h2>{occupiedPorts}</h2></div>
        </article>

        <article className="controller-stat-card">
          <div className="controller-stat-icon available">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M8 10v4m4-4v4m4-4v4m-9 4 2 2 4-4" />
            </svg>
          </div>
          <div><p>Available</p><h2>{availablePorts}</h2></div>
        </article>

      </section>

      <section className="controller-filters">
        <label className="controller-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search controllers"
            type="search"
            placeholder="Search controllers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filter by controller status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </section>

      {/* Controller list */}
      <section className="global-controllers-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">NETWORK</span>
            <h2>All controllers</h2>
          </div>
          <span className="controllers-count">{filteredControllers.length} {filteredControllers.length === 1 ? "controller" : "controllers"}</span>
        </div>

        {filteredControllers.length === 0 ? (
          <div className="page-placeholder">
            <span className="controllers-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9 9h6v6H9zM3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3" />
              </svg>
            </span>
            <h2>No controllers found</h2>
            <p>
              Try changing the search or status filter.
            </p>
          </div>
        ) : (
          <div className="global-controller-grid">

            {filteredControllers.map((controller) => {
              const occupied = controller.ports.filter(
                (port) => !port.available
              ).length;

              const free = controller.ports.filter(
                (port) => port.available
              ).length;

              const isExpanded = expandedId === controller.id;

              return (
                <article
                  className="global-controller-card"
                  key={`${controller.homeId}-${controller.roomId}-${controller.id}`}
                >

                  <div className="global-controller-header">
                    <div className="controller-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3.5" y="5" width="17" height="14" rx="3" />
                        <path d="M8 9v6M6 12h4M16.5 10h.01M16.5 15h.01" />
                      </svg>
                    </div>

                    <span
                      className={`controller-status ${
                        controller.status === "ONLINE"
                          ? "controller-online"
                          : "controller-offline"
                      }`}
                    >
                      {controller.status}
                    </span>
                  </div>

                  <h3>{controller.name}</h3>

                  <div className="controller-metadata">
                    <span>
                      <svg className="metadata-icon metadata-model" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                        <path d="M9 9h6v6H9zM3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3" />
                      </svg>
                      {controller.model || "ESP32 controller"}
                    </span>
                    <span>
                      <svg className="metadata-icon metadata-home" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />
                      </svg>
                      {controller.homeName}
                    </span>
                    <span>
                      <svg className="metadata-icon metadata-room" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 21h14M7 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M11 12h.01" />
                      </svg>
                      {controller.roomName}
                    </span>
                    <span>
                      <svg className="metadata-icon metadata-id" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8" cy="11" r="2" />
                        <path d="M5.5 16a3 3 0 0 1 5 0m3-6h4m-4 4h4" />
                      </svg>
                      ID {controller.id}
                    </span>
                    <span>
                      <svg className="metadata-icon metadata-device" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="5" y="4" width="14" height="16" rx="2" />
                        <path d="M9 8h6v8H9zM9 2v2m6-2v2M9 20v2m6-2v2" />
                      </svg>
                      {controller.simulated ? "Simulated" : "Hardware"}
                    </span>
                  </div>

                  <div className="controller-port-summary">
                    <div>
                      <strong>{controller.totalPorts}</strong>
                      <span>Total</span>
                    </div>

                    <div>
                      <strong>{occupied}</strong>
                      <span>Occupied</span>
                    </div>

                    <div>
                      <strong>{free}</strong>
                      <span>Available</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-ports-button"
                    onClick={() => togglePorts(controller.id)}
                  >
                    {isExpanded ? "Hide Ports" : "View Ports"}
                  </button>

                  {isExpanded && (
                    <div className="controller-port-grid">

                      {controller.ports.map((port) => (
                        <div
                          className={`controller-port-item ${
                            port.available
                              ? "port-available"
                              : "port-occupied"
                          }`}
                          key={port.portNumber}
                        >
                          <strong>Port {port.portNumber}</strong>

                          <span>
                            {port.available
                              ? "Available"
                              : "Occupied"}
                          </span>

                          {!port.available && (
                            <small>
                              {port.deviceName}
                            </small>
                          )}
                        </div>
                      ))}

                    </div>
                  )}

                  <div className="controller-actions">

                    <button
                      type="button"
                      className="edit-controller-button"
                      disabled={busyId === controller.id}
                      onClick={() => openEdit(controller)}
                    >
                      Edit Name
                    </button>

                    <button
                      type="button"
                      className="delete-controller-button"
                      disabled={busyId === controller.id}
                      onClick={() => handleDelete(controller)}
                    >
                      {busyId === controller.id
                        ? "Please wait..."
                        : "Delete"}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* Edit controller modal */}
      {editingController && (
        <div className="modal-overlay">
          <div className="reassign-modal">

            <h2>Edit Controller</h2>

            <p>{editingController.name}</p>

            <form onSubmit={handleUpdate}>

              <label htmlFor="controllerName">
                Controller name
              </label>

              <input
                id="controllerName"
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                maxLength={100}
                required
              />

              <div className="reassign-actions">

                <button
                  type="submit"
                  disabled={busyId === editingController.id}
                >
                  {busyId === editingController.id
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-reassign"
                  onClick={() => setEditingController(null)}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}
