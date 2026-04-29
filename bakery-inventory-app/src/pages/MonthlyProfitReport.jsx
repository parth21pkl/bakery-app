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

export default function MonthlyProfitReport() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setError("");
      const res = await apiGet(`/profit-reports/monthly/${year}/${month}`);
      setData(res);
    } catch (err) {
      console.error("MonthlyProfitReport load error:", err);
      setError(err.message || "Failed to load monthly profit report");
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
        title="Monthly Profit Report"
        subtitle={`Profitability report for ${month}/${year}`}
        actions={
          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={loadReport}>Load</Button>
            <Button variant="light" onClick={handlePrint}>Print</Button>
          </div>
        }
      >
        {error && <InfoBanner text={error} tone="red" />}

        <div className="no-print">
          <Section title="Select Month">
            <Grid min={220}>
              <Field label="Year">
                <TextInput
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field>

              <Field label="Month">
                <TextInput
                  type="number"
                  min="1"
                  max="12"
                  value={Number(month)}
                  onChange={(e) => {
                    const val = String(e.target.value || "");
                    setMonth(val.padStart(2, "0"));
                  }}
                />
              </Field>
            </Grid>
          </Section>
        </div>

        {data && (
          <>
            <div className="print-section">
              <Grid min={220}>
                <Card title="Total Sold Qty" value={totals.total_sold_qty || 0} hint={`Month ${month}/${year}`} tone="blue" />
                <Card title="Total Revenue" value={`₹${Number(totals.total_revenue || 0).toFixed(2)}`} hint="Monthly sales value" tone="green" />
                <Card title="Total Cost" value={`₹${Number(totals.total_cost || 0).toFixed(2)}`} hint="Recipe-based monthly cost estimate" tone="amber" />
                <Card title="Total Profit" value={`₹${Number(totals.total_profit || 0).toFixed(2)}`} hint="Revenue minus estimated cost" tone="red" />
              </Grid>
            </div>

            <div className="print-section">
              <Section title="Item-wise Monthly Profitability">
                <DataTable
                  columns={[
                    { key: "item_name", label: "Item" },
                    { key: "sold_qty", label: "Sold Qty" },
                    {
                      key: "selling_price",
                      label: "Selling Price",
                      render: (row) => `₹${Number(row.selling_price || 0).toFixed(2)}`,
                    },
                    {
                      key: "cost_per_unit",
                      label: "Cost / Unit",
                      render: (row) => `₹${Number(row.cost_per_unit || 0).toFixed(2)}`,
                    },
                    {
                      key: "revenue",
                      label: "Revenue",
                      render: (row) => `₹${Number(row.revenue || 0).toFixed(2)}`,
                    },
                    {
                      key: "production_cost_for_sold",
                      label: "Cost for Sold Qty",
                      render: (row) => `₹${Number(row.production_cost_for_sold || 0).toFixed(2)}`,
                    },
                    {
                      key: "estimated_profit",
                      label: "Profit",
                      render: (row) => `₹${Number(row.estimated_profit || 0).toFixed(2)}`,
                    },
                    { key: "returned_qty", label: "Returned" },
                    { key: "wasted_qty", label: "Wasted" },
                  ]}
                  rows={rows}
                  emptyText="No monthly profit data found"
                />
              </Section>
            </div>
          </>
        )}
      </Page>
    </div>
  );
}