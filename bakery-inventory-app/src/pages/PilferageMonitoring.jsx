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

function PilferageMonitoring() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const data = await apiGet("/pilferage");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Pilferage load error:", err);
      setError(err.message || "Failed to load pilferage data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const highRiskCount = rows.filter((r) => r.risk_level === "High").length;
  const lowStockCount = rows.filter((r) => r.risk_level === "Low Stock").length;
  const totalMismatch = rows.reduce(
    (acc, row) => acc + Number(row.mismatch || 0),
    0
  );

  return (
    <Page
      title="Pilferage Monitoring"
      subtitle="Track expected usage, actual balance, and suspicious stock mismatch"
      actions={<Button variant="light" onClick={loadData}>Refresh</Button>}
    >
      {error && <InfoBanner text={error} tone="red" />}

      <Grid min={220}>
        <Card
          title="High Risk Materials"
          value={highRiskCount}
          hint="Large mismatch found"
          tone="red"
        />
        <Card
          title="Low Stock Materials"
          value={lowStockCount}
          hint="At or below reorder level"
          tone="amber"
        />
        <Card
          title="Total Mismatch"
          value={totalMismatch.toFixed(2)}
          hint="Theoretical minus actual balance"
          tone="blue"
        />
      </Grid>

      <Section title="Material-wise Monitoring">
        <DataTable
          columns={[
            { key: "code", label: "Code" },
            { key: "name", label: "Material" },
            { key: "unit", label: "Unit" },
            { key: "expected_consumption", label: "Expected Consumption" },
            { key: "actual_balance", label: "Actual Balance" },
            { key: "theoretical_balance", label: "Theoretical Balance" },
            { key: "mismatch", label: "Mismatch" },
            { key: "risk_level", label: "Risk Level" },
            {
              key: "details",
              label: "Details",
              render: (row) => (
                <Button variant="secondary" onClick={() => setSelected(row)}>
                  View
                </Button>
              ),
            },
          ]}
          rows={rows}
          emptyText="No monitoring data found"
        />
      </Section>

      {selected && (
        <Section
          title={`Usage Detail - ${selected.name}`}
          actions={
            <Button variant="light" onClick={() => setSelected(null)}>
              Close
            </Button>
          }
        >
          <Grid min={220}>
            <Card title="Actual Balance" value={selected.actual_balance} tone="blue" />
            <Card title="Theoretical Balance" value={selected.theoretical_balance} tone="green" />
            <Card title="Mismatch" value={selected.mismatch} tone="red" />
            <Card title="Risk Level" value={selected.risk_level} tone="amber" />
          </Grid>

          <Section title="Item-wise Expected Usage">
            <DataTable
              columns={[
                { key: "item_name", label: "Item" },
                { key: "qty_per_unit", label: "Qty Per Unit" },
                { key: "total_sold_qty", label: "Total Sold Qty" },
                { key: "expected_consumption", label: "Expected Consumption" },
              ]}
              rows={selected.used_in_items || []}
              emptyText="No usage detail found"
            />
          </Section>
        </Section>
      )}
    </Page>
  );
}

export default PilferageMonitoring;