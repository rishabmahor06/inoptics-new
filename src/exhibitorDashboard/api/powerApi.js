import { apiPostJson } from "./base";

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
};

export const fetchMasterPower = async () => {
  const res = await fetch(`/api/get_power_requirement.php`);
  const text = await res.text();
  if (!text) return [];
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : data?.entries || [];
  } catch {
    return [];
  }
};

export const fetchExhibitorPower = async (companyName) => {
  return get(
    `/api/get_Exhibitor_power_requirement.php?company_name=${encodeURIComponent(companyName)}`
  );
};

export const submitExhibitorPower = (entries) =>
  apiPostJson("add_Exhibitor_power_requirement.php", { entries });

export const updateExhibitorPower = (companyName, entries) =>
  apiPostJson("update_power_requirement.php", {
    company_name: companyName,
    entries,
  });

export const requestPowerUnlock = (companyName) =>
  apiPostJson("power_mail_unlock_request.php", {
    template_name: "InOptics 2026 @ Request to Unlock Power Requirement",
    company_name: companyName,
  });

export const sendPowerAdminMail = (companyName) =>
  apiPostJson("send_power_mail_to_admin.php", {
    template_name: "InOptics 2026 @ Exhibitor Power Requirement Confirmation",
    company_name: companyName,
  });

export const sendPowerVendorMail = (companyName) =>
  apiPostJson("send_power_mail_to_vendor.php", {
    company_name: companyName,
    template_name: "Power Requirement by Exhibitor",
  });

export const sendPowerRevisedMail = (companyName, email) =>
  apiPostJson("send_power_revised_mail.php", {
    company_name: companyName,
    template_name: "POWER LOAD INCREASED",
    email,
  });

export const sendPowerRevisedVendorMail = (companyName) =>
  apiPostJson("send_power_vendor_mail.php", {
    template_name: "Revised Power Load Vendor",
    company_name: companyName,
  });
