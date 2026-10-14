
import { useEffect, useState, type FormEvent } from "react";
import "../App.css";
import "./Campaigns.css";
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
  getTemplates,
} from "../services/api";
import type { Campaign, EmailTemplate } from "../services/api";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [campaignData, templateData] = await Promise.all([
        getCampaigns(),
        getTemplates(),
      ]);
      setCampaigns(campaignData);
      setTemplates(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load campaigns.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createCampaign(name.trim(), Number(templateId));
      setName("");
      setTemplateId("");
      setNotice("Campaign created. It has not been sent yet.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create campaign.");
    }
  };

  const send = async (campaign: Campaign) => {
    if (campaign.status === "sent") return;
    if (!window.confirm(`Send "${campaign.name}" to subscribed contacts?`)) return;

    try {
      setSendingId(campaign.id);
      const response = await fetch(
        `http://localhost:5000/api/campaigns/${campaign.id}/send`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Campaign sending failed.");
      }
      setNotice(
        `${data.message}. Total: ${data.totalRecipients}, sent: ${data.sent}, failed: ${data.failed}.`
      );
      setError("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send campaign.");
    } finally {
      setSendingId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await deleteCampaign(id);
      await load();
      setNotice("Campaign deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete campaign.");
    }
  };

  return (
    <section className="content-card">
      <h2>Email Campaigns</h2>
      {notice && <p role="status">{notice}</p>}
      {error && <p className="error-message">{error}</p>}

      <form className="contact-form" onSubmit={save}>
        <label>Campaign name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email template</label>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
          <option value="">Choose a template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} — {template.subject}
            </option>
          ))}
        </select>

        <button className="primary-button" type="submit" disabled={!templates.length}>
          Create Campaign
        </button>
      </form>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Name</th><th>Template</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.template_name || "Template unavailable"}</td>
                <td>{campaign.status}</td>
                <td>
                  <button
                    className="primary-button"
                    disabled={campaign.status === "sent" || sendingId !== null}
                    onClick={() => void send(campaign)}
                  >
                    {sendingId === campaign.id ? "Sending..." : "Send"}
                  </button>{" "}
                  <button
                    className="delete-button"
                    disabled={sendingId !== null}
                    onClick={() => void remove(campaign.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
