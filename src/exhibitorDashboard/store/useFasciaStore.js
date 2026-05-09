import { create } from "zustand";
import toast from "react-hot-toast";
import { fetchFascia, submitFascia } from "../api/fasciaApi";
import { fetchStalls } from "../api/profileApi";
import { getExhibitor } from "../api/base";

export const useFasciaStore = create((set, get) => ({
  existingData: null,
  stallList: [],
  loading: false,
  saving: false,

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ loading: true });
    try {
      const [fascia, stalls] = await Promise.all([
        fetchFascia(company).catch(() => null),
        fetchStalls().catch(() => []),
      ]);
      const valid =
        fascia && (fascia.facia_company_name || fascia.exhibitor_company_name)
          ? fascia
          : null;
      set({ existingData: valid, stallList: stalls });
    } finally {
      set({ loading: false });
    }
  },

  submit: async (faciaName) => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const city = ex?.city || "";
    const stallList = get().stallList;
    const stallDisplay = Array.isArray(stallList)
      ? stallList.map((s) => s.stall_number).filter(Boolean).join(", ")
      : "";

    if (!company) { toast.error("Company missing"); return false; }
    if (!faciaName.trim()) { toast.error("Fascia name required"); return false; }

    set({ saving: true });
    try {
      const res = await submitFascia({
        exhibitor_company_name: company,
        facia_company_name: faciaName.toUpperCase(),
        stall_no: stallDisplay,
        city,
      });
      if (res?.success) {
        toast.success("Fascia submitted");
        await get().fetchAll();
        return true;
      }
      toast.error(res?.error || "Submission failed");
      return false;
    } catch (err) {
      console.error(err);
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },
}));
