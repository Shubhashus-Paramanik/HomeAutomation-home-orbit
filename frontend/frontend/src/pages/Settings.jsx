
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Settings() {
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailChanged, setEmailChanged] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Application preferences
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("homeOrbitTheme") ||
      localStorage.getItem("homeSyncTheme") ||
      "dark"
  );

  const [temperatureUnit, setTemperatureUnit] = useState(
    () =>
      localStorage.getItem("homeOrbitTemperatureUnit") ||
      localStorage.getItem("homeSyncTemperatureUnit") ||
      "CELSIUS"
  );

  // Apply theme globally and save it
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("homeOrbitTheme", theme);
  }, [theme]);

  // Save temperature preference
  useEffect(() => {
    localStorage.setItem("homeOrbitTemperatureUnit", temperatureUnit);
  }, [temperatureUnit]);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/auth/me");

        setProfile(response.data);

        setFormData({
          name: response.data.name,
          email: response.data.email,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Profile input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Password input changes
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  // Enable profile editing
  const handleEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
    });

    setError("");
    setSuccess("");
    setEditing(true);
  };

  // Cancel profile editing
  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Update profile
  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/auth/me", {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      const updatedProfile = response.data;

      const changedEmail =
        updatedProfile.email.toLowerCase() !==
        profile.email.toLowerCase();

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });

      setEditing(false);
      setEmailChanged(changedEmail);

      if (changedEmail) {
        setSuccess(
          "Profile updated. Please log in again with your new email."
        );
      } else {
        setSuccess("Your profile has been updated successfully.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordError(
        "New password must be between 8 and 72 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setPasswordSaving(true);

      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess(
        "Password changed successfully. Please log in again."
      );
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to change password. Please try again."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // Log out after password or email change
  const handleRelogin = () => {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

  // Format registration date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading screen
  if (loading) {
    return (
      <section className="content-page settings-page settings-loading">
        <div className="page-heading">
          <div>
            <span className="eyebrow">APPLICATION SETTINGS</span>
            <h1>Settings</h1>
            <p>Manage your account and application preferences.</p>
          </div>
        </div>

        <div className="settings-message">
          <div className="dashboard-loader" />
          <p>Loading your account information...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-page settings-page">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">APPLICATION SETTINGS</span>
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>
      </div>

      {/* Profile error and success */}
      {error && (
        <div className="settings-alert settings-error">
          {error}
        </div>
      )}

      {success && (
        <div className="settings-alert settings-success">
          {success}
        </div>
      )}

      {/* Re-login notification */}
      {(emailChanged || passwordSuccess) && (
        <div className="settings-relogin">
          <div>
            <strong>Sign in again</strong>
            <p>
              {passwordSuccess
                ? "Your password has changed. Sign in using your new password."
                : "Your email has changed. Sign in using your new email address."}
            </p>
          </div>

          <button onClick={handleRelogin}>
            Log in again
          </button>
        </div>
      )}

      {profile && (
        <>

          {/* PROFILE AND PERSONAL INFORMATION */}
          <div className="settings-layout">

            {/* Profile overview */}
            <div className="settings-card settings-profile-card">

              <div className="settings-card-heading">

                <div className="settings-avatar">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <span className="settings-profile-label">Account profile</span>
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>
                </div>

              </div>

              <div className="profile-info-row">
                <span>Account ID</span>
                <strong>#{profile.id}</strong>
              </div>

              <div className="profile-info-row">
                <span>Account Role</span>
                <strong>{profile.role}</strong>
              </div>

              <div className="profile-info-row">
                <span>Member Since</span>
                <strong>{formatDate(profile.createdAt)}</strong>
              </div>

            </div>

            {/* Personal information */}
            <div className="settings-card settings-edit-card">

              <div className="settings-section-heading">

                <div>
                  <h2>Personal Information</h2>
                  <p>Update your account details.</p>
                </div>

                {!editing && !emailChanged && (
                  <button
                    className="settings-edit-button"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                )}

              </div>

              <form onSubmit={handleSave} className="settings-form">

                <div className="settings-field">
                  <label htmlFor="profileName">
                    Full Name
                  </label>

                  <input
                    id="profileName"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="profileEmail">
                    Email Address
                  </label>

                  <input
                    id="profileEmail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    maxLength={255}
                    required
                  />

                  <small>
                    Changing your email requires logging in again.
                  </small>
                </div>

                {editing && (
                  <div className="settings-form-actions">

                    <button
                      type="submit"
                      className="settings-save-button"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="settings-cancel-button"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                  </div>
                )}

              </form>

            </div>

          </div>

          {/* PASSWORD AND SECURITY */}
          <div className="settings-card settings-password-card">

            <div className="settings-section-heading">

              <div>
                <h2>Password & Security</h2>
                <p>
                  Change your password to keep your HomeOrbit account secure.
                </p>
              </div>

              <div className="security-icon" aria-hidden="true">
                🔒
              </div>

            </div>

            {passwordError && (
              <div className="settings-alert settings-error">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="settings-alert settings-success">
                {passwordSuccess}
              </div>
            )}

            <form
              className="settings-password-form"
              onSubmit={handleChangePassword}
            >

              {/* Current password */}
              <div className="settings-field">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    maxLength={72}
                    autoComplete="current-password"
                    required
                    disabled={passwordSaving || !!passwordSuccess}
                  />

                  <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() => setShowCurrent((value) => !value)}
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* New password */}
              <div className="settings-field">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    required
                    disabled={passwordSaving || !!passwordSuccess}
                  />

                  <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() => setShowNew((value) => !value)}
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>

                </div>

                <small>
                  Password must contain 8 to 72 characters.
                </small>

              </div>

              {/* Confirm password */}
              <div className="settings-field">

                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    maxLength={72}
                    autoComplete="new-password"
                    required
                    disabled={passwordSaving || !!passwordSuccess}
                  />

                  <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() => setShowConfirm((value) => !value)}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {!passwordSuccess && (
                <button
                  type="submit"
                  className="settings-password-submit"
                  disabled={passwordSaving}
                >
                  {passwordSaving
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              )}

            </form>

          </div>

          {/* APPLICATION PREFERENCES */}
          <div className="settings-card preferences-card">

            <div className="settings-section-heading">

              <div>
                <h2>Application Preferences</h2>
                <p>
                  Customize how HomeOrbit looks and displays information.
                </p>
              </div>

              <span className="preferences-icon" aria-hidden="true">⚙</span>

            </div>

            {/* Theme preference */}
            <div className="preference-row">

              <div className="preference-description">

                <span className="preference-icon" aria-hidden="true">◐</span>

                <div>
                  <h3>Appearance</h3>
                  <p>Choose your preferred application theme.</p>
                </div>

              </div>

              <select
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                className="preference-select"
                aria-label="Application theme"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>

            </div>

            {/* Temperature preference */}
            <div className="preference-row">

              <div className="preference-description">

                <span className="preference-icon" aria-hidden="true">°</span>

                <div>
                  <h3>Temperature Unit</h3>
                  <p>Choose how temperature readings are displayed.</p>
                </div>

              </div>

              <select
                value={temperatureUnit}
                onChange={(event) => setTemperatureUnit(event.target.value)}
                className="preference-select"
                aria-label="Temperature unit"
              >
                <option value="CELSIUS">Celsius (°C)</option>
                <option value="FAHRENHEIT">Fahrenheit (°F)</option>
              </select>

            </div>

            <p className="preferences-note">
              Your preferences are automatically saved in this browser.
            </p>

          </div>

        </>
      )}

    </section>
  );
}
