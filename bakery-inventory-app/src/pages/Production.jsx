import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";

export default function Production() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [maxQty, setMaxQty] = useState(0);
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await apiGet("/menu-items");
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load menu items error:", err);
        setError(err.message || "Failed to load menu items");
      }
    }

    loadItems();
  }, []);

  useEffect(() => {
    async function loadMaxProduction() {
      if (!selectedItem) {
        setMaxQty(0);
        return;
      }

      try {
        const res = await apiGet(`/production/max/${selectedItem}`);
        setMaxQty(Number(res.max_production || 0));
      } catch (err) {
        console.error("Load max production error:", err);
        setError(err.message || "Failed to load max production");
      }
    }

    loadMaxProduction();
  }, [selectedItem]);

  async function handleProduce(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!selectedItem || !qty) {
        setError("Please select item and enter quantity");
        return;
      }

      const payload = {
        menu_item_id: Number(selectedItem),
        quantity: Number(qty),
      };

      console.log("Production payload:", payload);

      const result = await apiPost("/production", payload);
      console.log("Production response:", result);

      setMessage("Production successful");
      setQty("");

      const res = await apiGet(`/production/max/${selectedItem}`);
      setMaxQty(Number(res.max_production || 0));
    } catch (err) {
      console.error("Production save error:", err);
      setError(err.message || "Production failed");
    }
  }

  return (
    <div style={{ padding: 20, background: "white", color: "black", minHeight: "100vh" }}>
      <h2>Production</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
        <option value="">Select Item</option>
        {menuItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {selectedItem && (
        <>
          <p>Max producible: {maxQty}</p>

          <form onSubmit={handleProduce} style={{ display: "grid", gap: 8, maxWidth: 300 }}>
            <input
              type="number"
              placeholder="Quantity to produce"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button type="submit">Produce</button>
          </form>
        </>
      )}
    </div>
  );
}