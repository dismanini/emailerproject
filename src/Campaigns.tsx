
import { useCallback, useEffect, useState } from "react";
import "./Campaigns.css";

const API_URL = "http://localhost:5000/api";

interface Campaign {
  id: number;
  name: string;
  template_id: number | null;
  template_name?: string | null;
  subject?: string | null;
  status: "draft" | "scheduled" | "sent";
  created_at?: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [campaignResponse, templateResponse] = await Promise.all([
        fetch(`${API_URL}/campaigns`),
        fetch(`${API_URL}/templates`),
      ]);

      if (!campaignResponse.ok || !templateResponse.ok) {
        throw new Error("Could not load campaigns or templates.");
      }

      const campaignData = await campaignResponse.json();
      const templateData = await templateResponse.json();

      setCampaigns(
        Array.isArray(campaignData)
          ? campaignData
          : campaignData.campaigns ?? []
      );

      setTemplates(
        Array.isArray(templateData)
          ? templateData
          : templateData.templates ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim() || !templateId) {
      setError("Enter a campaign name and select a template.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          template_id: Number(templateId),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to create campaign.");
      }

      setName("");
      setTemplateId("");
      setMessage("Campaign created successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign."
      );
    } finally {
      setSaving(false);
    }
  }

  async function sendCampaign(campaign: Campaign) {
    if (
      !window.confirm(
        `Send "${campaign.name}" to all subscribed contacts?`
      )
    ) {
      return;
    }

    setMessage("");
    setError("");
    setSendingId(campaign.id);

    try {
      const response = await fetch(
        `${API_URL}/campaigns/${campaign.id}/send`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to send campaign.");
      }

      setMessage(
        `${data.message}. Total: ${data.totalRecipients}, ` +
          `sent: ${data.sent}, failed: ${data.failed}.`
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send campaign."
      );
    } finally {
      setSendingId(null);
    }
  }

  async function deleteCampaign(campaign: Campaign) {
    if (campaign.status === "sent") {
      setError("Sent campaigns cannot be deleted from this page.");
      return;
    }

    if (!window.confirm(`Delete campaign "${campaign.name}"?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/campaigns/${campaign.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete campaign.");
      }

      setMessage("Campaign deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete campaign."
      );
    }
  }

  return (
    <main className="campaign-page">
      <header className="campaign-header">
        <div>
          <h1>Campaigns</h1>
          <p>Create, manage, and send email campaigns.</p>
        </div>

        <button
          className="campaign-refresh"
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {message && (
        <div className="campaign-alert campaign-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="campaign-alert campaign-error" role="alert">
          {error}
        </div>
      )}

      <section className="campaign-card">
        <h2>Create Campaign</h2>

        <form onSubmit={createCampaign} className="campaign-form">
          <label htmlFor="campaign-name">Campaign name</label>
          <input
            id="campaign-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome Campaign"
            maxLength={150}
            required
          />

          <label htmlFor="campaign-template">Email template</label>
          <select
            id="campaign-template"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
          >
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} — {template.subject}
              </option>
            ))}
          </select>

          {templates.length === 0 && !loading && (
            <p className="campaign-hint">
              No templates found. Create a template first.
            </p>
          )}

          <button
            type="submit"
            className="campaign-primary"
            disabled={saving || templates.length === 0}
          >
            {saving ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </section>

      <section className="campaign-card">
        <div className="campaign-list-heading">
          <h2>All Campaigns</h2>
          <span>{campaigns.length} total</span>
        </div>

        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p className="campaign-empty">
            No campaigns yet. Create your first campaign above.
          </p>
        ) : (
          <div className="campaign-table-wrap">
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Template / Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <strong>{campaign.name}</strong>
                      <small>ID: {campaign.id}</small>
                    </td>

                    <td>
                      {campaign.template_name || campaign.subject || "—"}
                    </td>

                    <td>
                      <span
                        className={`campaign-status status-${campaign.status}`}
                      >
                        {campaign.status}
                      </span>
                    </td>

                    <td>
                      <div className="campaign-actions">
                        <button
                          type="button"
                          className="campaign-send"
                          disabled={
                            campaign.status === "sent" ||
                            sendingId !== null ||
                            !campaign.template_id
                          }
                          onClick={() => void sendCampaign(campaign)}
                        >
                          {sendingId === campaign.id
                            ? "Sending..."
                            : campaign.status === "sent"
                              ? "Sent"
                              : "Send"}
                        </button>

                        <button
                          type="button"
                          className="campaign-delete"
                          disabled={sendingId !== null}
                          onClick={() => void deleteCampaign(campaign)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
