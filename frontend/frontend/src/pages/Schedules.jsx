
import { useCallback, useEffect, useState } from "react";

import scheduleService from "../services/scheduleService";
import homeService from "../services/homeService";
import roomService from "../services/roomService";
import deviceService from "../services/deviceService";

const WEEKDAYS = [
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
  { label: "Sun", value: "SUNDAY" },
];

const INITIAL_FORM = {
  name: "",
  homeId: "",
  roomId: "",
  deviceId: "",
  action: "TURN_ON",
  executionTime: "06:00",
  days: [],
};

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [homes, setHomes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSchedules = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
      setError("");
    } catch (err) {
      console.error("Schedule loading error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load schedules."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Load homes and schedules
  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const [homeData, scheduleData] = await Promise.all([
          homeService.getHomes(),
          scheduleService.getSchedules(),
        ]);

        setHomes(homeData);
        setSchedules(scheduleData);
      } catch (err) {
        console.error("Scheduling page initialization error:", err);

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to initialize the Scheduling page."
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  // Refresh schedules periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadSchedules(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadSchedules]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Load rooms when a home is selected
  async function handleHomeChange(event) {
    const homeId = event.target.value;

    setForm((previous) => ({
      ...previous,
      homeId,
      roomId: "",
      deviceId: "",
    }));

    setRooms([]);
    setDevices([]);
    setError("");

    if (!homeId) return;

    setLoadingRooms(true);

    try {
      const data = await roomService.getRooms(homeId);
      setRooms(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load rooms."
      );
    } finally {
      setLoadingRooms(false);
    }
  }

  // Load devices when a room is selected
  async function handleRoomChange(event) {
    const roomId = event.target.value;

    setForm((previous) => ({
      ...previous,
      roomId,
      deviceId: "",
    }));

    setDevices([]);
    setError("");

    if (!roomId || !form.homeId) return;

    setLoadingDevices(true);

    try {
      const data = await deviceService.getDevices(
        form.homeId,
        roomId
      );

      setDevices(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load devices."
      );
    } finally {
      setLoadingDevices(false);
    }
  }

  function toggleDay(day) {
    setForm((previous) => ({
      ...previous,
      days: previous.days.includes(day)
        ? previous.days.filter((item) => item !== day)
        : [...previous.days, day],
    }));
  }

  function selectAllDays() {
    setForm((previous) => ({
      ...previous,
      days: WEEKDAYS.map((day) => day.value),
    }));
  }

  function clearDays() {
    setForm((previous) => ({
      ...previous,
      days: [],
    }));
  }

  // Create a schedule
  async function handleCreateSchedule(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.homeId ||
      !form.roomId ||
      !form.deviceId ||
      form.days.length === 0
    ) {
      setError("Select a home, room, device, and at least one weekday.");
      return;
    }

    setSaving(true);

    try {
      const scheduleData = {
        name: form.name.trim(),
        action: form.action,
        executionTime: `${form.executionTime}:00`,
        days: form.days,
      };

      await scheduleService.createSchedule(
        form.homeId,
        form.roomId,
        form.deviceId,
        scheduleData
      );

      setSuccess("Schedule created successfully.");

      setForm(INITIAL_FORM);
      setRooms([]);
      setDevices([]);

      await loadSchedules(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to create schedule."
      );
    } finally {
      setSaving(false);
    }
  }

  // Enable or disable schedule
  async function handleToggleSchedule(schedule) {
    setBusyId(schedule.id);
    setError("");
    setSuccess("");

    try {
      const updated = await scheduleService.setEnabled(
        schedule.id,
        !schedule.enabled
      );

      setSchedules((previous) =>
        previous.map((item) =>
          item.id === schedule.id ? updated : item
        )
      );

      setSuccess(
        updated.enabled
          ? "Schedule enabled."
          : "Schedule disabled."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update schedule."
      );
    } finally {
      setBusyId(null);
    }
  }

  // Delete schedule
  async function handleDeleteSchedule(schedule) {
    const confirmed = window.confirm(
      `Delete the schedule "${schedule.name}"?`
    );

    if (!confirmed) return;

    setBusyId(schedule.id);
    setError("");
    setSuccess("");

    try {
      await scheduleService.deleteSchedule(schedule.id);

      setSchedules((previous) =>
        previous.filter((item) => item.id !== schedule.id)
      );

      setSuccess("Schedule deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to delete schedule."
      );
    } finally {
      setBusyId(null);
    }
  }

  const enabledCount = schedules.filter((item) => item.enabled).length;
  const disabledCount = schedules.length - enabledCount;
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ENABLED" && schedule.enabled) ||
      (statusFilter === "DISABLED" && !schedule.enabled);
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      schedule.name?.toLowerCase().includes(searchText) ||
      schedule.deviceName?.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <main className="content-page schedules-page schedules-loading">
        <div className="dashboard-loader" aria-label="Loading schedules" />
        <p>Loading schedules...</p>
      </main>
    );
  }

  return (
    <main className="content-page schedules-page">

      <div className="page-heading schedules-page-heading">
        <div>
          <span className="eyebrow">AUTOMATION MANAGEMENT</span>
          <h1>Schedules</h1>
          <p>
            Automate your smart devices using time-based schedules.
          </p>
        </div>

        <button
          type="button"
          className="schedules-refresh-button"
          onClick={() => loadSchedules(true)}
        >
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Schedule statistics */}
      <section className="schedule-stats">

        <article className="schedule-stat-card">
          <div className="schedule-stat-icon total">▦</div>
          <div><p>Total schedules</p>
          <h2>{schedules.length}</h2>
          </div>
        </article>

        <article className="schedule-stat-card">
          <div className="schedule-stat-icon enabled">●</div>
          <div><p>Enabled</p><h2>{enabledCount}</h2></div>
        </article>

        <article className="schedule-stat-card">
          <div className="schedule-stat-icon disabled">●</div>
          <div><p>Disabled</p><h2>{disabledCount}</h2></div>
        </article>

      </section>

      <div className="schedule-workspace">
      {/* Create schedule */}
      <section className="schedule-form-section">
        <div className="schedule-panel-heading">
          <div>
            <span className="eyebrow">NEW AUTOMATION</span>
            <h2>Create a schedule</h2>
          </div>
          <span className="schedule-panel-icon">＋</span>
        </div>

        <form
          className="schedule-form"
          onSubmit={handleCreateSchedule}
        >

          <label htmlFor="scheduleName">Schedule name</label>
          <input
            id="scheduleName"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Morning Light"
            maxLength={100}
            required
          />

          <label htmlFor="scheduleHome">Home</label>
          <select
            id="scheduleHome"
            value={form.homeId}
            onChange={handleHomeChange}
            required
          >
            <option value="">Select home</option>
            {homes.map((home) => (
              <option key={home.id} value={home.id}>
                {home.name}
              </option>
            ))}
          </select>

          <label htmlFor="scheduleRoom">Room</label>
          <select
            id="scheduleRoom"
            value={form.roomId}
            onChange={handleRoomChange}
            disabled={!form.homeId || loadingRooms}
            required
          >
            <option value="">
              {loadingRooms ? "Loading rooms..." : "Select room"}
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>

          <label htmlFor="scheduleDevice">Device</label>
          <select
            id="scheduleDevice"
            name="deviceId"
            value={form.deviceId}
            onChange={handleChange}
            disabled={!form.roomId || loadingDevices}
            required
          >
            <option value="">
              {loadingDevices ? "Loading devices..." : "Select device"}
            </option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.deviceType})
              </option>
            ))}
          </select>

          <label htmlFor="scheduleAction">Action</label>
          <select
            id="scheduleAction"
            name="action"
            value={form.action}
            onChange={handleChange}
          >
            <option value="TURN_ON">Turn ON</option>
            <option value="TURN_OFF">Turn OFF</option>
          </select>

          <label htmlFor="executionTime">Execution time</label>
          <input
            id="executionTime"
            name="executionTime"
            type="time"
            value={form.executionTime}
            onChange={handleChange}
            required
          />

          <div className="schedule-days-heading">
            <label>Repeat on</label>

            <div>
              <button type="button" onClick={selectAllDays}>
                All days
              </button>
              <button type="button" onClick={clearDays}>
                Clear
              </button>
            </div>
          </div>

          <div className="schedule-days">
            {WEEKDAYS.map((day) => (
              <label
                className={`schedule-day ${
                  form.days.includes(day.value) ? "selected" : ""
                }`}
                key={day.value}
              >
                <input
                  type="checkbox"
                  checked={form.days.includes(day.value)}
                  onChange={() => toggleDay(day.value)}
                />
                {day.label}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="create-schedule-button"
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Schedule"}
          </button>

        </form>
      </section>

      {/* Existing schedules */}
      <section className="schedule-list-section">

        <div className="section-heading">
          <div>
            <span className="eyebrow">AUTOMATIONS</span>
            <h2>My schedules</h2>
          </div>
          <span className="schedules-count">{filteredSchedules.length} {filteredSchedules.length === 1 ? "schedule" : "schedules"}</span>
        </div>

        <div className="schedule-list-toolbar">
          <label className="schedule-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search schedules..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter schedule status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="ENABLED">Enabled</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="page-placeholder">
            <span className="schedules-empty-icon">◷</span>
            <h2>No schedules found</h2>
            <p>
              Create a schedule or adjust the filters.
            </p>
          </div>
        ) : (
          <div className="schedule-grid">

            {filteredSchedules.map((schedule) => (
              <article
                className="schedule-card"
                key={schedule.id}
              >

                <div className="schedule-card-header">
                  <span className="schedule-icon">⏰</span>

                  <span
                    className={`schedule-status ${
                      schedule.enabled ? "schedule-enabled" : "schedule-disabled"
                    }`}
                  >
                    {schedule.enabled ? "ENABLED" : "DISABLED"}
                  </span>
                </div>

                <h3>{schedule.name}</h3>

                <p className="schedule-device">
                  Device: {schedule.deviceName}
                </p>

                <div className="schedule-time">
                  {schedule.executionTime?.slice(0, 5)}
                </div>

                <p className="schedule-action">
                  Action:{" "}
                  <strong>
                    {schedule.action === "TURN_ON"
                      ? "Turn ON"
                      : "Turn OFF"}
                  </strong>
                </p>

                <div className="schedule-repeat">
                  {WEEKDAYS
                    .filter((day) => schedule.days?.includes(day.value))
                    .map((day) => (
                      <span key={day.value}>{day.label}</span>
                    ))}
                </div>

                <p className="schedule-last-run">
                  Last executed:{" "}
                  {schedule.lastExecutedAt
                    ? new Date(schedule.lastExecutedAt).toLocaleString()
                    : "Never"}
                </p>

                <div className="schedule-actions">

                  <button
                    type="button"
                    className="schedule-toggle-button"
                    disabled={busyId === schedule.id}
                    onClick={() => handleToggleSchedule(schedule)}
                  >
                    {busyId === schedule.id
                      ? "Please wait..."
                      : schedule.enabled
                        ? "Disable"
                        : "Enable"}
                  </button>

                  <button
                    type="button"
                    className="schedule-delete-button"
                    disabled={busyId === schedule.id}
                    onClick={() => handleDeleteSchedule(schedule)}
                  >
                    Delete
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      </div>

    </main>
  );
}
