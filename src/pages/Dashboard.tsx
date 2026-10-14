
import { useEffect, useState } from "react";
import { Users, Mail, Send, ArrowUpRight } from "lucide-react";
import { getContacts, getTemplates, getCampaigns } from "../services/api";

export default function Dashboard() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getContacts(), getTemplates(), getCampaigns()])
      .then(([c, t, ca]) => {
        setContacts(c);
        setTemplates(t);
        setCampaigns(ca);
      })
      .catch((err) => setError(err.message || "Unable to load dashboard."));
  }, []);

  const subscribed = contacts.filter(
    (contact) => contact.consent_status === "subscribed"
  ).length;

  const cards = [
    { title: "Total Contacts", value: contacts.length, icon: <Users /> },
    { title: "Email Templates", value: templates.length, icon: <Mail /> },
    { title: "Campaigns", value: campaigns.length, icon: <Send /> },
    { title: "Subscribed Contacts", value: subscribed, icon: <ArrowUpRight /> },
  ];

  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">EMAIL MARKETING OVERVIEW</span>
          <h2>Welcome to EmailFlow!</h2>
          <p>Manage contacts, design email templates, and organize campaigns.</p>
        </div>
        <Mail size={76} className="welcome-icon" />
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.title}>
            <div className="stat-icon">{card.icon}</div>
            <p>{card.title}</p>
            <h2>{card.value}</h2>
            <span className="muted">Current total</span>
          </div>
        ))}
      </section>
    </>
  );
}
