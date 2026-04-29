const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/:date", (req, res) => {
  const { date } = req.params;

  try {
    const rows = db.prepare(`
      SELECT
        l.name AS location_name,
        m.name AS item_name,
        COALESCE(SUM(d.quantity), 0) AS dispatched_qty,
        COALESCE(SUM(s.opening_qty), 0) AS opening_qty,
        COALESCE(SUM(s.received_qty), 0) AS recorded_received_qty,
        COALESCE(SUM(s.sold_qty), 0) AS sold_qty,
        COALESCE(SUM(s.returned_qty), 0) AS returned_qty,
        COALESCE(SUM(s.wasted_qty), 0) AS wasted_qty,
        COALESCE(SUM(s.closing_qty), 0) AS closing_qty
      FROM locations l
      CROSS JOIN menu_items m
      LEFT JOIN dispatch d
        ON d.location_id = l.id
        AND d.menu_item_id = m.id
        AND date(d.date) = date(?)
      LEFT JOIN staff_sales_entries s
        ON s.location_id = l.id
        AND s.menu_item_id = m.id
        AND date(s.entry_date) = date(?)
      GROUP BY l.id, m.id
      HAVING
        dispatched_qty > 0 OR
        opening_qty > 0 OR
        recorded_received_qty > 0 OR
        sold_qty > 0 OR
        returned_qty > 0 OR
        wasted_qty > 0 OR
        closing_qty > 0
      ORDER BY l.name, m.name
    `).all(date, date);

    const result = rows.map((row) => {
      const expectedReceived = Number(row.dispatched_qty || 0);
      const recordedReceived = Number(row.recorded_received_qty || 0);

      const lhs = Number(row.opening_qty || 0) + expectedReceived;
      const rhs =
        Number(row.sold_qty || 0) +
        Number(row.returned_qty || 0) +
        Number(row.wasted_qty || 0) +
        Number(row.closing_qty || 0);

      const receivedMismatch = expectedReceived - recordedReceived;
      const stockMismatch = lhs - rhs;

      return {
        ...row,
        expected_received_qty: expectedReceived,
        received_mismatch: receivedMismatch,
        stock_mismatch: stockMismatch,
        status:
          receivedMismatch === 0 && stockMismatch === 0 ? "Balanced" : "Mismatch",
      };
    });

    res.json(result);
  } catch (err) {
    console.error("GET /resonance error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;