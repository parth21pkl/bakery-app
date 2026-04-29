const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/dashboard", (req, res) => {
  try {
    const salesSummary = db.prepare(`
      SELECT
        m.id,
        m.name,
        COALESCE(SUM(s.sold_qty), 0) AS sold,
        COALESCE(SUM(s.returned_qty), 0) AS returned,
        COALESCE(SUM(s.wasted_qty), 0) AS wasted,
        COALESCE(SUM(s.closing_qty), 0) AS closing
      FROM menu_items m
      LEFT JOIN staff_sales_entries s ON s.menu_item_id = m.id
      GROUP BY m.id, m.name
      ORDER BY m.name
    `).all();

    const rawMaterials = db.prepare(`
      SELECT
        id,
        code,
        name,
        category,
        unit,
        current_stock,
        reorder_level,
        purchase_rate
      FROM raw_materials
      ORDER BY name
    `).all();

    res.json({
      salesSummary,
      rawMaterials,
    });
  } catch (err) {
    console.error("GET /ops-summary/dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/daily/:date", (req, res) => {
  const { date } = req.params;

  try {
    const sales = db.prepare(`
      SELECT
        l.name AS location_name,
        m.name AS item_name,
        COALESCE(SUM(s.opening_qty), 0) AS opening_qty,
        COALESCE(SUM(s.received_qty), 0) AS received_qty,
        COALESCE(SUM(s.sold_qty), 0) AS sold_qty,
        COALESCE(SUM(s.returned_qty), 0) AS returned_qty,
        COALESCE(SUM(s.wasted_qty), 0) AS wasted_qty,
        COALESCE(SUM(s.closing_qty), 0) AS closing_qty
      FROM staff_sales_entries s
      JOIN locations l ON s.location_id = l.id
      JOIN menu_items m ON s.menu_item_id = m.id
      WHERE date(s.entry_date) = date(?)
      GROUP BY s.location_id, s.menu_item_id
      ORDER BY l.name, m.name
    `).all(date);

    const dispatch = db.prepare(`
      SELECT
        l.name AS location_name,
        m.name AS item_name,
        COALESCE(SUM(d.quantity), 0) AS dispatched_qty
      FROM dispatch d
      JOIN locations l ON d.location_id = l.id
      JOIN menu_items m ON d.menu_item_id = m.id
      WHERE date(d.date) = date(?)
      GROUP BY d.location_id, d.menu_item_id
      ORDER BY l.name, m.name
    `).all(date);

    const rawLowStock = db.prepare(`
      SELECT
        name,
        current_stock,
        reorder_level,
        unit
      FROM raw_materials
      WHERE current_stock <= reorder_level
      ORDER BY name
    `).all();

    res.json({
      date,
      sales,
      dispatch,
      rawLowStock,
    });
  } catch (err) {
    console.error("GET /ops-summary/daily error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly/:year/:month", (req, res) => {
  const { year, month } = req.params;

  try {
    const monthText = String(month).padStart(2, "0");
    const startDate = `${year}-${monthText}-01`;
    const nextMonth =
      Number(month) === 12
        ? `${Number(year) + 1}-01-01`
        : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;

    const itemWise = db.prepare(`
      SELECT
        m.name AS item_name,
        COALESCE(SUM(s.sold_qty), 0) AS sold_qty,
        COALESCE(SUM(s.returned_qty), 0) AS returned_qty,
        COALESCE(SUM(s.wasted_qty), 0) AS wasted_qty,
        COALESCE(SUM(s.closing_qty), 0) AS closing_qty
      FROM menu_items m
      LEFT JOIN staff_sales_entries s
        ON s.menu_item_id = m.id
        AND date(s.entry_date) >= date(?)
        AND date(s.entry_date) < date(?)
      GROUP BY m.id, m.name
      ORDER BY m.name
    `).all(startDate, nextMonth);

    const outletWise = db.prepare(`
      SELECT
        l.name AS location_name,
        m.name AS item_name,
        COALESCE(SUM(s.sold_qty), 0) AS sold_qty,
        COALESCE(SUM(s.returned_qty), 0) AS returned_qty,
        COALESCE(SUM(s.wasted_qty), 0) AS wasted_qty,
        COALESCE(SUM(s.closing_qty), 0) AS closing_qty
      FROM staff_sales_entries s
      JOIN locations l ON s.location_id = l.id
      JOIN menu_items m ON s.menu_item_id = m.id
      WHERE date(s.entry_date) >= date(?)
        AND date(s.entry_date) < date(?)
      GROUP BY s.location_id, s.menu_item_id
      ORDER BY l.name, m.name
    `).all(startDate, nextMonth);

    const dispatchWise = db.prepare(`
      SELECT
        l.name AS location_name,
        m.name AS item_name,
        COALESCE(SUM(d.quantity), 0) AS dispatched_qty
      FROM dispatch d
      JOIN locations l ON d.location_id = l.id
      JOIN menu_items m ON d.menu_item_id = m.id
      WHERE date(d.date) >= date(?)
        AND date(d.date) < date(?)
      GROUP BY d.location_id, d.menu_item_id
      ORDER BY l.name, m.name
    `).all(startDate, nextMonth);

    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(sold_qty), 0) AS total_sold_qty,
        COALESCE(SUM(returned_qty), 0) AS total_returned_qty,
        COALESCE(SUM(wasted_qty), 0) AS total_wasted_qty,
        COALESCE(SUM(closing_qty), 0) AS total_closing_qty
      FROM staff_sales_entries
      WHERE date(entry_date) >= date(?)
        AND date(entry_date) < date(?)
    `).get(startDate, nextMonth);

    res.json({
      year: Number(year),
      month: Number(month),
      itemWise,
      outletWise,
      dispatchWise,
      totals,
    });
  } catch (err) {
    console.error("GET /ops-summary/monthly error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;