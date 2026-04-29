import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RawMaterials from "./pages/RawMaterials";
import PurchaseLog from "./pages/Purchaselog";
import MenuItems from "./pages/MenuItems";
import Recipes from "./pages/Recipes";
import Production from "./pages/Production";
import ProductionAnalysis from "./pages/ProductionAnalysis";
import FinishedGoodsStock from "./pages/FinishedGoodsStock";
import Dispatch from "./pages/Dispatch";
import Sales from "./pages/Sales";
import StaffSales from "./pages/StaffSales";
import DailySummary from "./pages/DailySummary";
import MonthlySummary from "./pages/MonthlySummary";
import DailyProfitReport from "./pages/DailyProfitReport";
import MonthlyProfitReport from "./pages/MonthlyProfitReport";
import PilferageMonitoring from "./pages/PilferageMonitoring";
import ResonanceCheck from "./pages/resonancecheck";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!user) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          if (loggedInUser.role === "staff") {
            setPage("staffSales");
          } else {
            setPage("dashboard");
          }
        }}
      />
    );
  }

  const adminPages = {
    dashboard: <Dashboard />,
    raw: <RawMaterials />,
    purchases: <PurchaseLog />,
    menu: <MenuItems />,
    recipes: <Recipes />,
    production: <Production />,
    productionAnalysis: <ProductionAnalysis />,
    finishedGoods: <FinishedGoodsStock />,
    dispatch: <Dispatch />,
    sales: <Sales />,
    staffSales: <StaffSales />,
    dailySummary: <DailySummary />,
    monthlySummary: <MonthlySummary />,
    dailyProfitReport: <DailyProfitReport />,
    monthlyProfitReport: <MonthlyProfitReport />,
    pilferage: <PilferageMonitoring />,
    resonance: <ResonanceCheck />,
  };

  const staffPages = {
    dispatch: <Dispatch />,
    staffSales: <StaffSales />,
    dailySummary: <DailySummary />,
    monthlySummary: <MonthlySummary />,
  };

  const adminNavItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "raw", label: "Raw Materials" },
    { key: "purchases", label: "Purchase Log" },
    { key: "menu", label: "Menu Items" },
    { key: "recipes", label: "Recipes" },
    { key: "production", label: "Production" },
    { key: "productionAnalysis", label: "Production Analysis" },
    { key: "finishedGoods", label: "Finished Goods Stock" },
    { key: "dispatch", label: "Dispatch" },
    { key: "sales", label: "Sales" },
    { key: "staffSales", label: "Staff Sales" },
    { key: "dailySummary", label: "Daily Summary" },
    { key: "monthlySummary", label: "Monthly Summary" },
    { key: "dailyProfitReport", label: "Daily Profit Report" },
    { key: "monthlyProfitReport", label: "Monthly Profit Report" },
    { key: "pilferage", label: "Pilferage Monitoring" },
    { key: "resonance", label: "Resonance Check" },
  ];

  const staffNavItems = [
    { key: "dispatch", label: "Dispatch" },
    { key: "staffSales", label: "Staff Sales" },
    { key: "dailySummary", label: "Daily Summary" },
    { key: "monthlySummary", label: "Monthly Summary" },
  ];

  const isAdmin = user.role === "admin";
  const pages = isAdmin ? adminPages : staffPages;
  const navItems = isAdmin ? adminNavItems : staffNavItems;

  const activePage = pages[page]
    ? pages[page]
    : isAdmin
      ? <Dashboard />
      : <StaffSales />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          height: 68,
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2 }}>
          Bakery Inventory System
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14 }}>
            {user.full_name}{" "}
            <span style={{ color: "#94a3b8" }}>({user.role})</span>
            {user.assigned_location_name ? (
              <span style={{ color: "#cbd5e1" }}> • {user.assigned_location_name}</span>
            ) : null}
          </div>
          <button
            onClick={() => {
              setUser(null);
              setPage("dashboard");
            }}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 68px)" }}>
        <aside
          style={{
            width: 270,
            background: "#111827",
            color: "#ffffff",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "#94a3b8",
              marginBottom: 14,
              fontWeight: 700,
            }}
          >
            {isAdmin ? "Admin Modules" : "Staff Modules"}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {navItems.map((item) => {
              const active = page === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  style={{
                    textAlign: "left",
                    border: "none",
                    padding: "12px 14px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    background: active ? "#2563eb" : "#1f2937",
                    color: "#ffffff",
                    boxShadow: active ? "0 6px 16px rgba(37,99,235,0.35)" : "none",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main style={{ flex: 1, padding: 24, boxSizing: "border-box" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: 22,
              boxShadow: "0 12px 34px rgba(15,23,42,0.08)",
              padding: 24,
              minHeight: "calc(100vh - 116px)",
            }}
          >
            {activePage}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;