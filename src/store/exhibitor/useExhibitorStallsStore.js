import { create } from "zustand";
import toast from "react-hot-toast";
import { useExhibitorListStore } from "./useExhibitorListStore";

const API = "https://inoptics.in/api";

const EMPTY_FORM = {
  id: null,
  company_name: "",
  hall_number: "",
  stall_number: "",
  stall_category: "",
  stall_area: "",
  currency: "",
  stall_price: 0,
  discount: "",
  total: 0,
  discounted_amount: 0,
  total_after_discount: 0,
  sgst9: 0,
  cgst9: 0,
  igst18: 0,
  grand_total: 0,
};

const customRound = (value) => {
  const num = parseFloat(String(value).trim());
  if (isNaN(num)) return 0;
  const intPart = Math.floor(Math.abs(num));
  const decimal = Math.abs(num) - intPart;
  const rounded = decimal <= 0.5 ? intPart : intPart + 1;
  return num < 0 ? -rounded : rounded;
};

const extractNumber = (str) => {
  if (str === null || str === undefined) return 0;
  const m = String(str).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

/* ============ pure billing recalc ============ */
function recalc(form, exhibitorState) {
  const area    = extractNumber(form.stall_area);
  const price   = parseFloat(form.stall_price) || 0;
  const total   = area * price;

  const discPct = parseFloat(form.discount) || 0;
  const discAmt = total * (discPct / 100);
  const afterDisc = discPct > 0 ? total - discAmt : total;

  const isDelhi = (exhibitorState || "").toLowerCase() === "delhi";
  const isRupee = form.currency === "Rupees";

  let sgst9 = 0, cgst9 = 0, igst18 = 0;
  if (form.currency) {
    if (isDelhi && isRupee) {
      sgst9 = afterDisc * 0.09;
      cgst9 = afterDisc * 0.09;
    } else {
      igst18 = afterDisc * 0.18;
    }
  }
  const grand = afterDisc + sgst9 + cgst9 + igst18;

  return {
    ...form,
    total,
    discounted_amount: discAmt,
    total_after_discount: afterDisc,
    sgst9, cgst9, igst18,
    grand_total: grand,
  };
}

export const useExhibitorStallsStore = create((set, get) => ({
  stallList:     [],
  loading:       false,
  formData:      { ...EMPTY_FORM },
  errors:        {},
  editingIndex:  null,
  isSendingMail: false,
  saving:        false,

  /* ============== form mgmt ============== */

  initForCompany: (exhibitor) => {
    if (!exhibitor) return;
    set({
      formData: { ...EMPTY_FORM, company_name: exhibitor.company_name || "" },
      errors: {}, editingIndex: null,
    });
    get().fetchStallsByCompany(exhibitor.company_name);
  },

  setField: (name, value, exhibitorState) => {
    const next = recalc({ ...get().formData, [name]: value }, exhibitorState);
    set((s) => ({
      formData: next,
      errors:   { ...s.errors, [name]: false },
    }));
  },

  // Category change auto-fills price based on currency.
  selectCategory: (category, categories, exhibitorState) => {
    const cat = categories.find((c) => c.category === category);
    let price = parseFloat(get().formData.stall_price) || 0;
    if (cat) {
      const cur = get().formData.currency;
      if (cur === "Rupees") price = parseFloat(cat.rupees) || 0;
      else if (cur === "Dollar") price = parseFloat(cat.dollar) || 0;
      else if (cur === "Euro")   price = parseFloat(cat.euro)   || 0;
    }
    const next = recalc({ ...get().formData, stall_category: category, stall_price: price }, exhibitorState);
    set((s) => ({ formData: next, errors: { ...s.errors, stall_category: false } }));
  },

  // Currency change recomputes price using stored category.
  selectCurrency: (currency, categories, exhibitorState) => {
    const cat = categories.find((c) => c.category === get().formData.stall_category);
    let price = parseFloat(get().formData.stall_price) || 0;
    if (cat) {
      if (currency === "Rupees") price = parseFloat(cat.rupees) || 0;
      else if (currency === "Dollar") price = parseFloat(cat.dollar) || 0;
      else if (currency === "Euro")   price = parseFloat(cat.euro)   || 0;
    }
    const next = recalc({ ...get().formData, currency, stall_price: price }, exhibitorState);
    set((s) => ({ formData: next, errors: { ...s.errors, currency: false } }));
  },

  resetForm: (companyName) => set({
    formData: { ...EMPTY_FORM, company_name: companyName || "" },
    errors:   {},
    editingIndex: null,
  }),

  /* ============== fetch ============== */

  fetchStallsByCompany: async (companyName) => {
    if (!companyName) return;
    set({ loading: true });
    try {
      const res  = await fetch(`${API}/get_stalls.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      set({ stallList: list });
    } catch {
      toast.error("Failed to load stalls");
    } finally {
      set({ loading: false });
    }
  },

  /* ============== submit (add) ============== */

  submitStall: async (exhibitorState) => {
    const { formData } = get();
    const required = ["hall_number", "stall_number", "stall_category", "stall_area", "currency"];
    const errs = {};
    required.forEach((k) => { if (!String(formData[k] || "").trim()) errs[k] = true; });
    if (Object.keys(errs).length) {
      set({ errors: errs });
      toast.error("Please fill all required fields");
      return false;
    }

    const final = recalc(formData, exhibitorState);
    const stallData = {
      company_name:         final.company_name,
      stall_number:         final.stall_number,
      hall_number:          final.hall_number,
      stall_category:       final.stall_category,
      stall_price:          customRound(final.stall_price),
      currency:             final.currency,
      stall_area:           extractNumber(final.stall_area),
      total:                customRound(final.total),
      discount:             parseFloat(final.discount) || 0,
      discounted_amount:    customRound(final.discounted_amount),
      total_after_discount: customRound(final.total_after_discount),
      sgst9:                customRound(final.sgst9),
      cgst9:                customRound(final.cgst9),
      igst18:               customRound(final.igst18),
      grand_total:          customRound(final.grand_total),
    };

    set({ saving: true });
    try {
      const res = await fetch(`${API}/submit_stalls.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stallData),
      });
      if (!res.ok) { toast.error("Failed to submit stall"); return false; }
      await res.json();
      toast.success("Stall added successfully");

      // Recalculate free badges
      try {
        await fetch(`${API}/update_free_badges.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_name: final.company_name }),
        });
      } catch (e) { console.warn("Free badge update failed:", e); }

      // Refresh stall list + global exhibitor list
      await get().fetchStallsByCompany(final.company_name);
      useExhibitorListStore.getState().fetchExhibitors();

      // Reset form (keep company_name)
      set({
        formData: { ...EMPTY_FORM, company_name: final.company_name },
        errors:   {},
        editingIndex: null,
      });
      return true;
    } catch {
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  /* ============== update (edit) ============== */

  updateStall: async (exhibitorState) => {
    const { formData } = get();
    if (!formData.id) { toast.error("Invalid stall ID"); return false; }
    const final = recalc(formData, exhibitorState);
    const payload = {
      id: Number(final.id),
      company_name:         final.company_name || "",
      stall_number:         final.stall_number || "",
      hall_number:          final.hall_number  || "",
      stall_category:       final.stall_category || "",
      stall_price:          parseFloat(final.stall_price)          || 0,
      currency:             final.currency || "",
      stall_area:           parseFloat(extractNumber(final.stall_area)) || 0,
      total:                parseFloat(final.total)                || 0,
      discount:             parseFloat(final.discount)             || 0,
      discounted_amount:    parseFloat(final.discounted_amount)    || 0,
      total_after_discount: parseFloat(final.total_after_discount) || 0,
      sgst9:                parseFloat(final.sgst9)                || 0,
      cgst9:                parseFloat(final.cgst9)                || 0,
      igst18:               parseFloat(final.igst18)               || 0,
      grand_total:          parseFloat(final.grand_total)          || 0,
    };
    set({ saving: true });
    try {
      const res    = await fetch(`${API}/edit_exhibitor_stall.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && (result.message || result.success)) {
        toast.success(result.message || "Stall updated");
        await get().fetchStallsByCompany(final.company_name);
        set({
          formData: { ...EMPTY_FORM, company_name: final.company_name },
          errors:   {},
          editingIndex: null,
        });
        return true;
      }
      toast.error(result.message || "Failed to update");
      return false;
    } catch {
      toast.error("Server error while updating stall");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  /* ============== delete ============== */

  deleteStall: async (index) => {
    const stall = get().stallList[index];
    if (!stall) { toast.error("Stall not found"); return; }
    if (!window.confirm(`Delete stall number ${stall.stall_number}?`)) return;
    try {
      const res = await fetch(`${API}/delete_exhibitor_stall.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stall_number: stall.stall_number,
          company_name: stall.company_name || get().formData.company_name,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        toast.success(result.message || "Stall deleted");
        set((s) => ({ stallList: s.stallList.filter((_, i) => i !== index) }));
        useExhibitorListStore.getState().fetchExhibitors();
      } else {
        const err = await res.json();
        toast.error("Failed: " + (err.message || ""));
      }
    } catch {
      toast.error("Server error while deleting");
    }
  },

  /* ============== edit (load row into form) ============== */

  editStall: (stall, index, exhibitorState) => {
    const next = recalc({
      ...EMPTY_FORM,
      id:                   stall.id,
      company_name:         stall.company_name      || "",
      stall_number:         stall.stall_number      || "",
      hall_number:          stall.hall_number       || "",
      stall_category:       stall.stall_category    || "",
      stall_area:           stall.stall_area        || "",
      currency:             stall.currency          || "",
      discount:             stall.discount_percent || stall.discount || "",
      stall_price:          parseFloat(stall.stall_price) || 0,
    }, exhibitorState);
    set({ formData: next, editingIndex: index, errors: {} });
  },

  /* ============== send mail ============== */

  sendStallsMail: async (exhibitor) => {
    if (!exhibitor?.email)        { toast.error("Exhibitor email missing"); return; }
    if (!exhibitor?.company_name) { toast.error("Company missing");          return; }
    set({ isSendingMail: true });
    try {
      const res = await fetch(`${API}/send_exhibitor_stall_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: "InOptics 2026 @ Stall Booking Confirmation",
          company_name:  exhibitor.company_name,
          email:         exhibitor.email,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === "success") toast.success("Mail sent successfully");
      else                                           toast.error(data.message || "Mail failed");
    } catch {
      toast.error("Mail failed");
    } finally {
      set({ isSendingMail: false });
    }
  },
}));

export const customRoundHelper = customRound;
