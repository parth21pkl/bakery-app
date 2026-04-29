import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import {
  Page,
  Section,
  Grid,
  Field,
  TextInput,
  Button,
  DataTable,
  InfoBanner,
} from "../components/UI";

export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    reorder_level: "",
    current_stock: "",
    purchase_rate: "",
  });

  async function loadItems() {
    try {
      const data = await apiGet("/raw-materials");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Raw materials load error:", err);
      setError(err.message || "Failed to load raw materials");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiPost("/raw-materials", form);
      setMessage("Raw material added successfully");
      setForm({
        code: "",
        name: "",
        category: "",
        unit: "",
        reorder_level: "",
        current_stock: "",
        purchase_rate: "",
      });
      loadItems();
    } catch (err) {
      console.error("Raw materials save error:", err);
      setError(err.message || "Failed to save raw material");
    }
  }

  return (
    <Page title="Raw Materials" subtitle="Manage ingredient stock, units, and reorder levels">
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Section title="Add Raw Material">
        <form onSubmit={handleSubmit}>
          <Grid min={220}>
            <Field label="Code">
              <TextInput
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="RM001"
              />
            </Field>

            <Field label="Name">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Maida"
              />
            </Field>

            <Field label="Category">
              <TextInput
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Flour"
              />
            </Field>

            <Field label="Unit">
              <TextInput
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg / litre / piece"
              />
            </Field>

            <Field label="Reorder Level">
              <TextInput
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                placeholder="5"
              />
            </Field>

            <Field label="Current Stock">
              <TextInput
                type="number"
                value={form.current_stock}
                onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
                placeholder="20"
              />
            </Field>

            <Field label="Purchase Rate">
              <TextInput
                type="number"
                value={form.purchase_rate}
                onChange={(e) => setForm({ ...form, purchase_rate: e.target.value })}
                placeholder="40"
              />
            </Field>
          </Grid>

          <div style={{ marginTop: 16 }}>
            <Button type="submit">Add Raw Material</Button>
          </div>
        </form>
      </Section>

      <Section title="Raw Material Register">
        <DataTable
          columns={[
            { key: "code", label: "Code" },
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "unit", label: "Unit" },
            { key: "current_stock", label: "Stock" },
            { key: "reorder_level", label: "Reorder Level" },
            { key: "purchase_rate", label: "Rate" },
          ]}
          rows={items}
          emptyText="No raw materials found"
        />
      </Section>
    </Page>
  );
}