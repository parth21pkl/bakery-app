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

export default function ResonanceCheck() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const data = await apiGet(`/resonance/${date}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("ResonanceCheck load error:", err);
      setError(err.message || "Failed to load resonance data");
    }
  }

  const mismatchCount = rows.filter((r) => r.status === "Mismatch").length;

  return (
    <Page
      title="Resonance Check"
      subtitle="Verify dispatch and staff sales are perfectly aligned"
      actions={<Button variant="secondary" onClick={loadData}>Load</Button>}
    >
      {error && <InfoBanner text={error} tone="red" />}

      <Section title="Select Date">
        <Grid min={240}>
          <Field label="Date">
            <TextInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </Grid>
      </Section>

      <Grid min={220}>
        <Card title="Rows Checked" value={rows.length} hint="Outlet-item combinations" tone="blue" />
        <Card title="Mismatch Rows" value={mismatchCount} hint="Require attention" tone="red" />
      </Grid>

      <Section title="Resonance Status">
        <DataTable
          columns={[
            { key: "location_name", label: "Outlet" },
            { key: "item_name", label: "Item" },
            { key: "opening_qty", label: "Opening" },
            { key: "expected_received_qty", label: "Expected Received" },
            { key: "recorded_received_qty", label: "Recorded Received" },
            { key: "sold_qty", label: "Sold" },
            { key: "returned_qty", label: "Returned" },
            { key: "wasted_qty", label: "Wasted" },
            { key: "closing_qty", label: "Closing" },
            { key: "received_mismatch", label: "Received Mismatch" },
            { key: "stock_mismatch", label: "Stock Mismatch" },
            { key: "status", label: "Status" },
          ]}
          rows={rows}
          emptyText="No rows found"
        />
      </Section>
    </Page>
  );
}