require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});
console.log("DB URL:", process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const db = require("./db.cjs");
const app = express();

app.use(cors());
app.use(express.json());

const monthlySummaryRoutes = require("./routes/monthlySummary.cjs");
const monthCloseRoutes = require("./routes/monthClose.cjs");

app.use("/api/monthly-summary", monthlySummaryRoutes);
app.use("/api/month-close", monthCloseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend running" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://127.0.0.1:5000");
});