
import { useState } from "react";
import roomService from "../services/roomService";
import ControllerList from "./ControllerList";
import DeviceManagement from "./DeviceManagement";

export default function RoomList({ home }) {
  const [expanded, setExpanded] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    roomType: "",
    description: "",
  });

  // Expand home and load its rooms
  async function handleExpand() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (!nextExpanded) return;

    setError("");
    setLoading(true);

    try {
      const data = await roomService.getRooms(home.id);
      setRooms(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshRooms() {
    setError("");
    setLoading(true);

    try {
      const data = await roomService.getRooms(home.id);
      setRooms(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatRoomType(type) {
    if (!type) return "General room";

    return type
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  // Handle form changes
  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  // Create a new room
  async function handleCreateRoom(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const createdRoom = await roomService.createRoom(
        home.id,
        form
      );

      // Add the newly created room to the UI
      setRooms((previousRooms) => [
        createdRoom,
        ...previousRooms,
      ]);

      setForm({
        name: "",
        roomType: "",
        description: "",
      });

      setCreateFormOpen(false);
      setSuccess("Room created successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to create room."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="room-section">

      <button
        type="button"
        className="room-toggle"
        onClick={handleExpand}
        aria-expanded={expanded}
      >
        <span className="room-toggle-title">
          <span className="room-toggle-icon" aria-hidden="true">▦</span>
          <span>Manage rooms</span>
        </span>
        <span className="room-toggle-action">
          {expanded ? "Hide" : "View rooms"}
          <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
        </span>
      </button>

      {expanded && (
        <div className="room-content">

          {error && (
            <div className="error-message">{error}</div>
          )}

          {success && (
            <div className="success-message">{success}</div>
          )}

          {loading ? (
            <div className="room-loading">
              <div className="dashboard-loader" />
              <p>Loading rooms...</p>
            </div>
          ) : (
            <>
              <div className="room-content-heading">
                <div>
                  <span className="eyebrow">ROOMS</span>
                  <h4>{home.name}</h4>
                </div>
                <div className="room-heading-actions">
                  <button
                    type="button"
                    className="room-create-toggle"
                    onClick={() => setCreateFormOpen((open) => !open)}
                    aria-expanded={createFormOpen}
                  >
                    {createFormOpen ? "Cancel" : "Add room"}
                  </button>
                  <button
                    type="button"
                    className="room-refresh-button"
                    onClick={handleRefreshRooms}
                    disabled={loading}
                  >
                    <span aria-hidden="true">↻</span>
                    Refresh
                  </button>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div className="room-empty">
                  <span aria-hidden="true">▦</span>
                  <h5>No rooms added yet</h5>
                  <p>Use Add room above to create the first room.</p>
                </div>
              ) : (
                <div className="room-grid">
                  {rooms.map((room) => (
                    <article
                      className="room-card"
                      key={room.id}
                    >
                      <div className="room-card-heading">
                        <div className="room-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M4 20V5h10v15M14 9h6v11M8 9h2M8 13h2" />
                          </svg>
                        </div>
                        <span>Room</span>
                      </div>

                      <h3>{room.name}</h3>

                      <div className="room-card-details">
                        <p>
                          <span aria-hidden="true">◫</span>
                          {formatRoomType(room.roomType)}
                        </p>
                        <p>
                          <span aria-hidden="true">≡</span>
                          {room.description || "No description"}
                        </p>
                        <small>Room ID: {room.id}</small>
                      </div>

                      <ControllerList
                        homeId={home.id}
                        room={room}
                      />
                      <DeviceManagement
                        homeId={home.id}
                        room={room}
                      />
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {createFormOpen && (
          <div className="create-room-section">
            <div className="create-room-heading">
              <span className="create-room-icon" aria-hidden="true">＋</span>
              <div>
                <span className="eyebrow">NEW SPACE</span>
                <h4>Add a room</h4>
              </div>
            </div>

            <form
              className="room-form"
              onSubmit={handleCreateRoom}
            >
              <label htmlFor={`roomName-${home.id}`}>
                Room name
              </label>

              <input
                id={`roomName-${home.id}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Bedroom"
                maxLength={100}
                required
              />

              <label htmlFor={`roomType-${home.id}`}>
                Room type
              </label>

              <select
                id={`roomType-${home.id}`}
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
              >
                <option value="">Select room type</option>
                <option value="LIVING_ROOM">Living Room</option>
                <option value="BEDROOM">Bedroom</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BATHROOM">Bathroom</option>
                <option value="DINING_ROOM">Dining Room</option>
                <option value="STUDY_ROOM">Study Room</option>
                <option value="OTHER">Other</option>
              </select>

              <label htmlFor={`roomDescription-${home.id}`}>
                Description
              </label>

              <textarea
                id={`roomDescription-${home.id}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this room"
                maxLength={500}
                rows={3}
              />

              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
          )}
        </div>
      )}

    </section>
  );
}
