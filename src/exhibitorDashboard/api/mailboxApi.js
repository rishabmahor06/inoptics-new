import { apiGet, apiPostJson, getExhibitor } from "./base";

/**
 * Fetch the list of mails for the currently logged-in exhibitor.
 * NOTE: If your backend uses a different endpoint name, change the
 * string below — the rest of the app will keep working.
 */
export const fetchExhibitorMails = async () => {
  const ex = getExhibitor();
  const email = ex?.email || "";
  const company = ex?.company_name || "";
  const qs = new URLSearchParams({ email, company_name: company }).toString();
  const data = await apiGet(`get_exhibitor_mails.php?${qs}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.mails)) return data.mails;
  return [];
};

/** Mark a single mail as read. */
export const markMailRead = async (mailId) => {
  return apiPostJson("mark_mail_read.php", { id: mailId });
};
