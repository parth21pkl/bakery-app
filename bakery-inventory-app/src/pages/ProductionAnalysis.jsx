import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import {
  Page,
  Section,
  Grid,
  Card,
  DataTable,
  InfoBanner,
  Button,
} from "../components/UI";

export default function ProductionAnalysis() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const data = await apiGet("/production-analysis");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("ProductionAnalysis load error:", err);
      setError(err.message || "Failed to load production analysis");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalDispatched = rows.reduce(
    (acc, row) => acc + Number(row.dispatched_today_qty || 0),
    0
  );
  const totalSold = rows.reduce(
    (acc, row) => acc + Number(row.sold_today_qty || 0),
    0
  );
  const totalPossible = rows.reduce(
    (acc, row) => acc + Number(row.max_producible_now || 0),
    0
  );
  const totalProfitToday = rows.reduce(
    (acc, row) => acc + Number(row.estimated_profit_today || 0),
    0
  );

  return (
    <Page
      title="Production Analysis"
      subtitle="See production capacity, bottlenecks, and estimated profitability"
      actions={<Button variant="light" onClick={loadData}>Refresh</Button>}
    >
      {error && <InfoBanner text={error} tone="red" />}

      <Grid min={220}>
        <Card title="Dispatched Today" value={totalDispatched} hint="Total quantity sent out today" tone="blue" />
        <Card title="Sold Today" value={totalSold} hint="Total quantity sold today" tone="green" />
        <Card title="Can Still Be Produced" value={totalPossible} hint="Current possible quantity from remaining stock" tone="amber" />
        <Card title="Est. Profit Today" value={`₹${totalProfitToday.toFixed(2)}`} hint="Based on sold quantity and recipe cost" tone="red" />
      </Grid>

      <Section title="Item-wise Analysis">
        <DataTable
          columns={[
            { key: "item_name", label: "Item" },
            { key: "dispatched_today_qty", label: "Dispatched Today" },
            { key: "sold_today_qty", label: "Sold Today" },
            { key: "max_producible_now", label: "Max Producible Now" },
            {
              key: "estimated_cost_per_unit",
              label: "Cost / Unit",
              render: (row) => `₹${Number(row.estimated_cost_per_unit || 0).toFixed(2)}`,
            },
            {
              key: "selling_price",
              label: "Selling Price",
              render: (row) => `₹${Number(row.selling_price || 0).toFixed(2)}`,
            },
            {
              key: "estimated_profit_per_unit",
              label: "Profit / Unit",
              render: (row) => `₹${Number(row.estimated_profit_per_unit || 0).toFixed(2)}`,
            },
            {
              key: "estimated_profit_today",
              label: "Profit Today",
              render: (row) => `₹${Number(row.estimated_profit_today || 0).toFixed(2)}`,
            },
            {
              key: "bottleneck_material",
              label: "Bottleneck Material",
              render: (row) => row.bottleneck_material || "-",
            },
          ]}
          rows={rows}
          emptyText="No production analysis data found"
        />
      </Section>
    </Page>
  );
}