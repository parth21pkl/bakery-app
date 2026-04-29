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

export default function Sales() {
  const [menuItems, setMenuItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [item, setItem] = useState("");
  const [location, setLocation] = useState("");
  const [sold, setSold] = useState("");
  const [returned, setReturned] = useState("");
  const [wasted, setWasted] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setError("");
        const items = await apiGet("/menu-items");
        const locs = await apiGet("/dispatch/locations");
        setMenuItems(Array.isArray(items) ? items : []);
        setLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error("Sales load error:", err);
        setError(err.message || "Failed to load data");
      }
    }

    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!item || !location) {
        setError("Please select item and location");
        return;
      }

      await apiPost("/sales", {
        menu_item_id: Number(item),
        location_id: Number(location),
        sold_qty: Number(sold || 0),
        returned_qty: Number(returned || 0),
        wasted_qty: Number(wasted || 0),
      });

      setMessage("Sales saved successfully");
      setSold("");
      setReturned("");
      setWasted("");
    } catch (err) {
      console.error("Sales save error:", err);
      setError(err.message || "Failed to save sales");
    }
  }

  const selectedItemName =
    menuItems.find((row) => String(row.id) === String(item))?.name || "-";
  const selectedLocationName =
    locations.find((row) => String(row.id) === String(location))?.name || "-";

  const totalMovement =
    Number(sold || 0) + Number(returned || 0) + Number(wasted || 0);

  return (
    <Page
      title="Sales"
      subtitle="Record item-wise outlet sales, returns, and wastage"
    >
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Grid min={220}>
        <Card title="Selected Item" value={selectedItemName} hint="Current product" tone="blue" />
        <Card title="Outlet" value={selectedLocationName} hint="Sales location" tone="green" />
        <Card title="Movement Total" value={totalMovement} hint="Sold + returned + wasted" tone="amber" />
      </Grid>

      <Section title="Sales Entry">
        <form onSubmit={handleSubmit}>
          <Grid min={240}>
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

            <Field label="Sold Qty">
              <TextInput
                type="number"
                value={sold}
                onChange={(e) => setSold(e.target.value)}
                placeholder="18"
              />
            </Field>

            <Field label="Returned Qty">
              <TextInput
                type="number"
                value={returned}
                onChange={(e) => setReturned(e.target.value)}
                placeholder="2"
              />
            </Field>

            <Field label="Wasted Qty">
              <TextInput
                type="number"
                value={wasted}
                onChange={(e) => setWasted(e.target.value)}
                placeholder="1"
              />
            </Field>
          </Grid>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button type="submit">Save Sales</Button>
            <Button
              variant="light"
              onClick={() => {
                setSold("");
                setReturned("");
                setWasted("");
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