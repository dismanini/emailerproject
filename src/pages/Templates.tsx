import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "../App.css";
import "./Template.css";
import Pagination from "../components/Pagination";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Code,
  Save,
  Search,
} from "lucide-react";

import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/api";

import type { EmailTemplate } from "../services/api";

type TemplateForm = {
  name: string;
  subject: string;
  body: string;
};

const initialForm: TemplateForm = {
  name: "",
  subject: "",
  body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email</title>
</head>
<body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:30px;border-radius:10px;">
    <h1 style="color:#2563eb;">Welcome to Our Emailer!</h1>
    <p style="font-size:16px;color:#333333;">
      Hello {{name}},
    </p>
    <p style="font-size:16px;color:#555555;">
      Thank you for joining us. We are happy to have you here.
    </p>
    <a href="https://example.com"
       style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:5px;">
      Visit Our Website
    </a>
    <p style="margin-top:25px;color:#888888;font-size:12px;">
      You are receiving this email because you signed up for our service.
    </p>
  </div>
</body>
</html>`,
};

export default function Templates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [form, setForm] = useState<TemplateForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 useEffect(() => {
  void loadTemplates();
}, []);

useEffect(() => {
  setCurrentPage(1);
}, [search]);

  async function loadTemplates() {
    try {
      setLoading(true);
      setError("");

      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError("Unable to load templates. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
    setShowForm(true);
    setShowPreview(false);
  }

  function openEditForm(template: EmailTemplate) {
    setEditingId(template.id);
    setForm({
      name: template.name ?? "",
      subject: template.subject ?? "",
      body: template.body ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
    setShowPreview(false);
  }

  function closeForm() {
    setShowForm(false);
    setShowPreview(false);
    setEditingId(null);
    setForm({ ...initialForm });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      setError("Please enter a template name, subject, and HTML body.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        body: form.body,
      };

      if (editingId !== null) {
        await updateTemplate(editingId, payload);
        setSuccess("Template updated successfully.");
      } else {
        await createTemplate(payload);
        setSuccess("Template created successfully.");
      }

      await loadTemplates();
      closeForm();
      setSuccess(
        editingId !== null
          ? "Template updated successfully."
          : "Template created successfully."
      );
    } catch (err) {
      console.error("Failed to save template:", err);
      setError("Failed to save template. Please check your backend API.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this email template?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteTemplate(id);
      setTemplates((previous) =>
        previous.filter((template) => template.id !== id)
      );
      setSuccess("Template deleted successfully.");
    } catch (err) {
      console.error("Failed to delete template:", err);
      setError("Failed to delete template.");
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const term = search.toLowerCase();

    return (
      (template.name ?? "").toLowerCase().includes(term) ||
      (template.subject ?? "").toLowerCase().includes(term)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

const totalPages = Math.ceil(
  filteredTemplates.length / itemsPerPage
);

const startIndex = (currentPage - 1) * itemsPerPage;

const paginatedTemplates = filteredTemplates.slice(
  startIndex,
  startIndex + itemsPerPage
);

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <h1>Email Templates</h1>
          <p className="muted">
            Create, edit, and preview HTML email templates.
          </p>
        </div>

        <button className="primary-button" onClick={openCreateForm}>
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="content-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search templates by name or subject..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="muted">Loading templates...</p>
        ) : filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <Code size={35} />
            <h3>No templates found</h3>
            <p>Create a template to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Email Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
               {paginatedTemplates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{template.subject}</td>
                    <td>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          title="Preview template"
                          onClick={() => {
                            setForm({
                              name: template.name ?? "",
                              subject: template.subject ?? "",
                              body: template.body ?? "",
                            });
                            setShowPreview(true);
                          }}
                        >
                          <Eye size={16} />
                          Preview
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          title="Edit template"
                          onClick={() => openEditForm(template)}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          title="Delete template"
                          onClick={() => void handleDelete(template.id)}
                        >
                          <Trash2 size={16} />
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
      </div>
<p className="muted">
  Showing{" "}
  {filteredTemplates.length === 0 ? 0 : startIndex + 1}
  {"–"}
  {Math.min(
    startIndex + itemsPerPage,
    filteredTemplates.length
  )}{" "}
  of {filteredTemplates.length} templates
</p>

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
      {showForm && (
        <div className="template-preview-overlay">
          <div
            className="template-preview"
            style={{ width: "min(1100px, 96vw)", maxHeight: "92vh", overflowY: "auto" }}
          >
            <div className="section-heading">
              <div>
                <h2>{editingId !== null ? "Edit Template" : "Create Template"}</h2>
                <p className="muted">
                  Enter HTML code in the editor and preview the rendered email.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                aria-label="Close template editor"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="contact-form">
                <label htmlFor="template-name">Template Name</label>
                <input
                  id="template-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Welcome Email"
                  required
                />

                <label htmlFor="template-subject">Email Subject</label>
                <input
                  id="template-subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Welcome to our service"
                  required
                />
              </div>

              <div className="html-editor-heading">
                <h3>
                  <Code size={18} />
                  HTML Code Editor
                </h3>
                <span className="muted">Write or paste your HTML below</span>
              </div>

              <textarea
                className="html-code-editor"
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="Paste your HTML email template here..."
                spellCheck={false}
                rows={18}
                required
              />

              <div className="html-editor-heading">
                <h3>
                  <Eye size={18} />
                  Live HTML Preview
                </h3>
              </div>

              <iframe
                title="Live HTML email preview"
                srcDoc={form.body}
                sandbox=""
                style={{
                  display: "block",
                  width: "100%",
                  minHeight: "400px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#ffffff",
                }}
              />

              <div className="template-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setForm({ ...initialForm })}
                >
                  Reset HTML
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye size={17} />
                  Full Preview
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Template"
                    : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="template-preview-overlay">
          <div
            className="template-preview"
            style={{ width: "min(900px, 96vw)", maxHeight: "92vh", overflowY: "auto" }}
          >
            <div className="section-heading">
              <div>
                <h2>{form.name || "Email Preview"}</h2>
                <p className="muted">
                  <strong>Subject:</strong> {form.subject || "(No subject)"}
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <iframe
              title="Rendered email template"
              srcDoc={form.body}
              sandbox=""
              style={{
                width: "100%",
                minHeight: "550px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#ffffff",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}