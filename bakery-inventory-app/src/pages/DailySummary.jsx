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

export default function DailySummary() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setError("");
      const res = await apiGet(`/daily-summary/${date}`);
      setData(res);
    } catch (err) {
      console.error("DailySummary load error:", err);
      setError(err.message || "Failed to load summary");
    }
  }

  function handlePrint() {
    window.print();
  }

  const salesRows = data?.sales || [];
  const dispatchRows = data?.dispatch || [];
  const lowStockRows = data?.lowStock || [];

  const totalSold = salesRows.reduce((acc, row) => acc + Number(row.sold || 0), 0);
  const totalReturned = salesRows.reduce((acc, row) => acc + Number(row.returned || 0), 0);
  const totalWasted = salesRows.reduce((acc, row) => acc + Number(row.wasted || 0), 0);
  const totalDispatched = dispatchRows.reduce((acc, row) => acc + Number(row.dispatched || 0), 0);

  return (
    <div className="print-page">
      <Page
        title="Daily Summary"
        subtitle={`Operational report for ${date}`}
        actions={
          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={loadSummary}>Load</Button>
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
                <Card title="Total Sold" value={totalSold} hint={`For ${date}`} tone="green" />
                <Card title="Total Returned" value={totalReturned} hint={`For ${date}`} tone="amber" />
                <Card title="Total Wasted" value={totalWasted} hint={`For ${date}`} tone="red" />
                <Card title="Total Dispatched" value={totalDispatched} hint={`For ${date}`} tone="blue" />
              </Grid>
            </div>

            <div className="print-section">
              <Section title="Sales Summary">
                <DataTable
                  columns={[
                    { key: "item_name", label: "Item" },
                    { key: "sold", label: "Sold" },
                    { key: "returned", label: "Returned" },
                    { key: "wasted", label: "Wasted" },
                  ]}
                  rows={salesRows}
                  emptyText="No sales data"
                />
              </Section>
            </div>

            <div className="print-section">
              <Section title="Dispatch Summary">
                <DataTable
                  columns={[
                    { key: "item_name", label: "Item" },
                    { key: "dispatched", label: "Dispatched" },
                  ]}
                  rows={dispatchRows}
                  emptyText="No dispatch data"
                />
              </Section>
            </div>

            <div className="print-section">
              <Section title="Low Stock Alert">
                <DataTable
                  columns={[
                    { key: "name", label: "Material" },
                    { key: "current_stock", label: "Current Stock" },
                    { key: "reorder_level", label: "Reorder Level" },
                  ]}
                  rows={lowStockRows}
                  emptyText="No low stock items"
                />
              </Section>
            </div>
          </>
        )}
      </Page>
    </div>
  );
}