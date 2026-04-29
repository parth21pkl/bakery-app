const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/:date", (req, res) => {
  const { date } = req.params;

  try {
    const sales = db.prepare(`
      SELECT
        m.name AS item_name,
        SUM(s.sold_qty) AS sold,
        SUM(s.returned_qty) AS returned,
        SUM(s.wasted_qty) AS wasted
      FROM staff_sales_entries s
      JOIN menu_items m ON s.menu_item_id = m.id
      WHERE s.entry_date = ?
      GROUP BY s.menu_item_id
    `).all(date);

    const dispatch = db.prepare(`
      SELECT
        m.name AS item_name,
        SUM(d.quantity) AS dispatched
      FROM dispatch d
      JOIN menu_items m ON d.menu_item_id = m.id
      WHERE date(d.date) = ?
      GROUP BY d.menu_item_id
    `).all(date);

    const lowStock = db.prepare(`
      SELECT name, current_stock, reorder_level
      FROM raw_materials
      WHERE current_stock <= reorder_level
    `).all();

    res.json({
      date,
      sales,
      dispatch,
      lowStock,
    });
  } catch (err) {
    console.error("Daily summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;