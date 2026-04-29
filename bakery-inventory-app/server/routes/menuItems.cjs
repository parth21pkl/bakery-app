const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

// Get all menu items
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        id,
        code,
        name,
        category,
        unit,
        selling_price
      FROM menu_items
      ORDER BY name
    `).all();

    res.json(rows);
  } catch (err) {
    console.error("GET /menu-items error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add new menu item
router.post("/", (req, res) => {
  const { code, name, category, unit, selling_price } = req.body;

  try {
    if (!name || !unit) {
      return res.status(400).json({ error: "Name and unit are required" });
    }

    const result = db.prepare(`
      INSERT INTO menu_items (code, name, category, unit, selling_price)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      code || "",
      name,
      category || "",
      unit,
      Number(selling_price || 0)
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("POST /menu-items error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;