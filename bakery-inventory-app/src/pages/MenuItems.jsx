import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";

export default function MenuItems() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    selling_price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      setError("");
      const data = await apiGet("/menu-items");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menu load error:", err);
      setError(err.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      await apiPost("/menu-items", form);

      setForm({
        code: "",
        name: "",
        category: "",
        unit: "",
        selling_price: "",
      });

      loadItems();
    } catch (err) {
      console.error("Menu save error:", err);
      setError(err.message || "Failed to save menu item");
    }
  }

  return (
    <div style={{ padding: 20, color: "black", background: "white", minHeight: "100vh" }}>
      <h2>Menu Items</h2>

      {loading && <p>Loading menu items...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: 20, display: "grid", gap: 8, maxWidth: 500 }}
      >
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Unit"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
        <input
          placeholder="Selling Price"
          value={form.selling_price}
          onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
        />
        <button type="submit">Add Item</button>
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.unit}</td>
              <td>{item.selling_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}