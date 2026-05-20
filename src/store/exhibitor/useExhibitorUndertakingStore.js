import { create } from "zustand";
import toast from "react-hot-toast";

const API = "/api";

export const useExhibitorUndertakingStore = create((set, get) => ({
  declaration: [],          // [{title, text}, ...]
  status: null,             // null = loading, 0 = not accepted, 1 = accepted
  acceptedAt: null,         // raw timestamp string from API (UTC or naive)
  loading: false,
  unlocking: false,

  initForCompany: (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({ status: null });
    get().fetchDeclaration();
    get().fetchStatus(exhibitor.company_name);
  },

  fetchDeclaration: async () => {
    set({ loading: true });
    try {
      const res  = await fetch(`${API}/get_exhibitor_declaration_undertaking.php`);
      const data = await res.json();
      set({ declaration: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error("Fetch declaration error:", err);
      toast.error("Failed to load declaration");
    } finally {
      set({ loading: false });
    }
  },

  fetchStatus: async (companyName) => {
    if (!companyName) return;
    try {
      const res  = await fetch(
        `https://inoptics.in/api/get_undertaking_status.php?company_name=${encodeURIComponent(companyName)}`,
      );
      const data = await res.json();
      console.log("Undertaking rishab status response:", data);
      const row = Array.isArray(data) ? data[0] : data;
      const raw =
        row?.undertaking_accepted ??
        row?.accepted ??
        row?.status ??
        row?.is_accepted ??
        0;
      // DB stores 1 = accepted, 0 = not accepted. Convert any shape (number/string) to that.
      const accepted = String(raw).trim() === "1" || String(raw).toLowerCase() === "true";
      const ts = row?.accepted_at ?? row?.undertaking_accepted_at ?? row?.updated_at ?? row?.created_at ?? null;
      set({ status: accepted ? 1 : 0, acceptedAt: accepted ? ts : null });
    } catch (err) {
      console.error("Fetch undertaking status error:", err);
      set({ status: 0 });
    }
  },

  unlock: async (companyName) => {
    if (!companyName) { toast.error("Company name missing"); return false; }
    set({ unlocking: true });
    try {
      const res  = await fetch(`${API}/unlock_undertaking.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Undertaking unlocked successfully");
        set({ status: 0, acceptedAt: null });
        return true;
      }
      toast.error(json.message || "Failed to unlock");
      return false;
    } catch (err) {
      console.error("Unlock error:", err);
      toast.error("Server error while unlocking");
      return false;
    } finally {
      set({ unlocking: false });
    }
  },
}));
