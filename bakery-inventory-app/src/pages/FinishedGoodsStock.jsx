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

function FinishedGoodsStock() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const data = await apiGet("/finished-goods");

      if (Array.isArray(data)) {
        setRows(data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("FinishedGoodsStock load error:", err);
      setError(err.message || "Failed to load finished goods stock");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalQty = rows.reduce(
    (acc, row) => acc + Number(row.available_qty || 0),
    0
  );

  return (
    <Page
      title="Finished Goods Stock"
      subtitle="Central bakery stock available for dispatch"
      actions={
        <Button variant="light" onClick={loadData}>
          Refresh
        </Button>
      }
    >
      {error && <InfoBanner text={error} tone="red" />}

      {/* Top Stats */}
      <Grid min={220}>
        <Card
          title="Total Stock Qty"
          value={totalQty}
          hint="Total finished items available"
          tone="blue"
        />
        <Card
          title="Items Tracked"
          value={rows.length}
          hint="Unique menu items"
          tone="green"
        />
      </Grid>

      {/* Table */}
      <Section title="Central Finished Goods Stock">
        <DataTable
          columns={[
            { key: "code", label: "Code" },
            { key: "name", label: "Item Name" },
            { key: "category", label: "Category" },
            { key: "unit", label: "Unit" },
            {
              key: "available_qty",
              label: "Available Qty",
              render: (row) => (
                <span style={{ fontWeight: 700 }}>
                  {Number(row.available_qty || 0)}
                </span>
              ),
            },
            {
              key: "selling_price",
              label: "Selling Price",
              render: (row) =>
                `₹${Number(row.selling_price || 0).toFixed(2)}`,
            },
          ]}
          rows={rows}
          emptyText="No finished goods stock available"
        />
      </Section>
    </Page>
  );
}

export default FinishedGoodsStock;