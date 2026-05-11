import { apiPostJson } from "./base";

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
};

export const fetchFurnitureCatalog = async () => {
  const data = await get(`/api/get_furniture_requirement.php`);
  return Array.isArray(data) ? data : data?.data || [];
};

export const fetchFurnitureVendor = async () => {
  const data = await get(`/api/get_furniture_vendor.php`);
  return data?.success && Array.isArray(data.data) ? data.data : [];
};

export const fetchSelectedFurniture = async (companyName) => {
  const data = await get(
    `/api/get_selected_furniture.php?company_name=${encodeURIComponent(companyName)}`
  );
  const list = Array.isArray(data?.furniture) ? data.furniture : Array.isArray(data) ? data : [];
  const lockState = data?.lockState || null;
  return { list, lockState };
};

export const updateSelectedFurniture = (companyName, furniture) =>
  apiPostJson("Update_selected_furniture.php", {
    company_name: companyName,
    furniture: furniture.map((item) => ({
      image: item.image,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity || 0,
    })),
  });

export const requestFurnitureUnlock = (companyName) =>
  apiPostJson("unlock_request.php", { company_name: companyName });

export const sendFurnitureUnlockMail = (formData) =>
  apiPostJson("send_unlock_request_mail.php", formData);

export const fetchEmailTemplates = async () => {
  const data = await get(`/api/get_email_messages.php`);
  return data?.data || [];
};

export const sendFurnitureMail = (payload) =>
  apiPostJson("send_furniture_vendor_mail.php", payload);
