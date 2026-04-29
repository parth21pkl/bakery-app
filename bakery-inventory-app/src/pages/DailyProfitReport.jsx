import { useState } from "react";
import { apiGet } from "../services/api";
import {
  Page,
  Section,
  Grid,
  Card,
  DataTable,
  InfoBanner,
  Button,
  Field,
  TextInput,
} from "../components/UI";

export default function DailyProfitReport() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setError("");
      const res = await apiGet(`/profit-reports/daily/${date}`);
      setData(res);
    } catch (err) {
      console.error("DailyProfitReport load error:", err);
      setError(err.message || "Failed to load daily profit report");
    }
  }

  function handlePrint() {
    window.print();
  }

  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const totals = data?.totals || {
    total_sold_qty: 0,
    total_revenue: 0,
    total_cost: 0,
    total_profit: 0,
  };

  return (
    <div className="print-page">
      <Page
        title="Daily Profit Report"
        subtitle={`Profitability report for ${date}`}
        actions={
          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={loadReport}>Load</Button>
            <Button variant="light" onClick={handlePrint}>Print</Button>
          </div>
        }
      >
        {error && <InfoBanner text={error} tone="red" />}

        <div className="no-print">
          <Section title="Select Date">
            <Grid min={260}>
              <Field label="Date">
                <TextInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            </Grid>
          </Section>
        </div>

        {data && (
          <>
            <div className="print-section">
              <Grid min={220}>
                <Card
                  title="Total Sold Qty"
                  value={totals.total_sold_qty || 0}
                  hint={`For ${date}`}
                  tone="blue"
                />
                <Card
                  title="Total Revenue"
                  value={`₹${Number(totals.total_revenue || 0).toFixed(2)}`}
                  hint="Sales value"
                  tone="green"
                />
                <Card
                  title="Total Cost"
                  value={`₹${Number(totals.total_cost || 0).toFixed(2)}`}
                  hint="Recipe-based cost estimate"
                  tone="amber"
                />
                <Card
                  title="Total Profit"
                  value={`₹${Number(totals.total_profit || 0).toFixed(2)}`}
                  hint="Revenue minus estimated cost"
                  tone="red"
                />
              </Grid>
            </div>

            <div className="print-section">
              <Section title="Item-wise Profitability">
                <DataTable
                  columns={[
                    { key: "item_name", label: "Item" },
                    { key: "sold_qty", label: "Sold Qty" },
                    {
                      key: "selling_price",
                      label: "Selling Price",
                      render: (row) =>
                        `₹${Number(row.selling_price || 0).toFixed(2)}`,
                    },
                    {
                      key: "cost_per_unit",
                      label: "Cost / Unit",
                      render: (row) =>
                        `₹${Number(row.cost_per_unit || 0).toFixed(2)}`,
                    },
                    {
                      key: "revenue",
                      label: "Revenue",
                      render: (row) =>
                        `₹${Number(row.revenue || 0).toFixed(2)}`,
                    },
                    {
                      key: "production_cost_for_sold",
                      label: "Cost for Sold Qty",
                      render: (row) =>
                        `₹${Number(row.production_cost_for_sold || 0).toFixed(2)}`,
                    },
                    {
                      key: "estimated_profit",
                      label: "Profit",
                      render: (row) =>
                        `₹${Number(row.estimated_profit || 0).toFixed(2)}`,
                    },
                    { key: "returned_qty", label: "Returned" },
                    { key: "wasted_qty", label: "Wasted" },
                  ]}
                  rows={rows}
                  emptyText="No daily profit data found"
                />
              </Section>
            </div>
          </>
        )}
      </Page>
    </div>
  );
}