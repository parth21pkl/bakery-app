const API_BASE = "http://127.0.0.1:5000/api";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const text = await res.text();

  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json;
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json;
}