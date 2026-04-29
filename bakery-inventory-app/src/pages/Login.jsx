import { useState } from "react";
import { apiPost } from "../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const user = await apiPost("/auth/login", { username, password });
      onLogin(user);
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Login error:", err);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111827, #1d4ed8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ marginBottom: 8, color: "#111827" }}>Bakery Login</h2>
        <p style={{ marginTop: 0, marginBottom: 24, color: "#6b7280" }}>
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 15,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 15,
            }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              border: "none",
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Login
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: 16 }}>{error}</p>}

        <p style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
          Default admin login: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}