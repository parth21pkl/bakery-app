import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
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
  Select,
} from "../components/UI";

export default function PurchaseLog() {
  const [materials, setMaterials] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    raw_material_id: "",
    purchase_date: today,
    quantity: "",
    unit_rate: "",
    supplier_name: "",
    invoice_no: "",
    remarks: "",
  });

  async function loadData() {
    try {
      setError("");
      const mats = await apiGet("/raw-materials");
      const purchases = await apiGet("/purchases");

      setMaterials(Array.isArray(mats) ? mats : []);
      setRows(Array.isArray(purchases) ? purchases : []);
    } catch (err) {
      console.error("PurchaseLog load error:", err);
      setError(err.message || "Failed to load purchase data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiPost("/purchases", {
        raw_material_id: Number(form.raw_material_id),
        purchase_date: form.purchase_date,
        quantity: Number(form.quantity || 0),
        unit_rate: Number(form.unit_rate || 0),
        supplier_name: form.supplier_name,
        invoice_no: form.invoice_no,
        remarks: form.remarks,
      });

      setMessage("Purchase entry added and stock updated");
      setForm({
        raw_material_id: "",
        purchase_date: today,
        quantity: "",
        unit_rate: "",
        supplier_name: "",
        invoice_no: "",
        remarks: "",
      });

      loadData();
    } catch (err) {
      console.error("PurchaseLog save error:", err);
      setError(err.message || "Failed to save purchase entry");
    }
  }

  const totalPurchaseValue = rows.reduce(
    (acc, row) => acc + Number(row.total_amount || 0),
    0
  );

  return (
    <Page
      title="Purchase Log"
      subtitle="Record repeated purchases of the same raw material and automatically increase stock"
    >
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Grid min={220}>
        <Card
          title="Total Purchase Entries"
          value={rows.length}
          hint="All logged purchase records"
          tone="blue"
        />
        <Card
          title="Total Purchase Value"
          value={`₹${totalPurchaseValue.toFixed(2)}`}
          hint="Cumulative value from purchase log"
          tone="green"
        />
      </Grid>

      <Section title="Add Purchase Entry">
        <form onSubmit={handleSubmit}>
          <Grid min={220}>
            <Field label="Raw Material">
              <Select
                value={form.raw_material_id}
                onChange={(e) => setForm({ ...form, raw_material_id: e.target.value })}
              >
                <option value="">Select Material</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({mat.unit})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Purchase Date">
              <TextInput
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </Field>

            <Field label="Quantity">
              <TextInput
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="25"
              />
            </Field>

            <Field label="Unit Rate">
              <TextInput
                type="number"
                value={form.unit_rate}
                onChange={(e) => setForm({ ...form, unit_rate: e.target.value })}
                placeholder="40"
              />
            </Field>

            <Field label="Supplier Name">
              <TextInput
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                placeholder="ABC Traders"
              />
            </Field>

            <Field label="Invoice No">
              <TextInput
                value={form.invoice_no}
                onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                placeholder="INV-101"
              />
            </Field>

            <Field label="Remarks">
              <TextInput
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Urgent refill"
              />
            </Field>
          </Grid>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button type="submit">Add Purchase</Button>
            <Button
              variant="light"
              onClick={() =>
                setForm({
                  raw_material_id: "",
                  purchase_date: today,
                  quantity: "",
                  unit_rate: "",
                  supplier_name: "",
                  invoice_no: "",
                  remarks: "",
                })
              }
            >
              Clear
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Purchase Register">
        <DataTable
          columns={[
            { key: "purchase_date", label: "Date" },
            { key: "raw_material_name", label: "Material" },
            { key: "unit", label: "Unit" },
            { key: "quantity", label: "Quantity" },
            { key: "unit_rate", label: "Unit Rate" },
            { key: "total_amount", label: "Total Amount" },
            { key: "supplier_name", label: "Supplier" },
            { key: "invoice_no", label: "Invoice No" },
            { key: "remarks", label: "Remarks" },
          ]}
          rows={rows}
          emptyText="No purchase entries found"
        />
      </Section>
    </Page>
  );
}