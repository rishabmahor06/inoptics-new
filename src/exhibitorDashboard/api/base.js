export const API = "/api";

export const apiGet = async (endpoint) => {
  const res = await fetch(`${API}/${endpoint}`);
  if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
  return res.json();
};

export const apiPostJson = async (endpoint, data) => {
  const res = await fetch(`${API}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
  return res.json();
};

export const apiPostForm = async (endpoint, formData) => {
  const res = await fetch(`${API}/${endpoint}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
  return res.json();
};

export const getExhibitor = () => {
  try {
    return JSON.parse(localStorage.getItem("exhibitorInfo") || "{}");
  } catch {
    return {};
  }
};
