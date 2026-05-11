const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
};

export const fetchStallPayments = async (companyName) => {
  const data = await get(
    `/api/get_exhibitor_payment.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data?.records || [];
};

export const fetchPowerPayments = async (companyName) => {
  const data = await get(
    `/api/get_exhibitor_power_payment.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data?.records || [];
};

export const fetchBadgePayments = async (companyName) => {
  const data = await get(
    `/api/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(companyName)}`
  );
  return data?.records || [];
};
