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
  DataTable,
} from "../components/UI";

export default function StaffSales() {
  const [menuItems, setMenuItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [entryDate, setEntryDate] = useState(today);
  const [locationId, setLocationId] = useState("");
  const [menuItemId, setMenuItemId] = useState("");

  const [openingQty, setOpeningQty] = useState(0);
  const [receivedQty, setReceivedQty] = useState(0);

  const [soldQty, setSoldQty] = useState("");
  const [returnedQty, setReturnedQty] = useState("");
  const [wastedQty, setWastedQty] = useState("");
  const [closingQty, setClosingQty] = useState("");
  const [remarks, setRemarks] = useState("");

  async function loadData() {
    try {
      setError("");
      const items = await apiGet("/menu-items");
      const locs = await apiGet("/dispatch/locations");
      const savedEntries = await apiGet("/staff-sales");

      setMenuItems(Array.isArray(items) ? items : []);
      setLocations(Array.isArray(locs) ? locs : []);
      setEntries(Array.isArray(savedEntries) ? savedEntries : []);
    } catch (err) {
      console.error("StaffSales load error:", err);
      setError(err.message || "Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadStockBase() {
      try {
        if (!entryDate || !locationId || !menuItemId) {
          setOpeningQty(0);
          setReceivedQty(0);
          return;
        }

        const res = await apiGet(
          `/staff-sales/stock-base/${entryDate}/${locationId}/${menuItemId}`
        );

        setOpeningQty(Number(res.opening_qty || 0));
        setReceivedQty(Number(res.received_qty || 0));
      } catch (err) {
        console.error("Stock base load error:", err);
        setOpeningQty(0);
        setReceivedQty(0);
      }
    }

    loadStockBase();
  }, [entryDate, locationId, menuItemId]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!entryDate || !locationId || !menuItemId) {
        setError("Please select date, outlet, and item");
        return;
      }

      const payload = {
        entry_date: entryDate,
        location_id: Number(locationId),
        menu_item_id: Number(menuItemId),
        sold_qty: Number(soldQty || 0),
        returned_qty: Number(returnedQty || 0),
        wasted_qty: Number(wastedQty || 0),
        closing_qty: Number(closingQty || 0),
        remarks,
      };

      const res = await apiPost("/staff-sales", payload);
      setMessage(res.message || "Staff sales entry saved");

      setSoldQty("");
      setReturnedQty("");
      setWastedQty("");
      setClosingQty("");
      setRemarks("");

      loadData();

      const stockBase = await apiGet(
        `/staff-sales/stock-base/${entryDate}/${locationId}/${menuItemId}`
      );
      setOpeningQty(Number(stockBase.opening_qty || 0));
      setReceivedQty(Number(stockBase.received_qty || 0));
    } catch (err) {
      console.error("StaffSales save error:", err);
      setError(err.message || "Failed to save staff sales entry");
    }
  }

  const totalIn = Number(openingQty || 0) + Number(receivedQty || 0);
  const totalOut =
    Number(soldQty || 0) +
    Number(returnedQty || 0) +
    Number(wastedQty || 0) +
    Number(closingQty || 0);

  const selectedOutletName =
    locations.find((row) => String(row.id) === String(locationId))?.name || "-";
  const selectedItemName =
    menuItems.find((row) => String(row.id) === String(menuItemId))?.name || "-";

  const isBalanced = totalIn === totalOut;

  return (
    <Page
      title="Staff Sales"
      subtitle="Opening is auto-carried from previous closing and received is auto-fetched from dispatch"
    >
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Grid min={220}>
        <Card title="Selected Outlet" value={selectedOutletName} hint="Current entry location" tone="blue" />
        <Card title="Selected Item" value={selectedItemName} hint="Current item under entry" tone="green" />
        <Card title="Opening Qty" value={openingQty} hint="Auto from previous closing" tone="amber" />
        <Card title="Received Qty" value={receivedQty} hint="Auto from dispatch" tone="blue" />
        <Card title="Total In" value={totalIn} hint="Opening + received" tone="green" />
        <Card title="Total Out" value={totalOut} hint="Sold + returned + wasted + closing" tone="red" />
      </Grid>

      <Section title="Staff Sales Entry">
        <form onSubmit={handleSave}>
          <Grid min={240}>
            <Field label="Date">
              <TextInput
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </Field>

            <Field label="Outlet">
              <Select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">Select Outlet</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Item">
              <Select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)}>
                <option value="">Select Item</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Opening Qty (Auto)">
              <TextInput type="number" value={openingQty} readOnly />
            </Field>

            <Field label="Received Qty (Auto)">
              <TextInput type="number" value={receivedQty} readOnly />
            </Field>

            <Field label="Sold Qty">
              <TextInput
                type="number"
                value={soldQty}
                onChange={(e) => setSoldQty(e.target.value)}
              />
            </Field>

            <Field label="Returned Qty">
              <TextInput
                type="number"
                value={returnedQty}
                onChange={(e) => setReturnedQty(e.target.value)}
              />
            </Field>

            <Field label="Wasted Qty">
              <TextInput
                type="number"
                value={wastedQty}
                onChange={(e) => setWastedQty(e.target.value)}
              />
            </Field>

            <Field label="Closing Qty">
              <TextInput
                type="number"
                value={closingQty}
                onChange={(e) => setClosingQty(e.target.value)}
              />
            </Field>

            <Field label="Remarks">
              <TextInput
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Short remarks"
              />
            </Field>
          </Grid>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: isBalanced ? "#ecfdf5" : "#fef2f2",
              border: isBalanced ? "1px solid #bbf7d0" : "1px solid #fecaca",
              color: isBalanced ? "#15803d" : "#b91c1c",
              fontWeight: 700,
            }}
          >
            Check: Opening + Received = {totalIn} | Sold + Returned + Wasted + Closing = {totalOut}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button type="submit" disabled={!isBalanced}>
              Save Staff Sales Entry
            </Button>
            <Button
              variant="light"
              onClick={() => {
                setSoldQty("");
                setReturnedQty("");
                setWastedQty("");
                setClosingQty("");
                setRemarks("");
                setError("");
                setMessage("");
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Saved Staff Sales Entries">
        <DataTable
          columns={[
            { key: "entry_date", label: "Date" },
            { key: "location_name", label: "Outlet" },
            { key: "item_name", label: "Item" },
            { key: "opening_qty", label: "Opening" },
            { key: "received_qty", label: "Received" },
            { key: "sold_qty", label: "Sold" },
            { key: "returned_qty", label: "Returned" },
            { key: "wasted_qty", label: "Wasted" },
            { key: "closing_qty", label: "Closing" },
            { key: "remarks", label: "Remarks" },
          ]}
          rows={entries}
          emptyText="No staff sales entries found"
        />
      </Section>
    </Page>
  );
}