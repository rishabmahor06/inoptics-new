import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";
const DEFAULT_CONFIRMATION_TEMPLATE = "InOptics 2026 @ Extra Furniture Request Confirmation";
const EXHIBITOR_CONFIRMATION_TEMPLATE = "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor";
const UNLOCK_TEMPLATE = "InOptics 2026 @ Extra Furniture Section Unlocked";

const EMPTY_BILLING = {
  amount: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  grandTotal: 0,
};

const EMPTY_LOCK = {
  is_locked: 0,
  unlock_requested: 0,
};

const normalizeFurniture = (rows) =>
  (Array.isArray(rows) ? rows : []).map((item) => ({
    id: item.id || `${item.furniture_name || item.name}-${item.image_url || item.image || "item"}`,
    name: item.furniture_name || item.name || "Unnamed",
    image: item.image_url || item.image || "",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

const recalcBilling = (items, exhibitorState) => {
  const amount = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const isDelhi = String(exhibitorState || "").trim().toLowerCase() === "delhi";
  const cgst = isDelhi ? amount * 0.09 : 0;
  const sgst = isDelhi ? amount * 0.09 : 0;
  const igst = isDelhi ? 0 : amount * 0.18;
  return {
    amount,
    cgst,
    sgst,
    igst,
    grandTotal: amount + cgst + sgst + igst,
  };
};

const replaceTemplateData = (template, dataMap) => {
  let html = template;
  Object.keys(dataMap).forEach((key) => {
    html = html.replaceAll(key, dataMap[key]);
  });
  return html.replace(/&n/g, "<br>");
};

const buildFurnitureTable = (items, exhibitorState) => {
  const isDelhi = String(exhibitorState || "").trim().toLowerCase() === "delhi";
  let amountTotal = 0;
  let taxOneTotal = 0;
  let taxTwoTotal = 0;
  let grandTotal = 0;

  const rows = items
    .map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.price || 0);
      const amount = qty * rate;
      const taxOne = amount * (isDelhi ? 0.09 : 0.18);
      const taxTwo = amount * (isDelhi ? 0.09 : 0);
      const total = amount + taxOne + taxTwo;

      amountTotal += amount;
      taxOneTotal += taxOne;
      taxTwoTotal += taxTwo;
      grandTotal += total;

      return `
        <tr>
          <td>${item.name}</td>
          <td align="center">${qty}</td>
          <td align="right">${rate.toFixed(2)}</td>
          <td align="right">${amount.toFixed(2)}</td>
          <td align="right">${taxOne.toFixed(2)}</td>
          <td align="right">${taxTwo ? taxTwo.toFixed(2) : "-"}</td>
          <td align="right">${total.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const taxOneLabel = isDelhi ? "SGST (9%)" : "IGST (18%)";
  const taxTwoLabel = isDelhi ? "CGST (9%)" : "Extra Tax";
  const totalTaxTwo = isDelhi ? taxTwoTotal.toFixed(2) : "-";

  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px">
      <thead style="background:#f2f2f2">
        <tr>
          <th>Item Name</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
          <th>${taxOneLabel}</th>
          <th>${taxTwoLabel}</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="font-weight:bold;background:#fafafa">
          <td colspan="3" align="right">TOTAL</td>
          <td align="right">${amountTotal.toFixed(2)}</td>
          <td align="right">${taxOneTotal.toFixed(2)}</td>
          <td align="right">${totalTaxTwo}</td>
          <td align="right">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
};

export const useExhibitorFurnitureStore = create((set, get) => ({
  catalogRows: [],
  selectedFurniture: [],
  vendorDetails: [],
  emailTemplates: [],
  billing: { ...EMPTY_BILLING },
  lockState: { ...EMPTY_LOCK },
  hasExistingData: false,
  loading: false,
  saving: false,
  isSendingMail: false,
  showCatalog: false,
  catalogSearch: "",

  setShowCatalog: (value) => set({ showCatalog: value }),
  setCatalogSearch: (value) => set({ catalogSearch: value }),

  reset: () =>
    set({
      selectedFurniture: [],
      billing: { ...EMPTY_BILLING },
      lockState: { ...EMPTY_LOCK },
      hasExistingData: false,
      showCatalog: false,
      catalogSearch: "",
    }),

  initForCompany: async (exhibitor) => {
    if (!exhibitor?.company_name) {
      get().reset();
      return;
    }

    set({
      selectedFurniture: [],
      billing: { ...EMPTY_BILLING },
      lockState: { ...EMPTY_LOCK },
      hasExistingData: false,
      showCatalog: false,
      catalogSearch: "",
      loading: true,
    });

    try {
      await Promise.all([
        get().fetchCatalog(),
        get().fetchVendorDetails(),
        get().fetchEmailTemplates(),
        get().fetchSelectedFurniture(exhibitor.company_name, exhibitor.state),
      ]);
    } finally {
      set({ loading: false });
    }
  },

  fetchCatalog: async () => {
    try {
      const res = await fetch(`${API}/get_furniture_requirement.php`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : data.data || data.furniture || [];
      set({
        catalogRows: rows.map((item) => ({
          id: item.id,
          name: item.furniture_name || item.name || "Unnamed",
          image: item.image || "",
          price: Number(item.price) || 0,
        })),
      });
    } catch (error) {
      console.error("Furniture catalog fetch failed:", error);
      toast.error("Failed to load furniture catalog");
    }
  },

  fetchVendorDetails: async () => {
    try {
      const res = await fetch(`${API}/get_furniture_vendor_details.php`);
      const data = await res.json();
      if (data.status === "success") {
        set({ vendorDetails: data.vendors || [] });
      } else {
        set({ vendorDetails: [] });
      }
    } catch (error) {
      console.error("Furniture vendor fetch failed:", error);
      toast.error("Failed to load vendor details");
    }
  },

  fetchEmailTemplates: async () => {
    try {
      const res = await fetch(`${API}/get_email_messages.php`);
      const json = await res.json();
      set({ emailTemplates: json.data || [] });
    } catch (error) {
      console.error("Furniture email templates fetch failed:", error);
      toast.error("Failed to load email templates");
    }
  },

  fetchSelectedFurniture: async (companyName, exhibitorState = "") => {
    if (!companyName) return;
    try {
      const response = await fetch(
        `${API}/get_selected_furniture.php?company_name=${encodeURIComponent(companyName)}`,
      );
      const data = await response.json();
      const furnitureList = Array.isArray(data.furniture) ? data.furniture : Array.isArray(data) ? data : [];
      const selectedFurniture = normalizeFurniture(furnitureList);
      set({
        selectedFurniture,
        billing: recalcBilling(selectedFurniture, exhibitorState),
        lockState: data.lockState || { ...EMPTY_LOCK },
        hasExistingData: selectedFurniture.length > 0,
      });
    } catch (error) {
      console.error("Selected furniture fetch failed:", error);
      toast.error("Failed to fetch selected furniture");
    }
  },

  addFurniture: (item, exhibitorState) => {
    const exists = get().selectedFurniture.some((row) => String(row.id) === String(item.id));
    if (exists) return;
    const next = [...get().selectedFurniture, { ...item, quantity: 1 }];
    set({
      selectedFurniture: next,
      billing: recalcBilling(next, exhibitorState),
    });
  },

  removeFurniture: (index, exhibitorState) => {
    const next = get().selectedFurniture.filter((_, itemIndex) => itemIndex !== index);
    set({
      selectedFurniture: next,
      billing: recalcBilling(next, exhibitorState),
    });
  },

  setQuantity: (index, value, exhibitorState) => {
    const qty = Math.max(1, Number.parseInt(value, 10) || 1);
    const next = [...get().selectedFurniture];
    if (!next[index]) return;
    next[index] = { ...next[index], quantity: qty };
    set({
      selectedFurniture: next,
      billing: recalcBilling(next, exhibitorState),
    });
  },

  changeQuantityBy: (index, delta, exhibitorState) => {
    const next = [...get().selectedFurniture];
    if (!next[index]) return;
    const qty = Math.max(1, Number(next[index].quantity || 1) + delta);
    next[index] = { ...next[index], quantity: qty };
    set({
      selectedFurniture: next,
      billing: recalcBilling(next, exhibitorState),
    });
  },

  saveFurniture: async (exhibitor) => {
    const { selectedFurniture, hasExistingData } = get();
    if (!exhibitor?.company_name) {
      toast.error("Exhibitor company missing");
      return false;
    }
    if (!selectedFurniture.length) {
      toast.error("Please add at least one furniture item");
      return false;
    }

    set({ saving: true });
    try {
      const payload = {
        company_name: exhibitor.company_name,
        furniture: selectedFurniture.map((item) => ({
          image: item.image,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.price) * Number(item.quantity),
        })),
      };
      const url = hasExistingData ? `${API}/Update_selected_furniture.php` : `${API}/add_selected_furniture.php`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && (data.status === "success" || data.success)) {
        toast.success(hasExistingData ? "Furniture updated successfully" : "Furniture submitted successfully");
        set({ showCatalog: false });
        await get().fetchSelectedFurniture(exhibitor.company_name, exhibitor.state);
        return true;
      }
      toast.error(data.message || "Failed to save furniture");
      return false;
    } catch (error) {
      console.error("Furniture save failed:", error);
      toast.error("Error saving furniture");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  unlockFurniture: async (exhibitor) => {
    if (!exhibitor?.company_name) {
      toast.error("Missing company name");
      return false;
    }
    if (!window.confirm(`Unlock furniture for ${exhibitor.company_name}?`)) return false;

    set({ isSendingMail: true });
    try {
      const response = await fetch(`${API}/admin_unlock_furniture.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name }),
      });
      const result = await response.json();
      if (!(result.status === "success" || result.status === "unlocked")) {
        throw new Error(result.message || "Unlock failed");
      }

      set({ lockState: { ...EMPTY_LOCK } });

      const emailTemplate = get().emailTemplates.find((t) => t.email_name === UNLOCK_TEMPLATE);
      if (emailTemplate && exhibitor.email) {
        const html = replaceTemplateData(emailTemplate.content, {
          "[Company Name]": exhibitor.company_name,
          "[Email]": exhibitor.email,
        });

        await fetch(`${API}/send_mail.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_name: UNLOCK_TEMPLATE,
            to: exhibitor.email,
            html,
            company_name: exhibitor.company_name,
            secondary_emails: exhibitor.secondary_emails || "",
          }),
        });
      }

      toast.success("Furniture unlocked successfully");
      return true;
    } catch (error) {
      console.error("Furniture unlock failed:", error);
      toast.error(error.message || "Failed to unlock furniture");
      return false;
    } finally {
      set({ isSendingMail: false });
    }
  },

  sendFurnitureMail: async (exhibitor, emailTemplateName = DEFAULT_CONFIRMATION_TEMPLATE) => {
    const { selectedFurniture, emailTemplates, vendorDetails, isSendingMail } = get();
    if (isSendingMail) return false;
    if (!exhibitor?.company_name || !exhibitor?.email) {
      toast.error("Missing exhibitor details");
      return false;
    }
    if (!selectedFurniture.length) {
      toast.error("No furniture selected");
      return false;
    }

    set({ isSendingMail: true });
    try {
      const vendorTemplate = emailTemplates.find((template) => template.email_name === emailTemplateName);
      const exhibitorTemplate = emailTemplates.find(
        (template) => template.email_name === EXHIBITOR_CONFIRMATION_TEMPLATE,
      );
      if (!vendorTemplate || !exhibitorTemplate) {
        throw new Error("Email template not found");
      }

      const vendor = vendorDetails?.[0] || {};
      const vendorEmail =
        vendor.email ||
        vendor.vendor_email ||
        vendor.vendorEmail ||
        vendor.contact_email ||
        "";

      if (!vendorEmail) throw new Error("Vendor email missing");

      const furnitureTable = buildFurnitureTable(selectedFurniture, exhibitor.state);
      const replaceData = {
        "[Company_Name]": exhibitor.company_name || "",
        "[Contact_Person_Name]": exhibitor.name || exhibitor.contact_person || "",
        "[Mobile_Number]": exhibitor.mobile || exhibitor.phone || "",
        "[Email_Address]": exhibitor.email || "",
        "[Stall_No]": exhibitor.stall_no || "",
        "[Vendor_Name]": vendor.vendor_name || "",
        "[Vendor_Company]": vendor.company_name || "",
        "[Vendor_Email]": vendorEmail,
        "[Vendor_Phone]": vendor.contact_number || vendor.mobile || "",
        "[Furniture_Table]": furnitureTable,
        "[Exhibitor_Name]": exhibitor.name || exhibitor.contact_person || "",
        "[Phone_Number]": exhibitor.mobile || exhibitor.phone || "",
      };

      const vendorHTML = replaceTemplateData(vendorTemplate.content, replaceData);
      const exhibitorHTML = replaceTemplateData(exhibitorTemplate.content, replaceData);

      const vendorRes = await fetch(`${API}/send_furniture_vendor_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: emailTemplateName,
          to: vendorEmail,
          html: vendorHTML,
        }),
      });
      const vendorResult = await vendorRes.json();
      if (!String(vendorResult.message || "").toLowerCase().includes("successfully")) {
        throw new Error("Vendor mail failed");
      }

      const exhibitorRes = await fetch(`${API}/send_furniture_vendor_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: EXHIBITOR_CONFIRMATION_TEMPLATE,
          to: exhibitor.email,
          html: exhibitorHTML,
          company_name: exhibitor.company_name,
        }),
      });
      const exhibitorResult = await exhibitorRes.json();
      if (String(exhibitorResult.message || "").toLowerCase().includes("successfully")) {
        toast.success("Mail sent successfully");
        return true;
      }

      throw new Error("Vendor mail sent but exhibitor mail failed");
    } catch (error) {
      console.error("Furniture mail failed:", error);
      toast.error(error.message || "Failed to send furniture mail");
      return false;
    } finally {
      set({ isSendingMail: false });
    }
  },
}));
