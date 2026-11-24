const homeFeatures = [
  {
    label: "Homes",
    className: "login-feature-home",
    icon: <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />,
  },
  {
    label: "Rooms",
    className: "login-feature-room",
    icon: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  },
  {
    label: "Devices",
    className: "login-feature-device",
    icon: <path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" />,
  },
  {
    label: "Schedules",
    className: "login-feature-schedule",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  },
];

export default function AuthBranding() {
  return (
    <section className="login-branding" aria-label="HomeOrbit overview">
      <div className="login-brand">
        <span className="login-brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />
          </svg>
        </span>
        <span className="login-brand-name">
          HomeOrbit
          <small>SMART HOME</small>
        </span>
      </div>

      <div className="login-intro">
        <span className="login-eyebrow">SMART HOME MANAGEMENT</span>
        <h2>One Orbit. Every Smart Device.</h2>
        <p>
          Organize your homes, rooms, devices, and schedules from one
          straightforward workspace.
        </p>
      </div>

      <div className="login-feature-grid" aria-label="HomeOrbit features">
        {homeFeatures.map((feature) => (
          <div className="login-feature" key={feature.label}>
            <span
              className={`login-feature-icon ${feature.className}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">{feature.icon}</svg>
            </span>
            <span>{feature.label}</span>
          </div>
        ))}
      </div>

      <p className="login-brand-note">
        One clear view of your connected home.
      </p>
    </section>
  );
}
