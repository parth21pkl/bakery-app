import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import {
  Page,
  Section,
  Grid,
  Field,
  Select,
  TextInput,
  Button,
  InfoBanner,
  Card,
} from "../components/UI";

export default function Dispatch() {
  const [menuItems, setMenuItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [item, setItem] = useState("");
  const [location, setLocation] = useState("");
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setError("");
        const items = await apiGet("/menu-items");
        const locs = await apiGet("/dispatch/locations");

        setMenuItems(Array.isArray(items) ? items : []);
        setLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error("Dispatch load error:", err);
        setError(err.message || "Failed to load dispatch data");
      }
    }

    loadData();
  }, []);

  async function handleDispatch(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!item || !location || !qty) {
        setError("Please select item, location, and quantity");
        return;
      }

      await apiPost("/dispatch", {
        menu_item_id: Number(item),
        location_id: Number(location),
        quantity: Number(qty),
      });

      setMessage("Dispatched successfully");
      setQty("");
    } catch (err) {
      console.error("Dispatch save error:", err);
      setError(err.message || "Dispatch failed");
    }
  }

  const selectedItemName =
    menuItems.find((row) => String(row.id) === String(item))?.name || "-";
  const selectedLocationName =
    locations.find((row) => String(row.id) === String(location))?.name || "-";

  return (
    <Page
      title="Dispatch"
      subtitle="Send finished goods to outlet locations like cafe, counter, or vehicle"
    >
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Grid min={240}>
        <Card
          title="Selected Item"
          value={selectedItemName}
          hint="Product selected for dispatch"
          tone="blue"
        />
        <Card
          title="Destination"
          value={selectedLocationName}
          hint="Outlet receiving the stock"
          tone="green"
        />
        <Card
          title="Dispatch Qty"
          value={qty || 0}
          hint="Current quantity in form"
          tone="amber"
        />
      </Grid>

      <Section title="Dispatch Entry">
        <form onSubmit={handleDispatch}>
          <Grid min={260}>
            <Field label="Menu Item">
              <Select value={item} onChange={(e) => setItem(e.target.value)}>
                <option value="">Select Item</option>
                {menuItems.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Location">
              <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select Location</option>
                {locations.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Quantity">
              <TextInput
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="20"
              />
            </Field>
          </Grid>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button type="submit">Dispatch Stock</Button>
            <Button
              variant="light"
              onClick={() => {
                setQty("");
                setError("");
                setMessage("");
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Section>
    </Page>
  );
}