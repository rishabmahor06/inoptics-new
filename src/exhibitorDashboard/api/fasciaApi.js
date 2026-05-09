import { apiPostJson } from "./base";

export const fetchFascia = async (companyName) => {
  const res = await fetch(
    `/api/get_exhibitor_facia.php?exhibitor_company_name=${encodeURIComponent(companyName)}`
  );
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const submitFascia = async (payload) => {
  return apiPostJson("submit_facia_company.php", payload);
};
