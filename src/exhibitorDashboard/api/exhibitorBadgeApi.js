import { apiPostJson } from "./base";

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false };
  }
};

export const fetchBadgesByCompany = async (companyName) =>
  get(
    `/api/get_exhibitor_badges_by_company.php?company_name=${encodeURIComponent(companyName)}`
  );

export const fetchBadgeCounts = async (companyName) =>
  get(
    `/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(companyName)}`
  );

export const fetchUnlockApproved = async (badgeId) =>
  get(`/api/get_unlock_approved_status.php?badge_id=${badgeId}`);

export const submitBadge = async (formData) => {
  const res = await fetch(`/api/submit-badge.php`, {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: "Invalid response" };
  }
};

export const editBadge = async (formData) => {
  const res = await fetch(`/api/edit_exhibitor_badge.php`, {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: "Invalid response" };
  }
};

export const deleteBadge = (id) =>
  apiPostJson("delete_exhibitor_badge.php", { id });

export const lockAllBadges = (companyName) =>
  apiPostJson("all_badges_lock_exhibitor.php", { company_name: companyName });

export const lockSingleBadge = (badgeId, companyName) =>
  apiPostJson("lock_exhibitor_badges.php", {
    badge_id: Number(badgeId),
    company_name: companyName,
  });

export const requestBadgeUnlock = (badgeId) =>
  apiPostJson("request_badge_unlock.php", { badge_id: badgeId });

export const sendBadgeUnlockMail = (companyName) =>
  apiPostJson("exhibitor_badge_unlock_email.php", { company_name: companyName });

export const sendExtraBadgesMail = (companyName) =>
  apiPostJson("send_extra_badges_mail.php", {
    company_name: companyName,
    template_name: "InOptics 2026 Exhibitor Extra Badges",
  });
