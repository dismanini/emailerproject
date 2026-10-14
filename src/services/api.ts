
const API_URL = "http://localhost:5000/api";

export interface Contact {
  id: number;
  name: string;
  email: string;
  company: string | null;
  consent_status: "pending" | "subscribed" | "unsubscribed";
  created_at?: string;
}


export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at?: string;
}


export interface Campaign {
  id: number;
  name: string;
  template_id: number | null;
  status: "draft" | "scheduled" | "sent";
  created_at: string;
  updated_at?: string;
  template_subject?: string | null;
  template_name?: string | null;
}
export const getContacts = async (): Promise<Contact[]> => {
  const response = await fetch(`${API_URL}/contacts`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch contacts");
  }

  return data.contacts;
};

export const createContact = async (
  contact: Pick<Contact, "name" | "email"> & { company?: string }
) => {
  const response = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to add contact");
  }

  return data;
};

export const deleteContact = async (id: number) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete contact");
  }

  return data;
};

export const getTemplates = async (): Promise<EmailTemplate[]> => {
  const response = await fetch(`${API_URL}/templates`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch templates");
  }

  return data.templates;
};

export const createTemplate = async (
  template: Pick<EmailTemplate, "name" | "subject" | "body">
) => {
  const response = await fetch(`${API_URL}/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create template");
  }

  return data;
};

export const updateTemplate = async (
  id: number,
  template: Pick<EmailTemplate, "name" | "subject" | "body">
) => {
  const response = await fetch(`${API_URL}/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update template");
  }

  return data;
};

export const deleteTemplate = async (id: number) => {
  const response = await fetch(`${API_URL}/templates/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete template");
  }

  return data;
};





export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await fetch(`${API_URL}/campaigns`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch campaigns");
  }

  return data.campaigns;
};

export const createCampaign = async (
  name: string,
  template_id: number | null
): Promise<void> => {
  const response = await fetch(`${API_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, template_id }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create campaign");
  }
};

export const deleteCampaign = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/campaigns/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete campaign");
  }
};



export const updateContactStatus = async (
  id: number,
  consent_status: "pending" | "subscribed" | "unsubscribed"
) => {
  const response = await fetch(`${API_URL}/contacts/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ consent_status }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update contact status");
  }

  return data;
};



export const getSettings = async () => {
  const response = await fetch(`${API_URL}/settings`);

  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }

  return response.json();
};

export const updateSettings = async (settings: {
  admin_name: string;
  admin_email: string;
  sender_name: string;
  sender_email: string;
  reply_to_email: string;
  campaign_notifications: boolean;
  failure_notifications: boolean;
}) => {
  const response = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return response.json();
};