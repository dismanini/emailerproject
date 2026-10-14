
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Save, User, Mail, Bell, CheckCircle } from "lucide-react";
import "./Settings.css";

type SettingsForm = {
  adminName: string;
  adminEmail: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  campaignNotifications: boolean;
  failureNotifications: boolean;
};

type ApiSettings = {
  admin_name: string;
  admin_email: string;
  sender_name: string;
  sender_email: string;
  reply_to_email: string;
  campaign_notifications: boolean | number;
  failure_notifications: boolean | number;
};

const API_URL = "http://localhost:5000/api";

const defaultSettings: SettingsForm = {
  adminName: "Admin",
  adminEmail: "",
  senderName: "Dynamic Emailer",
  senderEmail: "",
  replyToEmail: "",
  campaignNotifications: true,
  failureNotifications: true,
};

function toFormSettings(data: ApiSettings): SettingsForm {
  return {
    adminName: data.admin_name ?? "Admin",
    adminEmail: data.admin_email ?? "",
    senderName: data.sender_name ?? "Dynamic Emailer",
    senderEmail: data.sender_email ?? "",
    replyToEmail: data.reply_to_email ?? "",
    campaignNotifications:
      data.campaign_notifications === true ||
      data.campaign_notifications === 1,
    failureNotifications:
      data.failure_notifications === true ||
      data.failure_notifications === 1,
  };
}

export default function Settings() {
  const [settings, setSettings] =
    useState<SettingsForm>(defaultSettings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from MySQL through the backend API
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/settings`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load settings."
          );
        }

        setSettings(toFormSettings(result.settings));
      } catch (err) {
        console.error("Unable to load settings:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load settings. Check your backend server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  }

  // Save settings to MySQL through the backend API
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_name: settings.adminName,
          admin_email: settings.adminEmail,
          sender_name: settings.senderName,
          sender_email: settings.senderEmail,
          reply_to_email: settings.replyToEmail,
          campaign_notifications: settings.campaignNotifications,
          failure_notifications: settings.failureNotifications,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save settings."
        );
      }

      setMessage("Settings saved successfully to the database.");
    } catch (err) {
      console.error("Unable to save settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="settings-page">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your account, email preferences, and notifications.
          </p>
        </div>
      </div>

      {message && (
        <div className="settings-message" role="status">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="settings-message settings-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="settings-card">
          <div className="settings-section-heading">
            <User size={21} />
            <div>
              <h2>Profile Settings</h2>
              <p>Manage your administrator details.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="adminName">Admin Name</label>
              <input
                id="adminName"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="adminEmail">Admin Email</label>
              <input
                id="adminEmail"
                name="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-section-heading">
            <Mail size={21} />
            <div>
              <h2>Email Settings</h2>
              <p>
                Configure the sender details used by your email campaigns.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="senderName">Sender Name</label>
              <input
                id="senderName"
                name="senderName"
                value={settings.senderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="senderEmail">Sender Email</label>
              <input
                id="senderEmail"
                name="senderEmail"
                type="email"
                value={settings.senderEmail}
                onChange={handleChange}
                placeholder="newsletter@example.com"
                required
              />
            </div>

            <div className="settings-field settings-full-width">
              <label htmlFor="replyToEmail">Reply-To Email</label>
              <input
                id="replyToEmail"
                name="replyToEmail"
                type="email"
                value={settings.replyToEmail}
                onChange={handleChange}
                placeholder="support@example.com"
              />
              <small>
                Your backend must use this value when sending emails.
              </small>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-section-heading">
            <Bell size={21} />
            <div>
              <h2>Notifications</h2>
              <p>Choose which campaign alerts you want to enable.</p>
            </div>
          </div>

          <label className="settings-toggle">
            <span>
              <strong>Campaign notifications</strong>
              <small>
                Receive alerts when campaign activity completes.
              </small>
            </span>
            <input
              type="checkbox"
              name="campaignNotifications"
              checked={settings.campaignNotifications}
              onChange={handleChange}
            />
          </label>

          <label className="settings-toggle">
            <span>
              <strong>Failure notifications</strong>
              <small>
                Enable alerts for failed campaign sends.
              </small>
            </span>
            <input
              type="checkbox"
              name="failureNotifications"
              checked={settings.failureNotifications}
              onChange={handleChange}
            />
          </label>
        </section>

        <div className="settings-footer">
          <button
            type="submit"
            className="settings-save-button"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
