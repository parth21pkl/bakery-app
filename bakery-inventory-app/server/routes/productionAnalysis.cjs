const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/", (req, res) => {
  try {
    const menuItems = db.prepare(`
      SELECT id, name, unit, selling_price
      FROM menu_items
      ORDER BY name
    `).all();

    const results = menuItems.map((item) => {
      const recipeRows = db.prepare(`
        SELECT
          r.qty_per_unit,
          rm.name AS raw_material_name,
          rm.current_stock,
          rm.purchase_rate,
          rm.unit AS raw_unit
        FROM recipes r
        JOIN raw_materials rm ON r.raw_material_id = rm.id
        WHERE r.menu_item_id = ?
      `).all(item.id);

      let maxProducible = 0;
      let bottleneckMaterial = "";
      let estimatedCostPerUnit = 0;

      if (recipeRows.length > 0) {
        let max = Infinity;
        let bottleneck = "";

        for (const row of recipeRows) {
          const qtyPerUnit = Number(row.qty_per_unit || 0);
          const currentStock = Number(row.current_stock || 0);
          const purchaseRate = Number(row.purchase_rate || 0);

          estimatedCostPerUnit += qtyPerUnit * purchaseRate;

          if (qtyPerUnit > 0) {
            const possible = currentStock / qtyPerUnit;
            if (possible < max) {
              max = possible;
              bottleneck = row.raw_material_name;
            }
          }
        }

        maxProducible = Number.isFinite(max) ? Math.floor(max) : 0;
        bottleneckMaterial = bottleneck;
      }

      const dispatchedTodayRow = db.prepare(`
        SELECT COALESCE(SUM(quantity), 0) AS dispatched_qty
        FROM dispatch
        WHERE menu_item_id = ?
          AND date(date) = date('now')
      `).get(item.id);

      const soldTodayRow = db.prepare(`
        SELECT COALESCE(SUM(sold_qty), 0) AS sold_qty
        FROM staff_sales_entries
        WHERE menu_item_id = ?
          AND date(entry_date) = date('now')
      `).get(item.id);

      const soldToday = Number(soldTodayRow?.sold_qty || 0);
      const sellingPrice = Number(item.selling_price || 0);
      const profitPerUnit = sellingPrice - estimatedCostPerUnit;
      const estimatedProfitToday = soldToday * profitPerUnit;

      return {
        menu_item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        selling_price: sellingPrice,
        estimated_cost_per_unit: Number(estimatedCostPerUnit.toFixed(2)),
        estimated_profit_per_unit: Number(profitPerUnit.toFixed(2)),
        estimated_profit_today: Number(estimatedProfitToday.toFixed(2)),
        dispatched_today_qty: Number(dispatchedTodayRow?.dispatched_qty || 0),
        sold_today_qty: soldToday,
        max_producible_now: maxProducible,
        bottleneck_material: bottleneckMaterial,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("GET /production-analysis error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;