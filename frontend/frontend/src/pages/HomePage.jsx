import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const [lightOn, setLightOn] = useState(true);
  const [fanOn, setFanOn] = useState(false);
  const [scheduleHover, setScheduleHover] = useState(false);
  const [homeHover, setHomeHover] = useState(false);

  const activeDevices = Number(lightOn) + Number(fanOn);

  const features = [
    {
      icon: "🏠",
      title: "Multiple Homes",
      description:
        "Manage multiple homes and organize every space from one centralized platform.",
    },
    {
      icon: "🚪",
      title: "Room Management",
      description:
        "Organize your smart devices room by room and keep everything structured.",
    },
    {
      icon: "💡",
      title: "Smart Device Control",
      description:
        "Control your lights, fans and connected devices from your dashboard.",
    },
    {
      icon: "⏰",
      title: "Smart Scheduling",
      description:
        "Schedule your devices to turn on or off automatically at your preferred time.",
    },
    {
      icon: "📡",
      title: "ESP32 Integration",
      description:
        "Connect ESP32-based controllers and manage multiple device channels.",
    },
    {
      icon: "📊",
      title: "Centralized Dashboard",
      description:
        "Get an organized overview of your homes, rooms, controllers and devices.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Register for your personal HomeOrbit workspace.",
    },
    {
      number: "02",
      title: "Add Your Home",
      description: "Create homes and organize them into individual rooms.",
    },
    {
      number: "03",
      title: "Connect Devices",
      description: "Add controllers and assign devices to their ports.",
    },
    {
      number: "04",
      title: "Control Your Home",
      description: "Manage devices and automate daily activities.",
    },
  ];

  return (
    <div className="public-home">
      {/* NAVBAR */}
      <header className="public-navbar">
        <Link to="/" className="public-logo">
          <span className="public-logo-icon">⌂</span>
          <span>
            <strong>HomeOrbit</strong>
            <small>SMART HOME</small>
          </span>
        </Link>

        <nav className="public-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="public-nav-actions">
          <Link to="/login" className="public-signin">
            Sign In
          </Link>
          <Link to="/register" className="public-get-started">
            Get Started <span>→</span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="public-hero" id="home">
        <div className="public-hero-overlay"></div>

        <div className="public-hero-content">
          <div className="public-hero-text">
            <span className="public-eyebrow">
              <span className="hero-live-dot"></span>
              THE FUTURE OF SMART LIVING
            </span>

            <h1>
              Your Entire Home,
              <br />
              <span>One Connected Orbit.</span>
            </h1>

            <p>
              Take control of your connected home with HomeOrbit. Manage rooms,
              control smart devices and automate your everyday activities from
              one intelligent platform.
            </p>

            <div className="public-hero-buttons">
              <Link to="/register" className="public-primary-btn">
                Get Started Free <span>→</span>
              </Link>

              <a href="#features" className="public-secondary-btn">
                Explore Features
              </a>
            </div>

            <div className="public-hero-note">
              One platform. Your entire smart home.
            </div>
          </div>

          {/* INTERACTIVE DASHBOARD */}
          <div className="public-dashboard-preview">
            <div className="preview-header">
              <div>
                <span className="preview-dot"></span>
                <strong>HomeOrbit Dashboard</strong>
              </div>
              <span className="preview-status">DEMO MODE</span>
            </div>

            <div className="preview-welcome">
              <small>YOUR SMART HOME</small>
              <h3>Good evening! 👋</h3>
              <p>Your home is looking good today.</p>
            </div>

            {/* INTERACTIVE STATS */}
            <div className="preview-stats">
              <div
                className={homeHover ? "preview-stat-active" : ""}
                onMouseEnter={() => setHomeHover(true)}
                onMouseLeave={() => setHomeHover(false)}
              >
                <span>🏠</span>
                <strong>01 Home</strong>
                <small>Connected space</small>
              </div>

              <div className="preview-stat-active">
                <span>💡</span>
                <strong>{activeDevices} Active</strong>
                <small>Demo devices</small>
              </div>

              <div
                className={`preview-schedule-stat ${scheduleHover ? "schedule-hovered" : ""}`}
                onMouseEnter={() => setScheduleHover(true)}
                onMouseLeave={() => setScheduleHover(false)}
                onFocus={() => setScheduleHover(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setScheduleHover(false);
                  }
                }}
                tabIndex={0}
              >
                <span>⏰</span>
                <strong>Schedules</strong>
                <small>Automation</small>

                {scheduleHover && (
                  <div className="schedule-tooltip">
                    <span className="schedule-tooltip-label">
                      UPCOMING AUTOMATION
                    </span>
                    <strong>Living Room Light</strong>
                    <span>Tomorrow · 6:30 AM</span>
                    <div className="schedule-tooltip-status">
                      <span></span> Scheduled to turn ON
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="preview-room-heading">
              <strong>Living Room</strong>
              <span>2 Devices</span>
            </div>

            {/* LIGHT CARD */}
            <button
              type="button"
              className={`preview-device interactive-device ${lightOn ? "device-active" : "device-inactive"}`}
              onClick={() => setLightOn(!lightOn)}
              aria-pressed={lightOn}
            >
              <div className="preview-device-info">
                <span
                  className={`preview-device-icon ${lightOn ? "glowing-light" : ""}`}
                >
                  💡
                </span>
                <div>
                  <strong>Living Room Light</strong>
                  <small>Smart light · Channel 01</small>
                </div>
              </div>

              <div className="device-control">
                <span
                  className={`device-status ${lightOn ? "status-on" : "status-off"}`}
                >
                  {lightOn ? "ON" : "OFF"}
                </span>
                <span className={`device-switch ${lightOn ? "switch-on" : ""}`}>
                  <span></span>
                </span>
              </div>
            </button>

            {/* FAN CARD */}
            <button
              type="button"
              className={`preview-device interactive-device ${fanOn ? "device-active" : "device-inactive"}`}
              onClick={() => setFanOn(!fanOn)}
              aria-pressed={fanOn}
            >
              <div className="preview-device-info">
                <span
                  className={`preview-device-icon ${fanOn ? "fan-running" : ""}`}
                >
                  🌀
                </span>
                <div>
                  <strong>Bedroom Fan</strong>
                  <small>Smart fan · Channel 02</small>
                </div>
              </div>

              <div className="device-control">
                <span
                  className={`device-status ${fanOn ? "status-on" : "status-off"}`}
                >
                  {fanOn ? "ON" : "OFF"}
                </span>
                <span className={`device-switch ${fanOn ? "switch-on" : ""}`}>
                  <span></span>
                </span>
              </div>
            </button>

            <div className="preview-footer-status">
              <span className="preview-dot"></span>
              Interactive product demonstration
            </div>
          </div>
        </div>

        <div className="public-hero-bottom">
           
        <span className="hero-color-one">SMART HOMES</span>
        <span className="hero-color-two">SMART DEVICES</span>
        <span className="hero-color-three">SMART AUTOMATION</span>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="public-intro" id="about">
        <span className="public-section-label">WELCOME TO HOMEORBIT</span>

        <h2>
          Smart Home Management,
          <br />
          <span>Made Simple.</span>
        </h2>

        <p>
          HomeOrbit brings your homes, rooms, controllers and devices together
          in one convenient workspace. Whether you want to control a device or
          schedule an automation, everything starts from one place.
        </p>
      </section>

      {/* FEATURES */}
      <section className="public-features" id="features">
        <div className="public-section-heading">
          <span className="public-section-label">WHAT YOU CAN DO</span>
          <h2>Everything Your Smart Home Needs</h2>
          <p>
            Powerful tools to organize, control and automate your connected
            home.
          </p>
        </div>

        <div className="public-feature-grid">
          {features.map((feature, index) => (
            <article className="public-feature-card" key={index}>
              <div className="public-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="public-feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="public-how" id="how-it-works">
        <div className="public-section-heading">
          <span className="public-section-label">GET STARTED</span>
          <h2>Your Smart Home in Four Steps</h2>
          <p>Start managing your connected home with a simple setup.</p>
        </div>

        <div className="public-steps">
          {steps.map((step) => (
            <div className="public-step" key={step.number}>
              <span className="public-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="public-cta">
        <div>
          <span className="public-section-label">
            YOUR SMARTER HOME STARTS HERE
          </span>
          <h2>Bring Your Entire Home Into One Orbit.</h2>
          <p>
            Create your HomeOrbit account and take the first step towards
            smarter home management.
          </p>
        </div>

        <Link to="/register" className="public-primary-btn">
          Create Your Account <span>→</span>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="public-footer">
        <div className="public-footer-main">
          <Link to="/" className="public-logo">
            <span className="public-logo-icon">⌂</span>
            <span>
              <strong>HomeOrbit</strong>
              <small>SMART HOME</small>
            </span>
          </Link>

          <p>
            Your Entire Home, One Connected Orbit.
            <br />
            Making smart home management simpler.
          </p>
        </div>

        <div className="public-footer-links">
          <div>
            <strong>Explore</strong>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div>
            <strong>Account</strong>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>
            © {new Date().getFullYear()} HomeOrbit. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
