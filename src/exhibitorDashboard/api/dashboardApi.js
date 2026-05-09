import { apiGet } from "./base";

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
};

const arr = (d) => (Array.isArray(d) ? d : d?.data || d?.entries || d?.records || []);

export const fetchEventSchedule = async () => {
  const data = await apiGet("get_exhibitor_event_schedule.php");
  return Array.isArray(data) ? data : data?.data || [];
};

export const fetchRemarks = async (companyName) => {
  const data = await get(
    `/api/get_exhibitor_remarks.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data?.records || arr(data);
};

export const fetchUndertakingStatus = async (companyName) => {
  return get(
    `/api/get_undertaking_status.php?company_name=${encodeURIComponent(companyName)}`
  );
};

export const fetchContractorUndertakingStatus = async (companyName) => {
  return get(
    `/api/get_contractor_undertaking_status.php?company_name=${encodeURIComponent(companyName)}`
  );
};

export const fetchPowerRequirement = async (companyName) => {
  const data = await get(
    `/api/get_Exhibitor_power_requirement.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data?.entries || [];
};

export const fetchExhibitorBadges = async (companyName) => {
  const data = await get(
    `/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data || {};
};

export const fetchSelectedContractors = async (companyName) => {
  const data = await get(
    `/api/get_selected_exhibitors_contractors.php?exhibitor_company_name=${encodeURIComponent(companyName)}`
  );
  return data;
};

export const fetchContractorBadges = async (companyName) => {
  const data = await get(
    `/api/get_all_contractor_badges.php?exhibitor_company_name=${encodeURIComponent(companyName)}`
  );
  return data?.records || [];
};

export const fetchBrands = async (companyName) => {
  const data = await get(
    `/api/get_exhibitor_brands.php?Company_name=${encodeURIComponent(companyName)}`
  );
  return data;
};
