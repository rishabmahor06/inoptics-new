import { apiPostJson } from "./base";

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
};

export const fetchContractorBadge = async (exhibitorCompany) => {
  return get(
    `/api/get_contractor_badge.php?exhibitor_company_name=${encodeURIComponent(exhibitorCompany)}`
  );
};

export const fetchSelectedContractor = async (exhibitorCompany) => {
  return get(
    `/api/get_selected_exhibitors_contractors.php?exhibitor_company_name=${encodeURIComponent(exhibitorCompany)}`
  );
};

export const addContractorBadge = (payload) =>
  apiPostJson("add_contractor_badge.php", payload);

export const updateContractorBadge = (payload) =>
  apiPostJson("update_contractor_badge.php", payload);

export const requestUnlockBadge = (exhibitorCompany) =>
  apiPostJson("unlock_request_badge.php", {
    exhibitor_company_name: exhibitorCompany,
  });

export const sendUnlockMail = (companyName, email) =>
  apiPostJson("send_power_unlocked_mail.php", {
    company_name: companyName,
    email,
    template_name: "InOptics 2026 @ Contractor Badges Unlock Request",
  });
