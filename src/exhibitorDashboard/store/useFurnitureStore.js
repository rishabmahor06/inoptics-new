import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchFurnitureCatalog,
  fetchFurnitureVendor,
  fetchSelectedFurniture,
  updateSelectedFurniture,
  requestFurnitureUnlock,
  sendFurnitureUnlockMail,
  fetchEmailTemplates,
  sendFurnitureMail,
} from "../api/furnitureApi";
import { getExhibitor } from "../api/base";

const calcBilling = (selected, state) => {
  const amount = selected.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const cgst = isDelhi ? (amount * 9) / 100 : 0;
  const sgst = isDelhi ? (amount * 9) / 100 : 0;
  const igst = !isDelhi ? (amount * 18) / 100 : 0;
  return { amount, cgst, sgst, igst, grandTotal: amount + cgst + sgst + igst };
};

const normalize = (item) => ({
  ...item,
  id: item.id || `${item.name}-${Math.random()}`,
  name: item.furniture_name || item.name || "Unnamed",
  image: item.image_url || item.image || "",
  price: parseFloat(item.price) || 0,
  quantity: parseInt(item.quantity) || 1,
});

export const useFurnitureStore = create((set, get) => ({
  catalog: [],
  vendor: [],
  selected: [],
  isSaved: false,
  loading: false,
  saving: false,
  showCatalog: false,
  emailTemplates: [],
  billing: { amount: 0, cgst: 0, sgst: 0, igst: 0, grandTotal: 0 },

  setShowCatalog: (v) => set({ showCatalog: v }),

  recalc: () => {
    const ex = getExhibitor();
    set({ billing: calcBilling(get().selected, ex?.state) });
  },

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ loading: true });
    const safe = (p) => p.catch(() => null);
    const [catalog, vendor, selectedRes, templates] = await Promise.all([
      safe(fetchFurnitureCatalog()).then((r) => r || []),
      safe(fetchFurnitureVendor()).then((r) => r || []),
      safe(fetchSelectedFurniture(company)).then(
        (r) => r || { list: [], lockState: null }
      ),
      safe(fetchEmailTemplates()).then((r) => r || []),
    ]);
    const selected = selectedRes.list.map(normalize);
    const isLocked =
      selectedRes.lockState && typeof selectedRes.lockState.is_locked !== "undefined"
        ? Number(selectedRes.lockState.is_locked) === 1
        : selected.length > 0;
    set({
      catalog,
      vendor,
      selected,
      isSaved: isLocked,
      emailTemplates: templates,
      loading: false,
    });
    get().recalc();
  },

  addItem: (item) => {
    const { selected } = get();
    if (selected.some((s) => s.id === item.id)) return;
    set({ selected: [...selected, normalize({ ...item, quantity: 1 })] });
    get().recalc();
  },

  removeItem: (index) => {
    const list = [...get().selected];
    list.splice(index, 1);
    set({ selected: list });
    get().recalc();
  },

  setQuantity: (index, qty) => {
    const list = [...get().selected];
    list[index] = { ...list[index], quantity: Math.max(1, parseInt(qty) || 1) };
    set({ selected: list });
    get().recalc();
  },

  save: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const { selected } = get();
    if (!company) { toast.error("Company missing"); return false; }
    if (selected.length === 0) { toast.error("Select at least one item"); return false; }
    set({ saving: true });
    try {
      const res = await updateSelectedFurniture(company, selected);
      if (res?.status !== "success") {
        toast.error(res?.message || "Save failed");
        return false;
      }
      toast.success("Furniture saved");
      // fire mail (vendor + exhibitor) — best effort, don't block UI
      get().sendMails().catch(() => null);
      await get().fetchAll();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  requestUnlock: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    set({ saving: true });
    try {
      const res = await requestFurnitureUnlock(company);
      if (res?.status !== "success") {
        toast.error("Unlock request failed");
        return;
      }
      await sendFurnitureUnlockMail({
        company_name: company,
        name: ex?.name || "",
        email: ex?.email || "",
        phone: ex?.mobile || "",
        stall_no: ex?.stall_no || "",
      }).catch(() => null);
      toast.success("Unlock request sent");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      set({ saving: false });
    }
  },

  sendMails: async () => {
    const ex = getExhibitor();
    const { selected, emailTemplates, vendor } = get();
    const vendorTpl = emailTemplates.find(
      (t) => t.email_name === "InOptics 2026 @ Extra Furniture Request Confirmation"
    );
    const exhibitorTpl = emailTemplates.find(
      (t) => t.email_name === "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor"
    );
    if (!vendorTpl || !exhibitorTpl) return;
    const v = vendor[0] || {};
    const vendorEmail = v.email || v.vendor_email || v.contact_email;
    if (!vendorEmail || !ex?.email) return;

    let totalAmount = 0, totalSGST = 0, totalCGST = 0, grand = 0;
    const rows = selected
      .map((item) => {
        const qty = Number(item.quantity);
        const rate = Number(item.price);
        const amount = qty * rate;
        const sgst = amount * 0.09;
        const cgst = amount * 0.09;
        const total = amount + sgst + cgst;
        totalAmount += amount; totalSGST += sgst; totalCGST += cgst; grand += total;
        return `<tr><td>${item.name}</td><td align="center">${qty}</td><td align="right">${rate.toFixed(2)}</td><td align="right">${amount.toFixed(2)}</td><td align="right">${sgst.toFixed(2)}</td><td align="right">${cgst.toFixed(2)}</td><td align="right">${total.toFixed(2)}</td></tr>`;
      })
      .join("");

    const table = `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px"><thead style="background:#f2f2f2"><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th><th>SGST (9%)</th><th>CGST (9%)</th><th>Total</th></tr></thead><tbody>${rows}<tr style="font-weight:bold;background:#fafafa"><td colspan="3" align="right">TOTAL</td><td align="right">${totalAmount.toFixed(2)}</td><td align="right">${totalSGST.toFixed(2)}</td><td align="right">${totalCGST.toFixed(2)}</td><td align="right">${grand.toFixed(2)}</td></tr></tbody></table>`;

    const replace = (tpl) => {
      let html = tpl.content || "";
      const data = {
        "[Company_Name]": ex.company_name || "",
        "[Contact_Person_Name]": ex.name || "",
        "[Mobile_Number]": ex.mobile || "",
        "[Email_Address]": ex.email || "",
        "[Stall_No]": ex.stall_no || "",
        "[Vendor_Name]": v.vendor_name || "",
        "[Vendor_Company]": v.company_name || "",
        "[Vendor_Email]": vendorEmail,
        "[Vendor_Phone]": v.contact_number || v.mobile || "",
        "[Furniture_Table]": table,
        "[Exhibitor_Name]": ex.name || "",
        "[Phone_Number]": ex.mobile || "",
      };
      Object.keys(data).forEach((k) => { html = html.replaceAll(k, data[k]); });
      return html.replace(/&n/g, "<br>");
    };

    await sendFurnitureMail({
      email_name: vendorTpl.email_name,
      to: vendorEmail,
      html: replace(vendorTpl),
    }).catch(() => null);

    await sendFurnitureMail({
      email_name: exhibitorTpl.email_name,
      to: ex.email,
      html: replace(exhibitorTpl),
      company_name: ex.company_name,
    }).catch(() => null);
  },
}));
