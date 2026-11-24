
import { useCallback, useEffect, useMemo, useState } from "react";

import homeService from "../services/homeService";
import roomService from "../services/roomService";
import deviceService from "../services/deviceService";
import controllerService from "../services/controllerService";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [homes, setHomes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [homeFilter, setHomeFilter] = useState("ALL");
  const [powerFilter, setPowerFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [busyDeviceId, setBusyDeviceId] = useState(null);

  // Port reassignment state
  const [reassignDevice, setReassignDevice] = useState(null);
  const [controllers, setControllers] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [assignment, setAssignment] = useState({
    controllerId: "",
    portNumber: "",
  });
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Load all homes, rooms, controllers and devices
  const loadDevices = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const homeData = await homeService.getHomes();

      const results = await Promise.all(
        homeData.map(async (home) => {
          const rooms = await roomService.getRooms(home.id);

          const roomResults = await Promise.all(
            rooms.map(async (room) => {
              const [roomDevices, roomControllers] = await Promise.all([
                deviceService.getDevices(home.id, room.id),
                controllerService.getControllers(home.id, room.id),
              ]);

              return {
                room,
                devices: roomDevices,
                controllers: roomControllers,
              };
            })
          );

          return { home, roomResults };
        })
      );

      const allDevices = results.flatMap(({ home, roomResults }) =>
        roomResults.flatMap(({ room, devices: roomDevices }) =>
          roomDevices.map((device) => ({
            ...device,
            homeId: home.id,
            homeName: home.name,
            roomId: room.id,
            roomName: room.name,
          }))
        )
      );

      if (showLoading || !loading) {
        setHomes(homeData);
        setDevices(allDevices);
      } else {
        setHomes(homeData);
        setDevices(allDevices);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your devices."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();

    const interval = setInterval(() => {
      loadDevices(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadDevices]);

  // Device statistics
  const stats = useMemo(() => ({
    total: devices.length,
    on: devices.filter((device) => device.powerState === "ON").length,
    off: devices.filter((device) => device.powerState !== "ON").length,
  }), [devices]);

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesType =
        typeFilter === "ALL" || device.deviceType === typeFilter;

      const matchesHome =
        homeFilter === "ALL" ||
        String(device.homeId) === homeFilter;

      const matchesPower =
        powerFilter === "ALL" ||
        (powerFilter === "ON" && device.powerState === "ON") ||
        (powerFilter === "OFF" && device.powerState !== "ON");

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        device.name?.toLowerCase().includes(searchText) ||
        device.roomName?.toLowerCase().includes(searchText) ||
        device.homeName?.toLowerCase().includes(searchText) ||
        device.controllerName?.toLowerCase().includes(searchText);

      return (
        matchesType &&
        matchesHome &&
        matchesPower &&
        matchesSearch
      );
    });
  }, [devices, typeFilter, homeFilter, powerFilter, search]);

  // Turn device ON or OFF
  async function handlePowerChange(device) {
    setBusyDeviceId(device.id);
    setError("");
    setSuccess("");

    try {
      const updatedDevice =
        device.powerState === "ON"
          ? await deviceService.turnOff(
              device.homeId,
              device.roomId,
              device.id
            )
          : await deviceService.turnOn(
              device.homeId,
              device.roomId,
              device.id
            );

      setDevices((previous) =>
        previous.map((item) =>
          item.id === device.id
            ? { ...item, ...updatedDevice }
            : item
        )
      );

      setSuccess(
        `${device.name} turned ${
          device.powerState === "ON" ? "OFF" : "ON"
        } successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to change device power state."
      );
    } finally {
      setBusyDeviceId(null);
    }
  }

  // Delete device
  async function handleDelete(device) {
    if (!window.confirm(`Delete ${device.name}?`)) return;

    setBusyDeviceId(device.id);
    setError("");
    setSuccess("");

    try {
      await deviceService.deleteDevice(
        device.homeId,
        device.roomId,
        device.id
      );

      setDevices((previous) =>
        previous.filter((item) => item.id !== device.id)
      );

      setSuccess(`${device.name} deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this device."
      );
    } finally {
      setBusyDeviceId(null);
    }
  }

  // Open reassignment dialog and load controllers in this room
  async function handleOpenReassign(device) {
    setError("");
    setSuccess("");
    setReassignDevice(device);
    setAvailablePorts([]);

    setAssignment({
      controllerId: String(device.controllerId || ""),
      portNumber: "",
    });

    try {
      const data = await controllerService.getControllers(
        device.homeId,
        device.roomId
      );

      setControllers(data);

      
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load room controllers."
      );
    }
  }

  // Load free ports for selected controller
  async function handleControllerChange(event) {
    const controllerId = event.target.value;

    setAssignment({
      controllerId,
      portNumber: "",
    });

    setAvailablePorts([]);

    if (!controllerId || !reassignDevice) return;

    setLoadingPorts(true);
    setError("");

    try {
      const data = await controllerService.getControllerPorts(
        reassignDevice.homeId,
        reassignDevice.roomId,
        controllerId
      );

      setAvailablePorts(
        data.filter(
          (port) =>
            port.available ||
            port.deviceId === reassignDevice.id
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load controller ports."
      );
    } finally {
      setLoadingPorts(false);
    }
  }

  // Save reassignment
  async function handleSaveAssignment(event) {
    event.preventDefault();

    if (!reassignDevice || !assignment.controllerId ||
        !assignment.portNumber) {
      setError("Select a controller and an available port.");
      return;
    }

    setSavingAssignment(true);
    setError("");
    setSuccess("");

    try {
      const updatedDevice = await deviceService.assignPort(
        reassignDevice.homeId,
        reassignDevice.roomId,
        reassignDevice.id,
        {
          controllerId: Number(assignment.controllerId),
          portNumber: Number(assignment.portNumber),
        }
      );

      setDevices((previous) =>
        previous.map((device) =>
          device.id === reassignDevice.id
            ? { ...device, ...updatedDevice }
            : device
        )
      );

      setSuccess(`${reassignDevice.name} port updated successfully.`);
      setReassignDevice(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to reassign device port."
      );
    } finally {
      setSavingAssignment(false);
    }
  }

  function getDeviceIcon(type) {
    switch (type) {
      case "FAN":
        return "fan";
      case "AIR_CONDITIONER":
        return "climate";
      case "SMART_PLUG":
        return "plug";
      case "SENSOR":
        return "sensor";
      default:
        return "light";
    }
  }

  function formatDeviceType(type) {
    const labels = {
      LIGHT: "Light",
      FAN: "Fan",
      AIR_CONDITIONER: "Air conditioner",
      SMART_PLUG: "Smart plug",
      SENSOR: "Sensor",
    };

    return labels[type] || type?.replace(/_/g, " ") || "Device";
  }

  if (loading) {
    return (
      <main className="content-page devices-page devices-loading">
        <div className="dashboard-loader" aria-label="Loading devices" />
        <p>Loading your devices...</p>
      </main>
    );
  }

  return (
    <main className="content-page devices-page">

      <div className="page-heading devices-page-heading">
        <div>
          <span className="eyebrow">DEVICE MANAGEMENT</span>
          <h1>Smart Devices</h1>
          <p>Monitor and control devices across all your homes.</p>
        </div>

        <button
          type="button"
          className="devices-refresh-button"
          onClick={() => loadDevices()}
        >
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Statistics */}
      <section className="global-device-stats">
        <article className="global-stat-card">
          <div className="global-stat-icon total">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" /></svg>
          </div>
          <div>
            <p>Total devices</p>
            <h2>{stats.total}</h2>
          </div>
        </article>

        <article className="global-stat-card">
          <div className="global-stat-icon online">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18" /></svg>
          </div>
          <div>
            <p>Devices on</p>
            <h2>{stats.on}</h2>
          </div>
        </article>

        <article className="global-stat-card">
          <div className="global-stat-icon offline">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 8v4" /></svg>
          </div>
          <div>
            <p>Devices off</p>
            <h2>{stats.off}</h2>
          </div>
        </article>
      </section>

      {/* Filters */}
      <section className="device-filters">
        <label className="device-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search devices"
            type="search"
            placeholder="Search devices..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="device-filter-selects">
          <select
            aria-label="Filter by device type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="ALL">All types</option>
            <option value="LIGHT">Lights</option>
            <option value="FAN">Fans</option>
            <option value="AIR_CONDITIONER">Air conditioners</option>
            <option value="SMART_PLUG">Smart plugs</option>
            <option value="SENSOR">Sensors</option>
          </select>

          <select
            aria-label="Filter by home"
            value={homeFilter}
            onChange={(event) => setHomeFilter(event.target.value)}
          >
            <option value="ALL">All homes</option>
            {homes.map((home) => (
              <option key={home.id} value={String(home.id)}>
                {home.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by power state"
            value={powerFilter}
            onChange={(event) => setPowerFilter(event.target.value)}
          >
            <option value="ALL">All states</option>
            <option value="ON">On</option>
            <option value="OFF">Off</option>
          </select>
        </div>

      </section>

      {/* Device list */}
      <section className="global-devices-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTED APPLIANCES</span>
            <h2>All devices</h2>
          </div>
          <span className="devices-count">{filteredDevices.length} {filteredDevices.length === 1 ? "device" : "devices"}</span>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="page-placeholder">
            <span className="devices-empty-icon">◉</span>
            <h2>No devices found</h2>
            <p>
              Try changing your filters or register a device
              from the My Homes page.
            </p>
          </div>
        ) : (
          <div className="global-device-grid">

            {filteredDevices.map((device) => (
              <article
                className="global-device-card"
                key={`${device.homeId}-${device.roomId}-${device.id}`}
              >
                <div className="global-device-header">
                  <div className={`global-device-icon ${getDeviceIcon(device.deviceType)}`}>
                    {getDeviceIcon(device.deviceType) === "light" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" /></svg>
                    )}
                    {getDeviceIcon(device.deviceType) === "fan" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2" /><path d="M12 10c-1-5 1-8 4-7 3 1 1 5-2 7M14 12c5-1 8 1 7 4-1 3-5 1-7-2M10 14c1 5-1 8-4 7-3-1-1-5 2-7M10 12C5 13 2 11 3 8c1-3 5-1 7 2" /></svg>
                    )}
                    {getDeviceIcon(device.deviceType) === "climate" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 6l14 12M19 6 5 18M8 4l4 4 4-4M8 20l4-4 4 4" /></svg>
                    )}
                    {getDeviceIcon(device.deviceType) === "plug" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v4M16 3v4M6 7h12v3a6 6 0 0 1-12 0V7ZM12 16v5" /></svg>
                    )}
                    {getDeviceIcon(device.deviceType) === "sensor" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" /></svg>
                    )}
                  </div>

                  <span
                    className={`power-status ${
                      device.powerState === "ON"
                        ? "power-on"
                        : "power-off"
                    }`}
                  >
                    {device.powerState || "OFF"}
                  </span>
                </div>

                <h3>{device.name}</h3>

                <p className="global-device-type">{formatDeviceType(device.deviceType)}</p>

                <div className="global-device-details">
                  <span>
                    <svg className="detail-icon detail-icon-home" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />
                    </svg>
                    {device.homeName}
                  </span>
                  <span>
                    <svg className="detail-icon detail-icon-room" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 21h14M7 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M11 12h.01" />
                    </svg>
                    {device.roomName}
                  </span>
                  <span>
                    <svg className="detail-icon detail-icon-controller" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                      <path d="M9 9h6v6H9zM3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3M9 3v3m3-3v3m3-3v3m-6 12v3m3-3v3m3-3v3" />
                    </svg>
                    {device.controllerName || "No controller"}
                  </span>
                  <span>
                    <svg className="detail-icon detail-icon-port" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="6" width="18" height="12" rx="2" />
                      <path d="M8 10v4m4-4v4m4-4v4M7 18v2m10-2v2" />
                    </svg>
                    Port {device.portNumber ?? "Not assigned"}
                  </span>
                </div>

                <div className="global-device-actions">

                  <button
                    type="button"
                    className={
                      device.powerState === "ON"
                        ? "power-button turn-off"
                        : "power-button turn-on"
                    }
                    disabled={busyDeviceId === device.id}
                    onClick={() => handlePowerChange(device)}
                  >
                    {busyDeviceId === device.id
                      ? "Please wait..."
                      : device.powerState === "ON"
                        ? "Turn OFF"
                        : "Turn ON"}
                  </button>

                  <button
                    type="button"
                    className="reassign-button"
                    disabled={busyDeviceId === device.id}
                    onClick={() => handleOpenReassign(device)}
                  >
                    Change Port
                  </button>

                  <button
                    type="button"
                    className="delete-device-button"
                    disabled={busyDeviceId === device.id}
                    onClick={() => handleDelete(device)}
                  >
                    Delete
                  </button>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>

      {/* Reassignment form */}
      {reassignDevice && (
        <div className="modal-overlay">
          <div className="reassign-modal">

            <h2>Change Device Port</h2>

            <p>
              {reassignDevice.name} · {reassignDevice.roomName}
            </p>

            <form onSubmit={handleSaveAssignment}>

              <label>Controller</label>

              <select
                value={assignment.controllerId}
                onChange={handleControllerChange}
                required
              >
                <option value="">Select controller</option>

                {controllers.map((controller) => (
                  <option
                    key={controller.id}
                    value={String(controller.id)}
                  >
                    {controller.name}
                  </option>
                ))}
              </select>

              <label>Available port</label>

              <select
                value={assignment.portNumber}
                onChange={(event) =>
                  setAssignment((previous) => ({
                    ...previous,
                    portNumber: event.target.value,
                  }))
                }
                disabled={!assignment.controllerId || loadingPorts}
                required
              >
                <option value="">
                  {loadingPorts ? "Loading ports..." : "Select port"}
                </option>

                {availablePorts.map((port) => (
                  <option
                    key={port.portNumber}
                    value={String(port.portNumber)}
                  >
                    Port {port.portNumber}
                    {port.deviceId === reassignDevice.id
                      ? " (Current)"
                      : ""}
                  </option>
                ))}
              </select>

              <div className="reassign-actions">
                <button
                  type="submit"
                  disabled={
                    savingAssignment ||
                    loadingPorts ||
                    !assignment.portNumber
                  }
                >
                  {savingAssignment ? "Saving..." : "Save Assignment"}
                </button>

                <button
                  type="button"
                  className="cancel-reassign"
                  onClick={() => setReassignDevice(null)}
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
