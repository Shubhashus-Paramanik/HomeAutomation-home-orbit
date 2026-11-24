import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBranding from "../components/AuthBranding";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);

      navigate("/login", {
        replace: true,
        state: { message: "Registration successful. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page login-page">
      <AuthBranding />

      <form className="auth-card login-card" onSubmit={handleSubmit}>
        <div className="login-card-kicker">
          <span className="login-access-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </span>
          <span>CREATE YOUR ACCOUNT</span>
        </div>

        <h1>Create your account</h1>
        <p className="login-subtitle">
          Set up your HomeOrbit workspace in a few steps.
        </p>

        {error && (
          <div className="login-error" id="register-error" role="alert">
            {error}
          </div>
        )}

        <div className="login-field">
          <label htmlFor="name">Full name</label>
          <div className="login-input-wrap">
            <svg className="login-input-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength={100}
              autoComplete="name"
              required
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="email">Email address</label>
          <div className="login-input-wrap">
            <svg className="login-input-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div className="login-input-wrap">
            <svg className="login-input-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
            </svg>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={8}
              autoComplete="new-password"
              required
              aria-describedby={
                error
                  ? "register-error password-requirement"
                  : "password-requirement"
              }
            />
          </div>
          <p className="login-field-hint" id="password-requirement">
            Use at least 8 characters.
          </p>
        </div>

        <button className="login-submit" type="submit" disabled={loading}>
          <span>{loading ? "Creating account..." : "Create account"}</span>
          {!loading && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          )}
        </button>

        <p className="auth-footer login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
