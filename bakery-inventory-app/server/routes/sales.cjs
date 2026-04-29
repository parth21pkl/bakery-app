const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.post("/", (req, res) => {
  const { menu_item_id, location_id, sold_qty, returned_qty, wasted_qty } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO sales (menu_item_id, location_id, sold_qty, returned_qty, wasted_qty)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      menu_item_id,
      location_id,
      sold_qty || 0,
      returned_qty || 0,
      wasted_qty || 0
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        m.name,
        SUM(s.sold_qty) as sold,
        SUM(s.returned_qty) as returned,
        SUM(s.wasted_qty) as wasted
      FROM sales s
      JOIN menu_items m ON s.menu_item_id = m.id
      GROUP BY s.menu_item_id
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;