import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchBadgesByCompany,
  fetchBadgeCounts,
  fetchUnlockApproved,
  submitBadge,
  editBadge,
  deleteBadge,
  lockAllBadges,
  lockSingleBadge,
  requestBadgeUnlock,
  sendBadgeUnlockMail,
  sendExtraBadgesMail,
} from "../api/exhibitorBadgeApi";
import { fetchStalls } from "../api/profileApi";
import { getExhibitor } from "../api/base";

const RATE_PER_BADGE = 100;

const calcBilling = (badges, freeBadges, state) => {
  const sorted = [...badges].sort(
    (a, b) => (a.badge_series_num || 0) - (b.badge_series_num || 0)
  );
  let total = 0;
  let paidCount = 0;
  sorted.forEach((_, i) => {
    if (i >= freeBadges) {
      total += RATE_PER_BADGE;
      paidCount++;
    }
  });
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const cgst = isDelhi ? total * 0.09 : 0;
  const sgst = isDelhi ? total * 0.09 : 0;
  const igst = !isDelhi ? total * 0.18 : 0;
  return {
    paidCount,
    rate: RATE_PER_BADGE,
    subtotal: total,
    cgst,
    sgst,
    igst,
    grandTotal: total + cgst + sgst + igst,
    isDelhi,
  };
};

export const useExhibitorBadgeStore = create((set, get) => ({
  badges: [],
  freeBadges: 0,
  freeRemaining: 0,
  extraPaidBadges: 0,
  stallList: [],
  unlockApprovedMap: {},
  loading: false,
  saving: false,
  billing: { paidCount: 0, rate: 100, subtotal: 0, cgst: 0, sgst: 0, igst: 0, grandTotal: 0, isDelhi: false },

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ loading: true });
    try {
      const [badgesRes, countRes, stalls] = await Promise.all([
        fetchBadgesByCompany(company).catch(() => ({ success: false })),
        fetchBadgeCounts(company).catch(() => ({ success: false })),
        fetchStalls().catch(() => []),
      ]);

      const badges = badgesRes?.badges || [];
      const freeBadges = Number(countRes?.free_badges) || 0;
      const freeRemaining = Number(countRes?.free_remaining) || 0;
      const extraPaidBadges = Number(countRes?.extra_badges) || 0;

      set({
        badges,
        freeBadges,
        freeRemaining,
        extraPaidBadges,
        stallList: stalls,
        billing: calcBilling(badges, freeBadges, ex?.state),
      });

      badges.forEach((b) => get().refreshUnlockStatus(b.id));
    } finally {
      set({ loading: false });
    }
  },

  refreshUnlockStatus: async (badgeId) => {
    try {
      const res = await fetchUnlockApproved(badgeId);
      if (res?.success) {
        set((s) => ({
          unlockApprovedMap: {
            ...s.unlockApprovedMap,
            [badgeId]: Number(res.unlock_approved),
          },
        }));
      }
    } catch {
      // silent
    }
  },

  createBadge: async ({ name, photo }) => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) {
      toast.error("Company missing");
      return false;
    }
    if (!name?.trim()) {
      toast.error("Please enter candidate name");
      return false;
    }
    const firstStall = get().stallList?.[0] || {};
    const stallNo = firstStall.stall_no || firstStall.stall_number || "";
    set({ saving: true });
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (photo instanceof File) fd.append("candidate_photo", photo);
      fd.append("company_name", company);
      fd.append("stall_no", stallNo);
      fd.append("state", ex?.state || "");
      fd.append("city", ex?.city || "");
      fd.append("exhibitor_id", ex?.id || "");

      const res = await submitBadge(fd);
      if (!res?.success) throw new Error(res?.message || "Failed to create");
      toast.success("Badge created");
      await get().fetchAll();
      return true;
    } catch (err) {
      toast.error(err.message || "Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  updateBadge: async (badge) => {
    set({ saving: true });
    try {
      const fd = new FormData();
      fd.append("id", badge.id);
      fd.append("name", badge.name);
      fd.append("stall_no", badge.stall_no || "");
      fd.append("state", badge.state || "");
      fd.append("city", badge.city || "");
      if (badge.candidate_photo instanceof File) {
        fd.append("candidate_photo", badge.candidate_photo);
      }
      const res = await editBadge(fd);
      if (!res?.success) throw new Error(res?.message || "Update failed");
      toast.success("Badge updated");
      await get().fetchAll();
      return true;
    } catch (err) {
      toast.error(err.message || "Update failed");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  removeBadge: async (id) => {
    try {
      const res = await deleteBadge(id);
      if (!res?.success) {
        toast.error(res?.message || "Delete failed");
        return;
      }
      toast.success("Deleted");
      await get().fetchAll();
    } catch {
      toast.error("Server error");
    }
  },

  submitAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    if (!company) return;
    set({ saving: true });
    try {
      const res = await lockAllBadges(company);
      if (!res?.success) throw new Error(res?.message || "Lock failed");
      if (get().extraPaidBadges > 0) {
        sendExtraBadgesMail(company).catch(() => null);
      }
      toast.success("All badges submitted & locked");
      await get().fetchAll();
    } catch (err) {
      toast.error(err.message || "Error locking");
    } finally {
      set({ saving: false });
    }
  },

  requestUnlock: async (badge) => {
    if (!badge?.id) return;
    if (badge.badge_lock === 2) {
      toast.error("Unlock request already sent");
      return;
    }
    if (badge.badge_lock === 0) {
      toast("Already unlocked");
      return;
    }
    try {
      const res = await requestBadgeUnlock(badge.id);
      if (!res?.success) {
        toast.error(res?.message || "Failed");
        return;
      }
      const ex = getExhibitor();
      sendBadgeUnlockMail(ex?.company_name || "").catch(() => null);
      toast.success(`Unlock request sent for ${badge.name}`);
      set((s) => ({
        badges: s.badges.map((b) =>
          b.id === badge.id ? { ...b, badge_lock: 2 } : b
        ),
      }));
    } catch {
      toast.error("Server error");
    }
  },

  relockAfterUpdate: async (badgeId) => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    try {
      const res = await lockSingleBadge(badgeId, company);
      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success("Badge locked");
      set((s) => ({
        badges: s.badges.map((b) =>
          b.id === badgeId ? { ...b, badge_lock: 1 } : b
        ),
        unlockApprovedMap: { ...s.unlockApprovedMap, [badgeId]: 0 },
      }));
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  },
}));
