
import { useEffect, useState } from "react";
import homeService from "../services/homeService";
import roomService from "../services/roomService";
import RoomList from "../components/RoomList";

export default function Homes() {
  const [homes, setHomes] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
  });

  // Load homes
  async function loadHomes() {
    setError("");
    setRefreshing(true);

    try {
      const data = await homeService.getHomes();
      setHomes(data);
      const roomGroups = await Promise.all(
        data.map((home) => roomService.getRooms(home.id)),
      );
      setTotalRooms(roomGroups.reduce((total, rooms) => total + rooms.length, 0));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your homes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHomes();
  }, []);

  // Handle form changes
  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  // Create home
  async function handleCreateHome(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const createdHome = await homeService.createHome(form);

      setHomes((previous) => [
        createdHome,
        ...previous,
      ]);

      setForm({
        name: "",
        address: "",
        description: "",
      });

      setSuccess("Home created successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to create home."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="content-page homes-page">

      <div className="page-heading homes-page-heading">
        <div>
          <span className="eyebrow">HOME MANAGEMENT</span>
          <h1>My Homes</h1>
          <p>
            Manage properties, rooms, and connected spaces.
          </p>
        </div>

        <button
          type="button"
          className="homes-refresh-button"
          onClick={loadHomes}
          disabled={refreshing}
        >
          <span aria-hidden="true">↻</span>
          {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {success && (
        <div className="success-message">{success}</div>
      )}

      <section className="homes-overview" aria-label="Homes overview">
        <article>
          <span className="homes-overview-icon">⌂</span>
          <div>
            <span>Properties</span>
            <strong>{homes.length}</strong>
          </div>
        </article>
        <article>
          <span className="homes-overview-icon">▦</span>
          <div>
            <span>Total rooms</span>
            <strong>{totalRooms}</strong>
          </div>
        </article>
        <article>
          <span className="homes-overview-icon">＋</span>
          <div>
            <span>New property</span>
            <strong>Ready</strong>
          </div>
        </article>
      </section>

      <div className="homes-layout">
        <section className="homes-management-section">

          <div className="section-heading">
            <div>
              <span className="eyebrow">PROPERTIES</span>
              <h2>My properties</h2>
            </div>
            <span className="homes-count">{homes.length} {homes.length === 1 ? "home" : "homes"}</span>
          </div>

          {loading ? (
            <div className="homes-loading">
              <div className="dashboard-loader" />
              <p>Loading properties...</p>
            </div>
          ) : homes.length === 0 ? (
            <div className="page-placeholder homes-empty">
              <span className="homes-empty-icon">⌂</span>
              <h2>No homes added yet</h2>
              <p>Create your first home and begin organizing its rooms.</p>
            </div>
          ) : (
            <div className="home-grid ">

              {homes.map((home, index) => (
                <article
                  className="home-card"
                  key={home.id}
                >
                  <div className="home-card-heading">
                    <div className="home-icon-box">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M9.5 19v-6h5v6" />
                      </svg>
                    </div>
                    <span>Property {String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <h3>{home.name}</h3>

                  <div className="home-card-details">
                    <p>
                      <span aria-hidden="true">⌖</span>
                      {home.address || "Address not provided"}
                    </p>
                    <p>
                      <span aria-hidden="true">≡</span>
                      {home.description || "No description"}
                    </p>
                  </div>

                  <div className="home-card-divider" />

                  <RoomList home={home} />

                </article>
              ))}

            </div>
          )}

        </section>

        <aside className="create-home-section">

          <div className="create-home-heading">
            <span className="create-home-icon">＋</span>
            <div>
              <span className="eyebrow">NEW PROPERTY</span>
              <h2>Add a home</h2>
            </div>
          </div>

          <form
            className="home-form"
            onSubmit={handleCreateHome}
          >

            <label htmlFor="homeName">Home name</label>

            <input
              id="homeName"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. My Kolkata Home"
              maxLength={100}
              required
            />

            <label htmlFor="homeAddress">Address</label>

            <input
              id="homeAddress"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="City, State"
            />

            <label htmlFor="homeDescription">
              Description
            </label>

            <textarea
              id="homeDescription"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe this property"
              rows={4}
            />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create home"}
              {!creating && <span aria-hidden="true">→</span>}
            </button>

          </form>

        </aside>
      </div>

    </main>
  );
}
