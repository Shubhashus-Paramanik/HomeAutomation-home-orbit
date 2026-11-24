import { useEffect, useState } from "react";
import deviceService from "../services/deviceService";
import controllerService from "../services/controllerService";

const DEVICE_ICON_TONES = {
  LIGHT: "light",
  FAN: "fan",
  AIR_CONDITIONER: "climate",
  SMART_PLUG: "plug",
  SENSOR: "sensor",
};

export default function DeviceManagement({ homeId, room }) {
  const [devices, setDevices] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reassigningDeviceId, setReassigningDeviceId] = useState(null);

  const [assignment, setAssignment] = useState({
    controllerId: "",
    portNumber: "",
  });

  const [reassignmentPorts, setReassignmentPorts] = useState([]);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [form, setForm] = useState({
    name: "",
    deviceType: "LIGHT",
    description: "",
    controllerId: "",
    portNumber: "",
  });

  // Load room devices and controllers
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [deviceData, controllerData] = await Promise.all([
          deviceService.getDevices(homeId, room.id),
          controllerService.getControllers(homeId, room.id),
        ]);

        if (active) {
          setDevices(deviceData);
          setControllers(controllerData);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load devices and controllers.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [homeId, room.id]);

  // Handle ordinary form inputs
  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  // When controller changes, load its available ports
  async function handleControllerChange(event) {
    const controllerId = event.target.value;

    setForm((previous) => ({
      ...previous,
      controllerId,
      portNumber: "",
    }));

    setAvailablePorts([]);
    setError("");

    if (!controllerId) return;

    try {
      const ports = await controllerService.getControllerPorts(
        homeId,
        room.id,
        controllerId,
      );

      setAvailablePorts(ports.filter((port) => port.available));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load available ports.",
      );
    }
  }

  // Open port reassignment form
  function handleOpenReassign(device) {
    setReassigningDeviceId(device.id);

    setAssignment({
      controllerId: String(device.controllerId || ""),
      portNumber: "",
    });

    setReassignmentPorts([]);
    setError("");
    setSuccess("");
  }

  // Load available ports for the selected controller
  async function handleAssignmentControllerChange(event) {
    const controllerId = event.target.value;

    setAssignment({
      controllerId,
      portNumber: "",
    });

    setReassignmentPorts([]);
    setError("");

    if (!controllerId) return;

    try {
      const ports = await controllerService.getControllerPorts(
        homeId,
        room.id,
        controllerId,
      );

      setReassignmentPorts(
        ports.filter(
          (port) => port.available || port.deviceId === reassigningDeviceId,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load available ports.",
      );
    }
  }

  // Save new port assignment
  async function handleReassignDevice(deviceId) {
    if (!assignment.controllerId || !assignment.portNumber) {
      setError("Please select a controller and port.");
      return;
    }

    setSavingAssignment(true);
    setError("");
    setSuccess("");

    try {
      const updatedDevice = await deviceService.assignPort(
        homeId,
        room.id,
        deviceId,
        {
          controllerId: Number(assignment.controllerId),
          portNumber: Number(assignment.portNumber),
        },
      );

      setDevices((previous) =>
        previous.map((device) =>
          device.id === deviceId ? updatedDevice : device,
        ),
      );

      setReassigningDeviceId(null);

      setSuccess("Device port reassigned successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to reassign device port.",
      );
    } finally {
      setSavingAssignment(false);
    }
  }

  // Register a device
  async function handleCreateDevice(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const request = {
        name: form.name.trim(),
        deviceType: form.deviceType,
        description: form.description.trim(),
        controllerId: Number(form.controllerId),
        portNumber: Number(form.portNumber),
      };

      const createdDevice = await deviceService.createDevice(
        homeId,
        room.id,
        request,
      );

      setDevices((previous) => [createdDevice, ...previous]);

      setForm({
        name: "",
        deviceType: "LIGHT",
        description: "",
        controllerId: "",
        portNumber: "",
      });

      setAvailablePorts([]);
      setFormOpen(false);
      setSuccess("Device registered successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to register device.",
      );
    } finally {
      setCreating(false);
    }
  }

  // Switch device ON or OFF
  async function handlePowerChange(device) {
    setError("");
    setSuccess("");

    try {
      const updatedDevice =
        device.powerState === "ON"
          ? await deviceService.turnOff(homeId, room.id, device.id)
          : await deviceService.turnOn(homeId, room.id, device.id);

      setDevices((previous) =>
        previous.map((item) => (item.id === device.id ? updatedDevice : item)),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change device power state.",
      );
    }
  }

  // Delete a device
  async function handleDeleteDevice(deviceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this device?",
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deviceService.deleteDevice(homeId, room.id, deviceId);

      setDevices((previous) =>
        previous.filter((device) => device.id !== deviceId),
      );

      setSuccess("Device deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete device.");
    }
  }

  async function refreshDevices() {
    setError("");

    try {
      const data = await deviceService.getDevices(homeId, room.id);
      setDevices(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to refresh devices."
      );
    }
  }

  return (
    <section className="device-management">
      <div className="device-management-toolbar">
        <button
          type="button"
          className="device-management-toggle"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          <span className="device-management-title">
            <span>Devices</span>
            <span className="device-management-count">{devices.length}</span>
          </span>
          <span>{expanded ? "Hide" : "View devices"}</span>
        </button>
        {expanded && (
          <button
            type="button"
            className="refresh-button"
            onClick={refreshDevices}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {expanded && (
        <div className="device-management-content">
          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          {loading ? (
            <p className="page-message">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="empty-message">No devices registered in this room yet.</p>
          ) : (
            <div className="managed-device-grid">
              {devices.map((device) => (
                <article className="managed-device-card" key={device.id}>
              <div className="managed-device-heading">
                <span
                  className={`managed-device-icon ${
                    DEVICE_ICON_TONES[device.deviceType] || "light"
                  }`}
                >
                  {device.deviceType === "FAN"
                    ? "🌀"
                    : device.deviceType === "AIR_CONDITIONER"
                      ? "❄️"
                      : device.deviceType === "SMART_PLUG"
                        ? "🔌"
                        : device.deviceType === "SENSOR"
                          ? "🌡️"
                          : "💡"}
                </span>

                <span
                  className={`power-status ${
                    device.powerState === "ON" ? "power-on" : "power-off"
                  }`}
                >
                  {device.powerState || "OFF"}
                </span>
              </div>

              <h5>{device.name}</h5>

              <p>{device.deviceType}</p>

              <p>
                {device.controllerName || "No controller"} · Port{" "}
                {device.portNumber ?? "Not assigned"}
              </p>

              <div className="device-actions">
                <button
                  type="button"
                  className={
                    device.powerState === "ON"
                      ? "power-button turn-off"
                      : "power-button turn-on"
                  }
                  onClick={() => handlePowerChange(device)}
                >
                  {device.powerState === "ON" ? "Turn OFF" : "Turn ON"}
                </button>

                <button
                  type="button"
                  className="delete-device-button"
                  onClick={() => handleDeleteDevice(device.id)}
                >
                  Delete
                </button>
              </div>

              <button
                type="button"
                className="reassign-button"
                onClick={() => handleOpenReassign(device)}
              >
                Change Port
              </button>

              {reassigningDeviceId === device.id && (
                <div className="reassign-form">
                  <h5>Reassign Device Port</h5>

                  <label>Controller</label>

                  <select
                    value={assignment.controllerId}
                    onChange={handleAssignmentControllerChange}
                  >
                    <option value="">Select controller</option>

                    {controllers.map((controller) => (
                      <option key={controller.id} value={controller.id}>
                        {controller.name}
                      </option>
                    ))}
                  </select>

                  <label>Available Port</label>

                  <select
                    value={assignment.portNumber}
                    onChange={(event) =>
                      setAssignment((previous) => ({
                        ...previous,
                        portNumber: event.target.value,
                      }))
                    }
                    disabled={!assignment.controllerId}
                  >
                    <option value="">Select port</option>

                    {reassignmentPorts.map((port) => (
                      <option key={port.portNumber} value={port.portNumber}>
                        Port {port.portNumber}
                        {port.deviceId === device.id ? " (Current)" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="reassign-actions">
                    <button
                      type="button"
                      disabled={savingAssignment}
                      onClick={() => handleReassignDevice(device.id)}
                    >
                      {savingAssignment ? "Saving..." : "Save Assignment"}
                    </button>

                    <button
                      type="button"
                      className="cancel-reassign"
                      onClick={() => setReassigningDeviceId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
                </article>
              ))}
            </div>
          )}

          <button
            type="button"
            className="device-form-toggle"
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
          >
            {formOpen ? "Cancel" : "Add device"}
          </button>

          {formOpen && (
          <div className="create-device-section">
            <h4>Register a smart device</h4>

            <form className="device-form" onSubmit={handleCreateDevice}>
          <label htmlFor={`deviceName-${room.id}`}>Device name</label>

          <input
            id={`deviceName-${room.id}`}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Living Room Light"
            maxLength={100}
            required
          />

          <label htmlFor={`deviceType-${room.id}`}>Device type</label>

          <select
            id={`deviceType-${room.id}`}
            name="deviceType"
            value={form.deviceType}
            onChange={handleChange}
          >
            <option value="LIGHT">Light</option>
            <option value="FAN">Fan</option>
            <option value="AIR_CONDITIONER">Air Conditioner</option>
            <option value="SMART_PLUG">Smart Plug</option>
            <option value="SENSOR">Sensor</option>
          </select>

          <label htmlFor={`deviceDescription-${room.id}`}>Description</label>

          <textarea
            id={`deviceDescription-${room.id}`}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe this device"
            rows={2}
          />

          <label htmlFor={`deviceController-${room.id}`}>
            ESP32 Controller
          </label>

          <select
            id={`deviceController-${room.id}`}
            value={form.controllerId}
            onChange={handleControllerChange}
            required
          >
            <option value="">Select controller</option>

            {controllers.map((controller) => (
              <option key={controller.id} value={controller.id}>
                {controller.name}
              </option>
            ))}
          </select>

          <label htmlFor={`devicePort-${room.id}`}>Available port</label>

          <select
            id={`devicePort-${room.id}`}
            name="portNumber"
            value={form.portNumber}
            onChange={handleChange}
            required
            disabled={!form.controllerId}
          >
            <option value="">Select port</option>

            {availablePorts.map((port) => (
              <option key={port.portNumber} value={port.portNumber}>
                Port {port.portNumber}
              </option>
            ))}
          </select>

          {form.controllerId && availablePorts.length === 0 && (
            <p className="empty-message">
              No available ports on this controller.
            </p>
          )}

          <button
            type="submit"
            disabled={creating || !form.controllerId || !form.portNumber}
          >
            {creating ? "Registering..." : "Register Device"}
          </button>
            </form>
          </div>
          )}
        </div>
      )}
    </section>
  );
}
