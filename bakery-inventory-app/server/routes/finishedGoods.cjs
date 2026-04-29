const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        m.id AS menu_item_id,
        m.code,
        m.name,
        m.category,
        m.unit,
        m.selling_price,
        COALESCE(fg.quantity, 0) AS available_qty
      FROM menu_items m
      LEFT JOIN finished_goods_stock fg ON fg.menu_item_id = m.id
      ORDER BY m.name
    `).all();

    res.json(rows);
  } catch (err) {
    console.error("GET /finished-goods error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;