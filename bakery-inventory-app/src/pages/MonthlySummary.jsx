import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function MonthlySummary() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchMonthlySummary() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/monthly-summary?month=${selectedMonth}&year=${selectedYear}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to fetch monthly summary");
        return;
      }

      setSummary(data);
    } catch (err) {
  console.error("Close month error:", err);
  alert("Backend not reachable. Check backend terminal for error.");
} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedMonth, selectedYear]);

  function printSummary() {
    window.print();
  }

  async function closeMonth() {
    const confirmPrint = window.confirm(
      "Have you printed or saved the monthly summary?"
    );

    if (!confirmPrint) {
      alert("Please print/save monthly summary first.");
      return;
    }

    const confirmText = window.prompt(
      'Type "CLOSE MONTH" to clear this month data:'
    );

    if (confirmText !== "CLOSE MONTH") {
      alert("Monthly closing cancelled.");
      return;
    }

    try {
const res = await fetch(`${API_BASE}/api/month-close/close-month`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          confirmText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to close month.");
        return;
      }

      alert(data.message);
      fetchMonthlySummary();
    } catch (err) {
      alert("Backend not reachable. Please check server.");
    }
  }

  return (
    <div className="p-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold mb-4">Monthly Summary</h1>

        <div className="flex gap-3 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border p-2 rounded"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border p-2 rounded"
          />

          <button
            onClick={fetchMonthlySummary}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Load Summary
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={printSummary}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Print Monthly Summary
          </button>

          <button
            onClick={closeMonth}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Close Month & Clear Database
          </button>
        </div>
      </div>

      <div className="print-area border rounded p-5 bg-white">
        <h2 className="text-xl font-bold text-center mb-2">
          Monthly Summary Report
        </h2>

        <p className="text-center mb-4">
          Month: {selectedMonth} / Year: {selectedYear}
        </p>

        {loading && <p>Loading...</p>}

        {!loading && !summary && <p>No monthly summary found.</p>}

        {!loading && summary && (
          <div>
            <table className="w-full border-collapse border mb-5">
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold">Total Purchase</td>
                  <td className="border p-2">{summary.totalPurchase || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Total Production</td>
                  <td className="border p-2">{summary.totalProduction || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Total Dispatch</td>
                  <td className="border p-2">{summary.totalDispatch || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Total Sales</td>
                  <td className="border p-2">{summary.totalSales || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Total Returned</td>
                  <td className="border p-2">{summary.totalReturned || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Total Wastage</td>
                  <td className="border p-2">{summary.totalWastage || 0}</td>
                </tr>

                <tr>
                  <td className="border p-2 font-semibold">Net Amount</td>
                  <td className="border p-2">₹ {summary.netAmount || 0}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-bold mb-2">Item-wise Summary</h3>

            {summary.items && summary.items.length > 0 ? (
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Item</th>
                    <th className="border p-2">Produced</th>
                    <th className="border p-2">Dispatched</th>
                    <th className="border p-2">Sold</th>
                    <th className="border p-2">Returned</th>
                    <th className="border p-2">Wasted</th>
                    <th className="border p-2">Closing</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{item.item_name}</td>
                      <td className="border p-2">{item.produced_qty || 0}</td>
                      <td className="border p-2">{item.dispatched_qty || 0}</td>
                      <td className="border p-2">{item.sold_qty || 0}</td>
                      <td className="border p-2">{item.returned_qty || 0}</td>
                      <td className="border p-2">{item.wasted_qty || 0}</td>
                      <td className="border p-2">{item.closing_qty || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No item-wise data found.</p>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              background: white;
            }

            .print-area {
              border: none;
              padding: 0;
            }
          }
        `}
      </style>
    </div>
  );
}