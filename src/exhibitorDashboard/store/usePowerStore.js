import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchMasterPower,
  fetchExhibitorPower,
  submitExhibitorPower,
  updateExhibitorPower,
  requestPowerUnlock,
  sendPowerAdminMail,
  sendPowerVendorMail,
  sendPowerRevisedMail,
  sendPowerRevisedVendorMail,
} from "../api/powerApi";
import { getExhibitor } from "../api/base";

const calcTotals = (rows, state) => {
  const total = rows.reduce(
    (s, r) => s + (parseFloat(r.total_amount ?? r.totalAmount ?? 0) || 0),
    0
  );
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const sgst = isDelhi ? total * 0.09 : 0;
  const cgst = isDelhi ? total * 0.09 : 0;
  const igst = !isDelhi ? total * 0.18 : 0;
  return {
    totalPrice: total,
    sgst,
    cgst,
    igst,
    grandTotal: total + sgst + cgst + igst,
  };
};

export const usePowerStore = create((set, get) => ({
  masterRates: [],
  powerData: [],
  previewList: [],
  isLocked: false,
  loading: false,
  saving: false,

  // form fields
  formStep: 0, // 0 = setup, 1 = exhibition
  pricePerKw: "",
  powerRequired: "",
  phase: "",

  // edit modal
  showEditPopup: false,
  editRows: [],

  // billing
  totalPrice: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  grandTotal: 0,

  setField: (key, val) => set({ [key]: val }),

  recalcBilling: () => {
    const { powerData, previewList, isLocked } = get();
    const ex = getExhibitor();
    const rows = isLocked
      ? powerData
      : previewList.length > 0
        ? previewList
        : powerData;
    set(calcTotals(rows, ex?.state));
  },

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ loading: true });
    try {
      const [master, exhibitorRes] = await Promise.all([
        fetchMasterPower().catch(() => []),
        fetchExhibitorPower(company).catch(() => null),
      ]);

      const entries = exhibitorRes?.entries || [];
      const isLocked = entries.some((e) => Number(e.is_locked) === 1);

      // pick price for the current step from master data
      const stepType = get().formStep === 0 ? "Setup Days" : "Exhibition Days";
      const match = master.find(
        (m) =>
          (m.power_type || m.type || "").trim() === stepType ||
          master[0]
      );
      const defaultPrice = match?.price ?? match?.price_per_kw ?? master[0]?.price ?? "";

      const previewList = !isLocked
        ? entries.map((e) => ({
            day: e.day,
            pricePerKw: e.price_per_kw,
            powerRequired: e.power_required,
            phase: e.phase,
            totalAmount: e.total_amount,
          }))
        : [];

      set({
        masterRates: master,
        powerData: entries,
        previewList,
        isLocked,
        pricePerKw: defaultPrice,
      });
      get().recalcBilling();
    } finally {
      set({ loading: false });
    }
  },

  changeStep: (step) => {
    const { masterRates } = get();
    const stepType = step === 0 ? "Setup Days" : "Exhibition Days";
    const match = masterRates.find(
      (m) => (m.power_type || m.type || "").trim() === stepType
    );
    set({
      formStep: step,
      pricePerKw: match?.price ?? match?.price_per_kw ?? get().pricePerKw,
      powerRequired: "",
      phase: "",
    });
  },

  addRow: () => {
    const { pricePerKw, powerRequired, phase, formStep, previewList } = get();
    if (!powerRequired || !phase) {
      toast.error("Fill power and phase");
      return false;
    }
    const total = (parseFloat(powerRequired) * parseFloat(pricePerKw || 0)).toFixed(2);
    const newRow = {
      day: formStep === 0 ? "Setup Days" : "Exhibition Days",
      pricePerKw,
      powerRequired,
      phase,
      totalAmount: total,
    };
    set({
      previewList: [...previewList, newRow],
      powerRequired: "",
      phase: "",
    });
    get().recalcBilling();
    return true;
  },

  removePreviewRow: (index) => {
    const list = [...get().previewList];
    list.splice(index, 1);
    set({ previewList: list });
    get().recalcBilling();
  },

  goNext: () => {
    if (!get().addRow()) return;
    set({ formStep: 1 });
    get().changeStep(1);
  },

  goPrevious: () => {
    if (get().formStep > 0) set({ formStep: get().formStep - 1 });
  },

  submit: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const { previewList, totalPrice, cgst, sgst, igst, grandTotal } = get();
    if (previewList.length === 0) {
      toast.error("Add at least one row");
      return false;
    }
    set({ saving: true });
    try {
      const payload = previewList.map((r) => ({
        company_name: company,
        day: r.day,
        price_per_kw: r.pricePerKw,
        power_required: r.powerRequired,
        phase: r.phase,
        total_amount: r.totalAmount,
        total_price: totalPrice.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        grand_total: grandTotal.toFixed(2),
        is_locked: 1,
      }));
      const res = await submitExhibitorPower(payload);
      if (!res) throw new Error("submit failed");
      toast.success("Power requirement submitted");
      sendPowerAdminMail(company).catch(() => null);
      sendPowerVendorMail(company).catch(() => null);
      await get().fetchAll();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Submit failed");
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
      const res = await requestPowerUnlock(company);
      if (res?.message?.includes("✅") || res?.success) {
        toast.success("Unlock request sent to admin");
      } else {
        toast.error("Unlock request failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      set({ saving: false });
    }
  },

  openEdit: () => {
    set({
      showEditPopup: true,
      editRows: get().powerData.map((r) => ({ ...r })),
    });
  },

  closeEdit: () => set({ showEditPopup: false, editRows: [] }),

  setEditRow: (index, key, val) => {
    const rows = [...get().editRows];
    rows[index] = { ...rows[index], [key]: val };
    if (key === "power_required") {
      rows[index].total_amount = Number(val) * Number(rows[index].price_per_kw || 0);
    }
    set({ editRows: rows });
  },

  saveEdit: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const email = ex?.email || "";
    const { editRows } = get();
    set({ saving: true });
    try {
      const res = await updateExhibitorPower(company, editRows);
      if (!res?.success) throw new Error(res?.error || "update failed");
      sendPowerRevisedMail(company, email).catch(() => null);
      sendPowerRevisedVendorMail(company).catch(() => null);
      toast.success("Power updated");
      set({ showEditPopup: false, editRows: [] });
      await get().fetchAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      set({ saving: false });
    }
  },
}));
