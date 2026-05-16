import { apiPostForm, apiPostJson } from "./base";

const API = "/api";

/* contractors list */
export const fetchContractors = async () => {
  const res = await fetch(`${API}/get_exhibitor_contractors_requirements.php`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || [];
};

/* selected contractor for this exhibitor */
export const fetchSelectedContractor = async (companyName) => {
  const res = await fetch(
    `${API}/get_selected_exhibitors_contractors.php?exhibitor_company_name=${encodeURIComponent(companyName)}`
  );
  if (!res.ok) return null;
  return res.json();
};

export const selectContractor = (payload) =>
  apiPostJson("selected_exhibitors_contractors.php", payload);

export const unselectContractor = (companyName) =>
  apiPostJson("unselect_exhibitors_contractors.php", {
    exhibitor_company_name: companyName,
  });

export const requestContractorChange = (payload) =>
  apiPostJson("create_unlock_request.php", payload);

export const sendContractorChangeMail = (payload) =>
  apiPostJson("request_contractor_change_mail.php", payload);

/* registration mail to unregistered contractor */
export const sendRegistrationMail = (payload) =>
  apiPostJson("send_contractor_registration_mails.php", payload);

/* core forms (download URLs for each step) */
export const fetchCoreForms = async () => {
  const res = await fetch(`${API}/get_core_forms.php`);
  if (!res.ok) return [];
  return res.json();
};

/* form upload for each step */
export const uploadExhibitorForm = (fd) =>
  apiPostForm("upload_exhibitor_form.php", fd);

/* lock a step after submit */
export const lockContractorStep = (companyName, stepNumber) => {
  const fd = new FormData();
  fd.append("exhibitor_company_name", companyName);
  fd.append("step_number", stepNumber);
  return apiPostForm("lock_contractor_step_status.php", fd);
};

/* request unlock for a step */
export const requestStepUnlock = (companyName, stepNumber) => {
  const fd = new FormData();
  fd.append("exhibitor_company_name", companyName);
  fd.append("step_number", stepNumber);
  return apiPostForm("request_step_unlock.php", fd);
};

/* fetch unlock/lock status for all steps */
export const fetchUnlockStatus = async (companyName) => {
  const res = await fetch(
    `${API}/get_contractor_unlock_step_status.php?exhibitor_company_name=${encodeURIComponent(companyName)}`
  );
  if (!res.ok) return {};
  try {
    const data = await res.json();
    return data?.steps || {};
  } catch {
    return {};
  }
};

/* send the contractor undertaking form to contractor */
export const sendFormToContractor = (payload) =>
  apiPostJson("send_contractor_form.php", payload);

/* check what's already uploaded */
export const checkUploadedForm = async (companyName, type) => {
  try {
    const res = await fetch(
      `${API}/download_exhibitor_form.php?company=${encodeURIComponent(companyName)}&type=${type}`,
      { method: "HEAD" }
    );
    return res.ok;
  } catch {
    return false;
  }
};
