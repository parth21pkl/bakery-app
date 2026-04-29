const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

// Save staff sales entry
router.post("/", (req, res) => {
  const {
    entry_date,
    location_id,
    menu_item_id,
    opening_qty,
    received_qty,
    sold_qty,
    returned_qty,
    wasted_qty,
    closing_qty,
    remarks,
  } = req.body;

  try {
    const opening = Number(opening_qty || 0);
    const received = Number(received_qty || 0);
    const sold = Number(sold_qty || 0);
    const returned = Number(returned_qty || 0);
    const wasted = Number(wasted_qty || 0);
    const closing = Number(closing_qty || 0);

    const leftSide = opening + received;
    const rightSide = sold + returned + wasted + closing;

    if (leftSide !== rightSide) {
      return res.status(400).json({
        error: "Opening + Received must equal Sold + Returned + Wasted + Closing",
      });
    }

    const result = db.prepare(`
      INSERT INTO staff_sales_entries (
        entry_date,
        location_id,
        menu_item_id,
        opening_qty,
        received_qty,
        sold_qty,
        returned_qty,
        wasted_qty,
        closing_qty,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry_date,
      location_id,
      menu_item_id,
      opening,
      received,
      sold,
      returned,
      wasted,
      closing,
      remarks || ""
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("POST /staff-sales error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all staff sales entries
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        sse.*,
        l.name AS location_name,
        m.name AS item_name
      FROM staff_sales_entries sse
      JOIN locations l ON sse.location_id = l.id
      JOIN menu_items m ON sse.menu_item_id = m.id
      ORDER BY sse.entry_date DESC, sse.id DESC
    `).all();

    res.json(rows);
  } catch (err) {
    console.error("GET /staff-sales error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;