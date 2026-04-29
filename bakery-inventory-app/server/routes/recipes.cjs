const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

// GET all recipes for a menu item
router.get("/:menu_item_id", (req, res) => {
  const { menu_item_id } = req.params;

  try {
    const rows = db.prepare(`
      SELECT r.*, rm.name AS raw_material_name
      FROM recipes r
      JOIN raw_materials rm ON r.raw_material_id = rm.id
      WHERE r.menu_item_id = ?
      ORDER BY r.id
    `).all(menu_item_id);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD recipe line
router.post("/", (req, res) => {
  const { menu_item_id, raw_material_id, qty_per_unit } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO recipes (menu_item_id, raw_material_id, qty_per_unit)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(menu_item_id, raw_material_id, qty_per_unit);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;