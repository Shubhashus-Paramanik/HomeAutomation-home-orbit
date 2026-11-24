import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthBranding from "../components/AuthBranding";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
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
      const response = await api.post("/auth/login", form);

      localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Check your email and password.",
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
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
            </svg>
          </span>
          <span>YOUR HOMEORBIT ACCOUNT</span>
        </div>

        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your home dashboard.</p>

        {location.state?.message && (
          <div className="login-success" role="status">
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="login-error" id="login-error" role="alert">
            {error}
          </div>
        )}

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
              aria-describedby={error ? "login-error" : undefined}
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
        </div>

        <button className="login-submit" type="submit" disabled={loading}>
          <span>{loading ? "Signing in..." : "Sign in"}</span>
          {!loading && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          )}
        </button>

        <p className="auth-footer login-footer">
          New to HomeOrbit? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
