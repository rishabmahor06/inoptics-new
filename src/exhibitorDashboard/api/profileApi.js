import { apiGet, apiPostJson, getExhibitor } from "./base";

export const fetchExhibitors = async () => {
  const data = await apiGet("get_exhibitors.php");
  const arr = Array.isArray(data) ? data : data?.data || [];
  const ex = getExhibitor();
  const email = (ex?.email || "").toLowerCase();
  const company = (ex?.company_name || "").toLowerCase();
  if (!email && !company) return arr;
  return arr.filter(
    (r) =>
      (r.email || "").toLowerCase() === email ||
      (r.company_name || "").toLowerCase() === company
  );
};

export const fetchStalls = async () => {
  const data = await apiGet("get_stalls.php");
  const arr = Array.isArray(data) ? data : data?.data || [];
  const ex = getExhibitor();
  const company = (ex?.company_name || "").toLowerCase();
  if (!company) return arr;
  return arr.filter(
    (r) => (r.company_name || "").toLowerCase() === company
  );
};

export const fetchProducts = async () => {
  const data = await apiGet("get_product.php");
  return Array.isArray(data) ? data : data?.data || [];
};

export const fetchBrands = async (companyName) => {
  const res = await fetch(
    `/api/get_exhibitor_brands.php?Company_name=${encodeURIComponent(
      companyName || ""
    )}`
  );
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data?.data ? [data.data] : [data];
  return arr[0] || null;
};

export const saveBrands = async (payload, isUpdate) => {
  const url = isUpdate
    ? "update_exhibitor_brands.php"
    : "add_exhibitor_brands.php";
  return apiPostJson(url, payload);
};
