
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const pool = require("./db");
// const nodemailer = require("nodemailer");
// const app = express();

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const authRoutes = require("./routes/auth");


// app.use("/api/auth", authRoutes);

// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");

// Middleware must run before the routes
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);


app.get("/api/auth-check", (req, res) => {
  res.json({
    success: true,
    message: "Correct server.js is running"
  });
});

app.get("/api/templates", async (req, res) => {
  try {
    const [templates] = await pool.query(
      "SELECT * FROM templates ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
});




app.post("/api/templates", async (req, res) => {
  try {
    const { name, subject, body } = req.body;

    if (!name?.trim() || !subject?.trim() || !body?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, subject, and body are required",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO templates (name, subject, body) VALUES (?, ?, ?)",
      [name.trim(), subject.trim(), body.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create template",
    });
  }
});



app.put("/api/templates/:id", async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const { id } = req.params;

    if (!name?.trim() || !subject?.trim() || !body?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, subject, and body are required",
      });
    }

    const [result] = await pool.query(
      "UPDATE templates SET name = ?, subject = ?, body = ? WHERE id = ?",
      [name.trim(), subject.trim(), body.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
});



app.delete("/api/templates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM templates WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
});





// Test the database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({
      success: true,
      message: "MySQL connected successfully",
      result: rows[0].result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Get all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const [contacts] = await pool.query(
      "SELECT * FROM contacts ORDER BY id DESC"
    );

    res.json({ success: true, contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
});

// Add a contact
app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, company } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name and email address",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO contacts (name, email, company)
       VALUES (?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        typeof company === "string" ? company.trim() || null : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Contact added successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email already exists",
      });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add contact" });
  }
});

// Update a contact
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const { name, email, company, consent_status } = req.body;
    const id = Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact details",
      });
    }

    const allowedStatuses = ["pending", "subscribed", "unsubscribed"];

    if (
      consent_status !== undefined &&
      !allowedStatuses.includes(consent_status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid consent status",
      });
    }

    const [result] = await pool.execute(
      `UPDATE contacts
       SET name = ?, email = ?, company = ?, consent_status = ?
       WHERE id = ?`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        typeof company === "string" ? company.trim() || null : null,
        consent_status || "pending",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({ success: true, message: "Contact updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email already exists",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact",
    });
  }
});

// Delete a contact
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM contacts WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
    });
  }
});











/* =========================
   CAMPAIGNS API
========================= */

// Get all campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    const [campaigns] = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.template_id,
        c.status,
        c.created_at,
        c.updated_at,
        t.subject AS template_subject,
        t.name AS template_name
      FROM campaigns c
      LEFT JOIN templates t ON c.template_id = t.id
      ORDER BY c.created_at DESC
    `);

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
});

// Create a campaign
app.post("/api/campaigns", async (req, res) => {
  try {
    const { name, template_id } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Campaign name is required",
      });
    }

    if (template_id !== null && template_id !== undefined) {
      const [templates] = await pool.query(
        "SELECT id FROM templates WHERE id = ?",
        [template_id]
      );

      if (templates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected template does not exist",
        });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO campaigns (name, template_id) VALUES (?, ?)",
      [name.trim(), template_id || null]
    );

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create campaign",
    });
  }
});

// Delete a campaign
app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM campaigns WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
    });
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check whether the test server is running
app.get("/", (req, res) => {
  res.send("Email test server is running");
});

// GET route: useful for checking the endpoint in your browser
app.get("/api/test-email", (req, res) => {
  res.json({
    success: true,
    message: "Test email endpoint exists. Use POST in Postman to send an email.",
  });
});

// POST route: send an email through HostGator SMTP
app.post("/api/test-email", async (req, res) => {
  try {
    const { to } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required. Send {"to":"your@email.com"}',
      });
    }

    const required = [
      "EMAIL_HOST",
      "EMAIL_USER",
      "EMAIL_PASS",
    ];

    const missing = required.filter(
      (key) => !process.env[key]
    );

    if (missing.length > 0) {
      return res.status(500).json({
        success: false,
        message: `Missing environment variables: ${missing.join(", ")}`,
      });
    }

    const port = Number(process.env.EMAIL_PORT || 465);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify the SMTP connection and credentials
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Emailer Project" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Test Email from Emailer Project",
      text: "Your HostGator Webmail SMTP connection is working!",
      html: `
        <h2>Emailer Project</h2>
        <p>Your HostGator Webmail SMTP connection is working!</p>
      `,
    });

    console.log("Test email sent:", info.messageId);

    return res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message,
    });
  }
});


/* =========================
   SEND CAMPAIGN EMAILS
========================= */

app.post("/api/campaigns/:id/send", async (req, res) => {
  try {
    const campaignId = Number(req.params.id);

    if (!Number.isInteger(campaignId) || campaignId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    // Find campaign and its selected template
    const [campaigns] = await pool.execute(
      `SELECT
         c.id,
         c.name,
         c.status,
         t.subject,
         t.body
       FROM campaigns c
       LEFT JOIN templates t ON c.template_id = t.id
       WHERE c.id = ?`,
      [campaignId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const campaign = campaigns[0];

    if (campaign.status === "sent") {
      return res.status(409).json({
        success: false,
        message: "This campaign has already been sent",
      });
    }

    if (!campaign.subject || !campaign.body) {
      return res.status(400).json({
        success: false,
        message: "Select a campaign with a valid email template",
      });
    }

    // Only send to contacts who have subscribed
    const [contacts] = await pool.query(
      `SELECT id, name, email
       FROM contacts
       WHERE consent_status = 'subscribed'
       ORDER BY id ASC`
    );

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subscribed contacts are available",
      });
    }

    // Check Gmail SMTP before sending
    await transporter.verify();

    let sent = 0;
    let failed = 0;

    // Send one email at a time
    
    // Send one personalized email at a time
    for (const contact of contacts) {
      try {
        const personalizedHtml = personalizeEmailHtml(
          campaign.body,
          contact
        );

        await transporter.sendMail({
          from: `"Emailer Project" <${process.env.EMAIL_USER}>`,
          to: contact.email,
          subject: campaign.subject,
          text: personalizedHtml.replace(/<[^>]*>/g, ""),
          html: personalizedHtml,
        });

        await pool.execute(
          `INSERT INTO campaign_email_logs
             (campaign_id, contact_id, recipient_email, status)
           VALUES (?, ?, ?, 'sent')`,
          [campaignId, contact.id, contact.email]
        );

        sent++;
      } catch (emailError) {
        console.error(
          `Failed to email ${contact.email}:`,
          emailError.message
        );

        await pool.execute(
          `INSERT INTO campaign_email_logs
             (campaign_id, contact_id, recipient_email,
              status, error_message)
           VALUES (?, ?, ?, 'failed', ?)`,
          [
            campaignId,
            contact.id,
            contact.email,
            emailError.message,
          ]
        );

        failed++;
      }
    }


    // Mark fully successful campaigns as sent.
    // A partial campaign remains a draft so failures can be reviewed.
    if (failed === 0 && sent > 0) {
      await pool.execute(
        "UPDATE campaigns SET status = 'sent' WHERE id = ?",
        [campaignId]
      );
    }

    return res.json({
      success: failed === 0,
      message:
        failed === 0
          ? "Campaign emails sent successfully"
          : "Campaign finished with some email failures",
      campaignId,
      totalRecipients: contacts.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Send campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send campaign",
      error: error.message,
    });
  }
});


function personalizeEmailHtml(html, contact) {
  return html
    .replace(/\{\{\s*name\s*\}\}/gi, escapeHtml(contact.name || "there"))
    .replace(/\{\{\s*email\s*\}\}/gi, escapeHtml(contact.email || ""));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


app.put("/api/contacts/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { consent_status } = req.body;

    const allowedStatuses = [
      "pending",
      "subscribed",
      "unsubscribed",
    ];

    if (!allowedStatuses.includes(consent_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status.",
      });
    }

    const [result] = await pool.execute(
      "UPDATE contacts SET consent_status = ? WHERE id = ?",
      [consent_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    return res.json({
      success: true,
      message: "Contact status updated successfully.",
    });
  } catch (error) {
    console.error("Update contact status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact status.",
    });
  }
});


/* =========================
   REGISTER API
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name, email, and password of at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});

/* =========================
   LOGIN API
========================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (
      users.length === 0 ||
      !(await bcrypt.compare(password, users[0].password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Emailer backend running at http://localhost:${PORT}`);
});