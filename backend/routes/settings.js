
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Fetch settings from MySQL
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM emailer_settings ORDER BY id ASC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.json({
      success: true,
      settings: rows[0],
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
});
// PUT: Update settings in MySQL
router.put("/", async (req, res) => {
  try {
    const {
      admin_name,
      admin_email,
      sender_name,
      sender_email,
      reply_to_email,
      campaign_notifications,
      failure_notifications,
    } = req.body;

    // Validate required text fields
    if (
      typeof admin_name !== "string" ||
      typeof sender_name !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin name and sender name are required.",
      });
    }

    const [rows] = await db.query(
      "SELECT id FROM emailer_settings ORDER BY id ASC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings row not found. Insert a row into emailer_settings first.",
      });
    }

    await db.query(
      `UPDATE emailer_settings
       SET admin_name = ?,
           admin_email = ?,
           sender_name = ?,
           sender_email = ?,
           reply_to_email = ?,
           campaign_notifications = ?,
           failure_notifications = ?
       WHERE id = ?`,
      [
        admin_name.trim(),
        admin_email || "",
        sender_name.trim(),
        sender_email || "",
        reply_to_email || "",
        campaign_notifications === true ||
          campaign_notifications === 1 ||
          campaign_notifications === "1",
        failure_notifications === true ||
          failure_notifications === 1 ||
          failure_notifications === "1",
        rows[0].id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
});

module.exports = router;
