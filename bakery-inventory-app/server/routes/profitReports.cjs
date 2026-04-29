const express = require("express");
const router = express.Router();
const db = require("../db.cjs");

function getRecipeCostPerUnit(menuItemId) {
  const rows = db.prepare(`
    SELECT
      r.qty_per_unit,
      rm.purchase_rate
    FROM recipes r
    JOIN raw_materials rm ON r.raw_material_id = rm.id
    WHERE r.menu_item_id = ?
  `).all(menuItemId);

  let totalCost = 0;

  for (const row of rows) {
    const qty = Number(row.qty_per_unit || 0);
    const rate = Number(row.purchase_rate || 0);
    totalCost += qty * rate;
  }

  return Number(totalCost.toFixed(2));
}

router.get("/daily/:date", (req, res) => {
  const { date } = req.params;

  try {
    const items = db.prepare(`
      SELECT id, name, selling_price, unit
      FROM menu_items
      ORDER BY name
    `).all();

    const rows = items.map((item) => {
      const costPerUnit = getRecipeCostPerUnit(item.id);
      const sellingPrice = Number(item.selling_price || 0);

      const salesRow = db.prepare(`
        SELECT
          COALESCE(SUM(sold_qty), 0) AS sold_qty,
          COALESCE(SUM(returned_qty), 0) AS returned_qty,
          COALESCE(SUM(wasted_qty), 0) AS wasted_qty
        FROM staff_sales_entries
        WHERE menu_item_id = ?
          AND date(entry_date) = date(?)
      `).get(item.id, date);

      const soldQty = Number(salesRow?.sold_qty || 0);
      const returnedQty = Number(salesRow?.returned_qty || 0);
      const wastedQty = Number(salesRow?.wasted_qty || 0);

      const revenue = Number((soldQty * sellingPrice).toFixed(2));
      const productionCostForSold = Number((soldQty * costPerUnit).toFixed(2));
      const estimatedProfit = Number((revenue - productionCostForSold).toFixed(2));

      return {
        item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        sold_qty: soldQty,
        returned_qty: returnedQty,
        wasted_qty: wastedQty,
        selling_price: sellingPrice,
        cost_per_unit: costPerUnit,
        revenue,
        production_cost_for_sold: productionCostForSold,
        estimated_profit: estimatedProfit,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.total_sold_qty += Number(row.sold_qty || 0);
        acc.total_revenue += Number(row.revenue || 0);
        acc.total_cost += Number(row.production_cost_for_sold || 0);
        acc.total_profit += Number(row.estimated_profit || 0);
        return acc;
      },
      {
        total_sold_qty: 0,
        total_revenue: 0,
        total_cost: 0,
        total_profit: 0,
      }
    );

    totals.total_revenue = Number(totals.total_revenue.toFixed(2));
    totals.total_cost = Number(totals.total_cost.toFixed(2));
    totals.total_profit = Number(totals.total_profit.toFixed(2));

    res.json({
      date,
      rows,
      totals,
    });
  } catch (err) {
    console.error("GET /profit-reports/daily error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly/:year/:month", (req, res) => {
  const { year, month } = req.params;

  try {
    const monthText = String(month).padStart(2, "0");
    const startDate = `${year}-${monthText}-01`;
    const nextMonth = Number(month) === 12
      ? `${Number(year) + 1}-01-01`
      : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;

    const items = db.prepare(`
      SELECT id, name, selling_price, unit
      FROM menu_items
      ORDER BY name
    `).all();

    const rows = items.map((item) => {
      const costPerUnit = getRecipeCostPerUnit(item.id);
      const sellingPrice = Number(item.selling_price || 0);

      const salesRow = db.prepare(`
        SELECT
          COALESCE(SUM(sold_qty), 0) AS sold_qty,
          COALESCE(SUM(returned_qty), 0) AS returned_qty,
          COALESCE(SUM(wasted_qty), 0) AS wasted_qty
        FROM staff_sales_entries
        WHERE menu_item_id = ?
          AND date(entry_date) >= date(?)
          AND date(entry_date) < date(?)
      `).get(item.id, startDate, nextMonth);

      const soldQty = Number(salesRow?.sold_qty || 0);
      const returnedQty = Number(salesRow?.returned_qty || 0);
      const wastedQty = Number(salesRow?.wasted_qty || 0);

      const revenue = Number((soldQty * sellingPrice).toFixed(2));
      const productionCostForSold = Number((soldQty * costPerUnit).toFixed(2));
      const estimatedProfit = Number((revenue - productionCostForSold).toFixed(2));

      return {
        item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        sold_qty: soldQty,
        returned_qty: returnedQty,
        wasted_qty: wastedQty,
        selling_price: sellingPrice,
        cost_per_unit: costPerUnit,
        revenue,
        production_cost_for_sold: productionCostForSold,
        estimated_profit: estimatedProfit,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.total_sold_qty += Number(row.sold_qty || 0);
        acc.total_revenue += Number(row.revenue || 0);
        acc.total_cost += Number(row.production_cost_for_sold || 0);
        acc.total_profit += Number(row.estimated_profit || 0);
        return acc;
      },
      {
        total_sold_qty: 0,
        total_revenue: 0,
        total_cost: 0,
        total_profit: 0,
      }
    );

    totals.total_revenue = Number(totals.total_revenue.toFixed(2));
    totals.total_cost = Number(totals.total_cost.toFixed(2));
    totals.total_profit = Number(totals.total_profit.toFixed(2));

    res.json({
      year: Number(year),
      month: Number(month),
      rows,
      totals,
    });
  } catch (err) {
    console.error("GET /profit-reports/monthly error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;