const express = require("express");
const cors = require("cors");
const db = require("./db.cjs");

const authRoutes = require("./routes/auth.cjs");
const salesRoutes = require("./routes/sales.cjs");
const staffSalesRoutes = require("./routes/staffSales.cjs");
const rawMaterialRoutes = require("./routes/rawMaterials.cjs");
const menuItemRoutes = require("./routes/menuItems.cjs");
const recipeRoutes = require("./routes/recipes.cjs");
const productionRoutes = require("./routes/production.cjs");
const productionAnalysisRoutes = require("./routes/productionAnalysis.cjs");
const dispatchRoutes = require("./routes/dispatch.cjs");
const dailySummaryRoutes = require("./routes/dailySummary.cjs");
const profitReportsRoutes = require("./routes/profitReports.cjs");
const pilferageRoutes = require("./routes/pilferage.cjs");
const opsSummaryRoutes = require("./routes/opsSummary.cjs");
const resonanceRoutes = require("./routes/resonance.cjs");
const finishedGoodsRoutes = require("./routes/finishedGoods.cjs");
const monthlySummaryRoutes = require("./routes/monthlySummary.cjs");
const monthCloseRoutes = require("./routes/monthClose.cjs");

const app = express();

app.use(cors());
app.use(express.json());

// Purchase Log routes inline
app.get("/api/purchases", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        p.id,
        p.purchase_date,
        p.quantity,
        p.unit_rate,
        p.total_amount,
        p.supplier_name,
        p.invoice_no,
        p.remarks,
        rm.id AS raw_material_id,
        rm.code,
        rm.name AS raw_material_name,
        rm.unit
      FROM raw_material_purchases p
      JOIN raw_materials rm ON p.raw_material_id = rm.id
      ORDER BY p.purchase_date DESC, p.id DESC
    `).all();

    res.json(rows);
  } catch (err) {
    console.error("GET /api/purchases error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/purchases", (req, res) => {
  const {
    raw_material_id,
    purchase_date,
    quantity,
    unit_rate,
    supplier_name,
    invoice_no,
    remarks,
  } = req.body;

  const qty = Number(quantity || 0);
  const rate = Number(unit_rate || 0);
  const totalAmount = Number((qty * rate).toFixed(2));

  if (!raw_material_id || !purchase_date || qty <= 0) {
    return res.status(400).json({
      error: "Raw material, date, and quantity are required",
    });
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO raw_material_purchases (
        raw_material_id,
        purchase_date,
        quantity,
        unit_rate,
        total_amount,
        supplier_name,
        invoice_no,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      raw_material_id,
      purchase_date,
      qty,
      rate,
      totalAmount,
      supplier_name || "",
      invoice_no || "",
      remarks || ""
    );

    db.prepare(`
      UPDATE raw_materials
      SET
        current_stock = current_stock + ?,
        purchase_rate = CASE
          WHEN ? > 0 THEN ?
          ELSE purchase_rate
        END
      WHERE id = ?
    `).run(qty, rate, rate, raw_material_id);
  });

  try {
    transaction();
    res.json({ success: true, message: "Purchase added and stock updated" });
  } catch (err) {
    console.error("POST /api/purchases error:", err);
    res.status(500).json({ error: err.message });
  }
});

console.log("authRoutes:", typeof authRoutes);
console.log("salesRoutes:", typeof salesRoutes);
console.log("staffSalesRoutes:", typeof staffSalesRoutes);
console.log("rawMaterialRoutes:", typeof rawMaterialRoutes);
console.log("menuItemRoutes:", typeof menuItemRoutes);
console.log("recipeRoutes:", typeof recipeRoutes);
console.log("productionRoutes:", typeof productionRoutes);
console.log("productionAnalysisRoutes:", typeof productionAnalysisRoutes);
console.log("dispatchRoutes:", typeof dispatchRoutes);
console.log("dailySummaryRoutes:", typeof dailySummaryRoutes);
console.log("monthlySummaryRoutes:", typeof monthlySummaryRoutes);
console.log("profitReportsRoutes:", typeof profitReportsRoutes);
console.log("pilferageRoutes:", typeof pilferageRoutes);
console.log("opsSummaryRoutes:", typeof opsSummaryRoutes);
console.log("resonanceRoutes:", typeof resonanceRoutes);
console.log("finishedGoodsRoutes:", typeof finishedGoodsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/staff-sales", staffSalesRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/production-analysis", productionAnalysisRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/daily-summary", dailySummaryRoutes);
app.use("/api/profit-reports", profitReportsRoutes);
app.use("/api/pilferage", pilferageRoutes);
app.use("/api/ops-summary", opsSummaryRoutes);
app.use("/api/resonance", resonanceRoutes);
app.use("/api/monthly-summary", monthlySummaryRoutes);
app.use("/api/month-close", monthCloseRoutes);
app.use("/api/finished-goods", finishedGoodsRoutes);
app.get("/api", (req, res) => {
  res.json({ message: "Bakery API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Bakery backend is running" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});