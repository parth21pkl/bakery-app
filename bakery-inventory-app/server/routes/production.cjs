const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/max/:menu_item_id", (req, res) => {
  const { menu_item_id } = req.params;

  try {
    const recipe = db.prepare(`
      SELECT r.qty_per_unit, rm.current_stock
      FROM recipes r
      JOIN raw_materials rm ON r.raw_material_id = rm.id
      WHERE r.menu_item_id = ?
    `).all(menu_item_id);

    if (!recipe || recipe.length === 0) {
      return res.json({ max_production: 0 });
    }

    let max = Infinity;

    for (const r of recipe) {
      const qtyPerUnit = Number(r.qty_per_unit || 0);
      const stock = Number(r.current_stock || 0);

      if (qtyPerUnit <= 0) {
        return res.status(400).json({ error: "Invalid recipe quantity" });
      }

      const possible = stock / qtyPerUnit;
      if (possible < max) {
        max = possible;
      }
    }

    res.json({ max_production: Math.floor(max) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  const { menu_item_id, quantity } = req.body;

  try {
    const qtyToProduce = Number(quantity || 0);

    if (!menu_item_id || qtyToProduce <= 0) {
      return res.status(400).json({ error: "Invalid production data" });
    }

    const recipe = db.prepare(`
      SELECT r.qty_per_unit, rm.id AS raw_id, rm.current_stock
      FROM recipes r
      JOIN raw_materials rm ON r.raw_material_id = rm.id
      WHERE r.menu_item_id = ?
    `).all(menu_item_id);

    if (!recipe || recipe.length === 0) {
      return res.status(400).json({ error: "No recipe found for this item" });
    }

    for (const r of recipe) {
      const required = Number(r.qty_per_unit || 0) * qtyToProduce;
      const stock = Number(r.current_stock || 0);

      if (required > stock) {
        return res.status(400).json({ error: "Not enough stock for production" });
      }
    }

    for (const r of recipe) {
      const required = Number(r.qty_per_unit || 0) * qtyToProduce;

      db.prepare(`
        UPDATE raw_materials
        SET current_stock = current_stock - ?
        WHERE id = ?
      `).run(required, r.raw_id);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;