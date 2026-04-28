import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const cleanName = (s) =>
  String(s || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

const EMPTY_FORM = {
  type: "",
  date: "",
  exhibitorBank: "",
  receiverBank: "",
  amount: "",
  tds: "",
};

/* normalizers */
const normalizeStall = (pay) => ({
  type:          pay.payment_type || pay.type || "",
  date:          pay.payment_date || pay.date || "",
  exhibitorBank: pay.name_of_exhibitor_bank || pay.exhibitor_bank_name || pay.exhibitorBank || "",
  receiverBank:  pay.name_of_receiver_bank  || pay.receiver_bank_name  || pay.receiverBank  || "",
  amount:        parseFloat(pay.amount_paid || pay.amount || 0),
  tds:           parseFloat(pay.tds || 0),
});

const normalizeBadgeOrPower = (pay) => ({
  type:          pay.payment_type || pay.type || "",
  date:          pay.payment_date || pay.date || "",
  exhibitorBank: pay.exhibitor_bank_name || pay.exhibitorBank || "",
  receiverBank:  pay.receiver_bank_name  || pay.receiverBank  || "",
  amount:        parseFloat(pay.amount_paid || pay.amount || 0),
  tds:           parseFloat(pay.tds || 0),
});

export const useExhibitorPaymentsStore = create((set, get) => ({
  /* lists */
  stallPayments: [],
  powerPayments: [],
  badgePayments: [],

  /* loading */
  loading: false,

  /* per-type forms + editing index */
  stallForm:  { ...EMPTY_FORM },
  powerForm:  { ...EMPTY_FORM },
  badgeForm:  { ...EMPTY_FORM },
  editingStall: null,
  editingPower: null,
  editingBadge: null,

  /* ============ FETCH ============ */

  fetchAll: async (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({ loading: true });
    await Promise.all([
      get().fetchStall(exhibitor.company_name),
      get().fetchPower(exhibitor.company_name),
      get().fetchBadge(exhibitor.company_name),
    ]);
    set({ loading: false });
  },

  initForCompany: (exhibitor) => {
    set({
      stallPayments: [], powerPayments: [], badgePayments: [],
      stallForm: { ...EMPTY_FORM }, powerForm: { ...EMPTY_FORM }, badgeForm: { ...EMPTY_FORM },
      editingStall: null, editingPower: null, editingBadge: null,
    });
    get().fetchAll(exhibitor);
  },

  fetchStall: async (companyName) => {
    if (!companyName) return;
    try {
      const c   = encodeURIComponent(cleanName(companyName));
      const res = await fetch(`${API}/get_exhibitor_payment.php?company_name=${c}`);
      const d   = await res.json();
      set({ stallPayments: d.success ? (d.records || []).map(normalizeStall) : [] });
    } catch { toast.error("Failed to load stall payments"); }
  },

  fetchPower: async (companyName) => {
    if (!companyName) return;
    try {
      const c   = encodeURIComponent(cleanName(companyName));
      const res = await fetch(`${API}/get_exhibitor_power_payment.php?company_name=${c}`);
      const d   = await res.json();
      set({ powerPayments: d.success ? (d.records || []).map(normalizeBadgeOrPower) : [] });
    } catch { toast.error("Failed to load power payments"); }
  },

  fetchBadge: async (companyName) => {
    if (!companyName) return;
    try {
      const c   = encodeURIComponent(cleanName(companyName));
      const res = await fetch(`${API}/get_exhibitor_badge_payment.php?company_name=${c}`);
      const d   = await res.json();
      set({ badgePayments: d.success ? (d.records || []).map(normalizeBadgeOrPower) : [] });
    } catch { toast.error("Failed to load badge payments"); }
  },

  /* ============ FORM HELPERS ============ */

  setStallField: (k, v) => set((s) => ({ stallForm: { ...s.stallForm, [k]: v } })),
  setPowerField: (k, v) => set((s) => ({ powerForm: { ...s.powerForm, [k]: v } })),
  setBadgeField: (k, v) => set((s) => ({ badgeForm: { ...s.badgeForm, [k]: v } })),

  resetStallForm: () => set({ stallForm: { ...EMPTY_FORM }, editingStall: null }),
  resetPowerForm: () => set({ powerForm: { ...EMPTY_FORM }, editingPower: null }),
  resetBadgeForm: () => set({ badgeForm: { ...EMPTY_FORM }, editingBadge: null }),

  loadStallForEdit: (i) => {
    const p = get().stallPayments[i];
    if (!p) return;
    set({ stallForm: { ...p }, editingStall: i });
  },
  loadPowerForEdit: (i) => {
    const p = get().powerPayments[i];
    if (!p) return;
    set({ powerForm: { ...p }, editingPower: i });
  },
  loadBadgeForEdit: (i) => {
    const p = get().badgePayments[i];
    if (!p) return;
    set({ badgeForm: { ...p }, editingBadge: i });
  },

  /* ============ STALL ============ */

  addStall: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    const f = get().stallForm;
    const payload = {
      type: f.type, date: f.date,
      receiverBank: f.receiverBank, exhibitorBank: f.exhibitorBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/add_exhibitor_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payments: [payload] }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Stall payment added");
        get().resetStallForm();
        get().fetchStall(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  updateStall: async (exhibitor) => {
    const i = get().editingStall;
    if (i === null || !exhibitor?.company_name) return;
    const f = get().stallForm;
    const updated = {
      type: f.type, date: f.date,
      receiverBank: f.receiverBank, exhibitorBank: f.exhibitorBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/update_exhibitor_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: cleanName(exhibitor.company_name),
          payment: { original: get().stallPayments[i], updated },
        }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Stall payment updated");
        get().resetStallForm();
        get().fetchStall(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  deleteStall: async (exhibitor, index) => {
    if (!exhibitor?.company_name) return;
    if (!window.confirm("Delete this payment?")) return;
    const p = get().stallPayments[index];
    try {
      const res = await fetch(`${API}/delete_exhibitor_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payment: p }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Stall payment deleted");
        get().fetchStall(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  /* ============ POWER ============ */

  addPower: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    const f = get().powerForm;
    const payload = {
      type: f.type, date: f.date,
      exhibitor_bank_name: f.exhibitorBank, receiver_bank_name: f.receiverBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/add_exhibitor_power_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payments: [payload] }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Power payment added");
        get().resetPowerForm();
        get().fetchPower(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  updatePower: async (exhibitor) => {
    const i = get().editingPower;
    if (i === null || !exhibitor?.company_name) return;
    const f = get().powerForm;
    const updated = {
      type: f.type, date: f.date,
      exhibitorBank: f.exhibitorBank, receiverBank: f.receiverBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/update_exhibitor_power_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: exhibitor.company_name,
          oldPayment: get().powerPayments[i],
          newPayment: updated,
        }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Power payment updated");
        get().resetPowerForm();
        get().fetchPower(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  deletePower: async (exhibitor, index) => {
    if (!exhibitor?.company_name) return;
    if (!window.confirm("Delete this payment?")) return;
    const p = get().powerPayments[index];
    try {
      const res = await fetch(`${API}/delete_exhibitor_power_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payment: p }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Power payment deleted");
        get().fetchPower(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  /* ============ BADGE ============ */

  addBadge: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    const f = get().badgeForm;
    const payload = {
      type: f.type, date: f.date,
      exhibitor_bank_name: f.exhibitorBank, receiver_bank_name: f.receiverBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/add_exhibitor_badge_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payments: [payload] }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Badge payment added");
        get().resetBadgeForm();
        get().fetchBadge(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  updateBadge: async (exhibitor) => {
    const i = get().editingBadge;
    if (i === null || !exhibitor?.company_name) return;
    const f = get().badgeForm;
    const updated = {
      type: f.type, date: f.date,
      exhibitorBank: f.exhibitorBank, receiverBank: f.receiverBank,
      amount: parseFloat(f.amount) || 0, tds: parseFloat(f.tds) || 0,
    };
    try {
      const res = await fetch(`${API}/update_exhibitor_badge_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: exhibitor.company_name,
          oldPayment: get().badgePayments[i],
          newPayment: updated,
        }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Badge payment updated");
        get().resetBadgeForm();
        get().fetchBadge(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },

  deleteBadge: async (exhibitor, index) => {
    if (!exhibitor?.company_name) return;
    if (!window.confirm("Delete this payment?")) return;
    const p = get().badgePayments[index];
    try {
      const res = await fetch(`${API}/delete_exhibitor_badge_payment.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name, payment: p }),
      });
      const r = await res.json();
      if (r.success) {
        toast.success("Badge payment deleted");
        set((s) => ({ badgePayments: s.badgePayments.filter((_, i) => i !== index) }));
        get().fetchBadge(exhibitor.company_name);
      } else {
        toast.error(r.message || "Failed");
      }
    } catch { toast.error("Server error"); }
  },
}));
