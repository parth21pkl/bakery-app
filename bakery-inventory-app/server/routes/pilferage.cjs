const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

router.get("/", (req, res) => {
  try {
    const materials = db.prepare(`
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

    const results = materials.map((material) => {
      const usageRows = db.prepare(`
        SELECT
          m.name AS item_name,
          r.qty_per_unit,
          COALESCE(SUM(s.sold_qty), 0) AS total_sold_qty
        FROM recipes r
        JOIN menu_items m ON r.menu_item_id = m.id
        LEFT JOIN staff_sales_entries s
          ON s.menu_item_id = r.menu_item_id
        WHERE r.raw_material_id = ?
        GROUP BY r.menu_item_id
      `).all(material.id);

      let expectedConsumption = 0;
      const usedInItems = [];

      for (const row of usageRows) {
        const qtyPerUnit = Number(row.qty_per_unit || 0);
        const totalSoldQty = Number(row.total_sold_qty || 0);
        const consumption = qtyPerUnit * totalSoldQty;

        expectedConsumption += consumption;

        usedInItems.push({
          item_name: row.item_name,
          qty_per_unit: qtyPerUnit,
          total_sold_qty: totalSoldQty,
          expected_consumption: Number(consumption.toFixed(2)),
        });
      }

      const currentStock = Number(material.current_stock || 0);
      const theoreticalBalance = Number((0 - expectedConsumption).toFixed(2));
      const mismatch = Number((theoreticalBalance - currentStock).toFixed(2));

      let riskLevel = "Normal";
      if (Math.abs(mismatch) > 5) riskLevel = "High";
      else if (Math.abs(mismatch) > 0) riskLevel = "Watch";
      if (currentStock <= Number(material.reorder_level || 0)) riskLevel = "Low Stock";

      return {
        raw_material_id: material.id,
        code: material.code,
        name: material.name,
        category: material.category,
        unit: material.unit,
        purchase_rate: Number(material.purchase_rate || 0),
        expected_consumption: Number(expectedConsumption.toFixed(2)),
        theoretical_balance: theoreticalBalance,
        actual_balance: currentStock,
        mismatch,
        reorder_level: Number(material.reorder_level || 0),
        risk_level: riskLevel,
        used_in_items: usedInItems,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("GET /pilferage error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;