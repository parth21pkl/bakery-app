import { useEffect, useState } from "react";
import { apiGet } from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const salesSummary = await apiGet("/sales/summary");
        const materials = await apiGet("/raw-materials");

        setSummary(Array.isArray(salesSummary) ? salesSummary : []);
        setRawMaterials(Array.isArray(materials) ? materials : []);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const lowStock = rawMaterials.filter(
    (item) => Number(item.current_stock || 0) <= Number(item.reorder_level || 0)
  );

  const totalSold = summary.reduce((acc, row) => acc + Number(row.sold || 0), 0);
  const totalReturned = summary.reduce((acc, row) => acc + Number(row.returned || 0), 0);
  const totalWasted = summary.reduce((acc, row) => acc + Number(row.wasted || 0), 0);

  return (
    <div style={{ color: "#111827" }}>
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>Dashboard</h2>

      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <DashboardCard title="Total Sold" value={totalSold} />
        <DashboardCard title="Total Returned" value={totalReturned} />
        <DashboardCard title="Total Wasted" value={totalWasted} />
        <DashboardCard title="Low Stock Items" value={lowStock.length} />
      </div>

      <Section title="Sales Summary">
        <table
          border="1"
          cellPadding="8"
          style={{
  borderCollapse: "collapse",
  width: "100%",
  marginTop: 12,
}}
        >
          <thead>
            <tr>
              <th>Item</th>
              <th>Sold</th>
              <th>Returned</th>
              <th>Wasted</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan="4">No sales data found</td>
              </tr>
            ) : (
              summary.map((row, index) => (
                <tr key={index}>
                  <td>{row?.name ?? ""}</td>
                  <td>{row?.sold ?? 0}</td>
                  <td>{row?.returned ?? 0}</td>
                  <td>{row?.wasted ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Low Stock Raw Materials">
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.length === 0 ? (
              <tr>
                <td colSpan="4">No low stock items</td>
              </tr>
            ) : (
              lowStock.map((item) => (
                <tr key={item.id}>
                  <td>{item?.name ?? ""}</td>
                  <td>{item?.current_stock ?? 0}</td>
                  <td>{item?.reorder_level ?? 0}</td>
                  <td>{item?.unit ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div
     style={{
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
}}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}