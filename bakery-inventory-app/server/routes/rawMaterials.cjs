const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM raw_materials ORDER BY name").all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { code, name, category, unit, reorder_level, current_stock, purchase_rate } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO raw_materials
      (code, name, category, unit, reorder_level, current_stock, purchase_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      code || "",
      name,
      category || "",
      unit,
      reorder_level || 0,
      current_stock || 0,
      purchase_rate || 0
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;