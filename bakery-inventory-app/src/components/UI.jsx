import React from "react";

export function Page({ title, subtitle = "", actions, children }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: 28 }}>{title}</h2>
          {subtitle ? (
            <p style={{ margin: "8px 0 0", color: "#475569", fontSize: 14 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, value, hint, tone = "blue" }) {
  const tones = {
    blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    green: { bg: "#ecfdf5", border: "#bbf7d0", text: "#15803d" },
    amber: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    red: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
    slate: { bg: "#f8fafc", border: "#cbd5e1", text: "#334155" },
  };

  const c = tones[tone] || tones.blue;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: 13, color: "#475569", fontWeight: 700, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: c.text }}>{value}</div>
      {hint ? <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>{hint}</div> : null}
    </div>
  );
}

export function Section({ title, children, actions }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>{title}</h3>
        {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Grid({ children, min = 220 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        padding: 11,
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        fontSize: 14,
        background: "#ffffff",
        color: "#0f172a",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {}),
      }}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      style={{
        padding: 11,
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        fontSize: 14,
        background: "#ffffff",
        color: "#0f172a",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {}),
      }}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        padding: 11,
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        fontSize: 14,
        background: "#ffffff",
        color: "#0f172a",
        outline: "none",
        width: "100%",
        minHeight: 90,
        boxSizing: "border-box",
        resize: "vertical",
        ...(props.style || {}),
      }}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  style,
}) {
  const variants = {
    primary: {
      bg: "#2563eb",
      color: "#ffffff",
      border: "#2563eb",
    },
    secondary: {
      bg: "#334155",
      color: "#ffffff",
      border: "#334155",
    },
    success: {
      bg: "#16a34a",
      color: "#ffffff",
      border: "#16a34a",
    },
    danger: {
      bg: "#dc2626",
      color: "#ffffff",
      border: "#dc2626",
    },
    light: {
      bg: "#ffffff",
      color: "#0f172a",
      border: "#cbd5e1",
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#94a3b8" : v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        padding: "10px 14px",
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: 14,
        transition: "0.2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Label({ children }) {
  return (
    <label
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#334155",
        marginBottom: 6,
        display: "block",
      }}
    >
      {children}
    </label>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      {label ? <Label>{label}</Label> : null}
      {children}
    </div>
  );
}

export function InfoBanner({ text, tone = "blue" }) {
  const tones = {
    blue: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    green: { bg: "#ecfdf5", border: "#bbf7d0", color: "#15803d" },
    red: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
    amber: { bg: "#fffbeb", border: "#fde68a", color: "#b45309" },
  };

  const c = tones[tone] || tones.blue;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        padding: 12,
        borderRadius: 12,
        marginBottom: 14,
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}

export function DataTable({ columns, rows, emptyText = "No data found" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#ffffff",
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: "1px solid #e2e8f0",
                  color: "#334155",
                  fontSize: 13,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e2e8f0",
                  color: "#64748b",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id ?? row.key ?? idx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #e2e8f0",
                      color: "#0f172a",
                      fontSize: 14,
                      verticalAlign: "top",
                    }}
                  >
                    {typeof col.render === "function" ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}