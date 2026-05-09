import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchContractorBadge,
  fetchSelectedContractor,
  addContractorBadge,
  updateContractorBadge,
  requestUnlockBadge,
  sendUnlockMail,
} from "../api/contractorBadgeApi";
import { getExhibitor } from "../api/base";

export const useContractorBadgeStore = create((set, get) => ({
  contractorCompany: "",
  contractorName: "",
  quantity: "",
  isSubmitted: false,
  lockStatus: 0,         // 0 = unlocked / not submitted, 1 = locked, 2 = unlock requested
  loading: false,
  saving: false,

  setQuantity: (v) => set({ quantity: v }),

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ loading: true });
    try {
      const [contractor, badge] = await Promise.all([
        fetchSelectedContractor(company).catch(() => null),
        fetchContractorBadge(company).catch(() => ({ success: false })),
      ]);

      set({
        contractorCompany: contractor?.contractor_company_name || "",
        contractorName: contractor?.contractor_name || "",
      });

      if (!badge?.success) {
        set({
          quantity: "",
          isSubmitted: false,
          lockStatus: 0,
        });
        return;
      }
      const data = badge.data || badge;
      const status = Number(data.is_locked ?? 0);
      const unlockReq = Number(data.unlock_requested ?? 0);
      set({
        quantity: data.badge_quantity || "",
        isSubmitted: true,
        lockStatus: unlockReq === 1 ? 2 : status,
      });
    } finally {
      set({ loading: false });
    }
  },

  submit: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const { quantity, contractorCompany, isSubmitted } = get();
    if (!company) { toast.error("Company missing"); return false; }
    if (!quantity) { toast.error("Please enter badge quantity"); return false; }

    set({ saving: true });
    try {
      const payload = {
        exhibitor_company_name: company,
        contractor_company_name: contractorCompany,
        badge_quantity: Number(quantity),
      };
      const fn = isSubmitted ? updateContractorBadge : addContractorBadge;
      const res = await fn(payload);
      if (res?.success) {
        toast.success(isSubmitted ? "Badge updated & locked" : "Badge submitted & locked");
        await get().fetchAll();
        return true;
      }
      toast.error(res?.message || "Operation failed");
      return false;
    } catch (err) {
      console.error(err);
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  requestUnlock: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    const email = ex?.email || "";
    if (!company) { toast.error("Company missing"); return; }
    set({ saving: true });
    try {
      const res = await requestUnlockBadge(company);
      if (!res?.success) {
        toast.error("Unlock request failed");
        return;
      }
      await sendUnlockMail(company, email).catch(() => null);
      toast.success("Unlock request sent to admin");
      set({ lockStatus: 2 });
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      set({ saving: false });
    }
  },
}));
