import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const EMPTY_BILLING = { totalPrice: 0, cgst: 0, sgst: 0, igst: 0, grandTotal: 0 };

const recalcBilling = (previewList, exState) => {
  const total   = previewList.reduce((s, r) => s + (parseFloat(r.totalAmount) || 0), 0);
  const isDelhi = (exState || "").toLowerCase() === "delhi";
  const cgst    = isDelhi ? total * 0.09 : 0;
  const sgst    = isDelhi ? total * 0.09 : 0;
  const igst    = isDelhi ? 0 : total * 0.18;
  return { totalPrice: total, cgst, sgst, igst, grandTotal: total + cgst + sgst + igst };
};

/* helpers to read price for a given type from master data */
const priceFor = (powerData, type) => {
  const m = powerData.find((i) => i.power_type?.trim() === type);
  return m ? String(m.price ?? "") : "";
};

const buildEmptyForms = (powerData) => {
  const out = {};
  [...new Set(powerData.map((i) => i.power_type?.trim()).filter(Boolean))]
    .forEach((t) => { out[t] = { powerRequired: "", phase: "", totalAmount: "" }; });
  return out;
};

export const useExhibitorPowerStore = create((set, get) => ({
  /* per-section form state — keyed by power_type */
  forms: {},

  /* list + billing */
  previewList: [],
  ...EMPTY_BILLING,

  /* lock state + flags */
  isLocked:        false,
  unlockRequested: false,
  loading:         false,
  saving:          false,
  isSendingMail:   false,
  hasExistingData: false,

  /* ============== fetchers ============== */

  initForCompany: (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({
      forms: {},
      previewList: [], ...EMPTY_BILLING,
      isLocked: false, unlockRequested: false, hasExistingData: false,
    });
    get().fetchPowerData(exhibitor);
  },

  initFormsFromTypes: (powerData) => {
    const current = get().forms || {};
    const next    = buildEmptyForms(powerData);
    // preserve any in-progress field values that the user already typed
    Object.keys(current).forEach((k) => {
      if (next[k]) next[k] = { ...next[k], ...current[k] };
    });
    set({ forms: next });
  },

  fetchPowerData: async (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({ loading: true });
    try {
      const res    = await fetch(
        `${API}/get_Exhibitor_power_requirement.php?company_name=${encodeURIComponent(exhibitor.company_name)}`,
      );
      const result = await res.json();
      if (res.ok && Array.isArray(result.entries) && result.entries.length) {
        const list = result.entries.map((it) => ({
          day: it.day,
          pricePerKw: it.price_per_kw,
          powerRequired: it.power_required,
          phase: it.phase,
          totalAmount: it.total_amount,
        }));
        const first = result.entries[0];
        set({
          previewList:     list,
          totalPrice:      parseFloat(first.total_price || 0),
          cgst:            parseFloat(first.cgst        || 0),
          sgst:            parseFloat(first.sgst        || 0),
          igst:            parseFloat(first.igst        || 0),
          grandTotal:      parseFloat(first.grand_total || 0),
          isLocked:        first.is_locked == 1,
          unlockRequested: first.unlock_requested == 1,
          hasExistingData: true,
        });
      } else {
        set({ previewList: [], ...EMPTY_BILLING, isLocked: false, unlockRequested: false, hasExistingData: false });
      }
    } catch {
      toast.error("Failed to fetch power data");
    } finally {
      set({ loading: false });
    }
  },

  /* ============== form mgmt ============== */

  setFormField: (type, field, value, powerData) => {
    const cur   = get().forms[type] || { powerRequired: "", phase: "", totalAmount: "" };
    const next  = { ...cur, [field]: value };
    const price = priceFor(powerData, type);
    if (next.powerRequired && price) {
      next.totalAmount = (parseFloat(next.powerRequired) * parseFloat(price)).toFixed(2);
    } else {
      next.totalAmount = "";
    }
    set((s) => ({ forms: { ...s.forms, [type]: next } }));
  },

  resetForms: (powerData) => set({ forms: buildEmptyForms(powerData) }),

  /* Add all filled sections to the list */
  addAllToList: (powerData, exState) => {
    const { forms } = get();
    const filled = Object.entries(forms).filter(
      ([, f]) => f.powerRequired && f.phase,
    );
    if (!filled.length) {
      toast.error("Fill at least one section (Power + Phase)");
      return;
    }
    const newRows = filled.map(([type, f]) => {
      const price = priceFor(powerData, type);
      const total = (parseFloat(f.powerRequired) * parseFloat(price || 0)).toFixed(2);
      return {
        day: type,
        pricePerKw: price,
        powerRequired: f.powerRequired,
        phase: f.phase,
        totalAmount: total,
      };
    });
    const newList = [...get().previewList, ...newRows];
    set({
      previewList: newList,
      ...recalcBilling(newList, exState),
      forms: buildEmptyForms(powerData),
    });
    toast.success(`${newRows.length} entr${newRows.length === 1 ? "y" : "ies"} added`);
  },

  /* ============== submit ============== */

  submit: async (exhibitor) => {
    const { previewList, totalPrice, cgst, sgst, igst, grandTotal } = get();
    if (!previewList.length) { toast.error("Add at least one entry"); return false; }
    set({ saving: true });
    try {
      const payload = previewList.map((it) => ({
        company_name:   exhibitor.company_name,
        day:            it.day,
        price_per_kw:   it.pricePerKw,
        power_required: it.powerRequired,
        phase:          it.phase,
        total_amount:   it.totalAmount,
        total_price:    totalPrice.toFixed(2),
        cgst:           cgst.toFixed(2),
        sgst:           sgst.toFixed(2),
        igst:           igst.toFixed(2),
        grand_total:    grandTotal.toFixed(2),
      }));
      const res = await fetch(`${API}/add_Exhibitor_power_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Power data submitted successfully");
        await get().fetchPowerData(exhibitor);
        return true;
      }
      toast.error("Submission failed: " + (result.error || ""));
      return false;
    } catch {
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  /* ============== delete row ============== */

  removeRow: async (item, exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    if (!window.confirm(`Remove ${item.day} entry?`)) return;
    try {
      const payload = {
        company_name:   exhibitor.company_name,
        price_per_kw:   parseFloat(item.pricePerKw),
        power_required: parseFloat(item.powerRequired),
        phase:          item.phase,
        total_amount:   parseFloat(item.totalAmount),
      };
      const res    = await fetch(`${API}/delete_Exhibitor_power_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Removed");
        const list = get().previewList.filter((e) => e !== item);
        set({ previewList: list, ...recalcBilling(list, exhibitor.state) });
      } else {
        toast.error("Delete failed: " + (result.error || ""));
      }
    } catch {
      toast.error("Error deleting");
    }
  },

  /* ============== unlock ============== */

  unlockPower: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    try {
      const res  = await fetch(`${API}/update_unlock_power_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: exhibitor.company_name }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Power Requirement unlocked");
        set({ isLocked: false, unlockRequested: false });
        try {
          await fetch(`${API}/send_power_unlocked_mail.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name:  exhibitor.company_name,
              template_name: "InOptics 2026 @ Successfully Unlocked Power Requirement",
            }),
          });
        } catch (e) { console.warn("Unlock mail failed:", e); }
        get().fetchPowerData(exhibitor);
      } else {
        toast.error(data.message || "Failed to unlock");
      }
    } catch {
      toast.error("Server error while unlocking");
    }
  },

  /* ============== mails ============== */

  sendUpdatePowerMail: async (exhibitor) => {
    if (!exhibitor?.company_name || !exhibitor?.email) { toast.error("Company/email missing"); return; }
    set({ isSendingMail: true });
    try {
      await toast.promise(
        (async () => {
          await fetch(`${API}/send_power_revised_mail.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name:  exhibitor.company_name,
              template_name: "POWER LOAD INCREASED",
              email:         exhibitor.email,
            }),
          });
          await fetch(`${API}/send_power_vendor_mail.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              template_name: "Revised Power Load Vendor",
              company_name:  exhibitor.company_name,
            }),
          });
        })(),
        {
          loading: "Sending update mail...",
          success: "Updated power mail sent successfully",
          error:   "Failed to send mail",
        },
      );
    } finally {
      set({ isSendingMail: false });
    }
  },

  sendPowerMail: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return; }
    set({ isSendingMail: true });
    try {
      await toast.promise(
        (async () => {
          await fetch(`${API}/send_power_mail_to_admin.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              template_name: "InOptics 2026 @ Exhibitor Power Requirement Confirmation",
              company_name:  exhibitor.company_name,
            }),
          });
          await fetch(`${API}/send_power_mail_to_vendor.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name:  exhibitor.company_name,
              template_name: "Power Requirement by Exhibitor",
            }),
          });
        })(),
        {
          loading: "Sending mail...",
          success: "Mail sent successfully",
          error:   "Failed to send mail",
        },
      );
    } finally {
      set({ isSendingMail: false });
    }
  },
}));
