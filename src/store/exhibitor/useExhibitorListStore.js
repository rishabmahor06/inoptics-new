import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

export const useExhibitorListStore = create((set, get) => ({
  rawData: [],
  loading: false,
  error: null,

  fetchExhibitors: async () => {
    set({ loading: true, error: null });
    try {
      const res  = await fetch(`${API}/get_exhibitors.php`);
      const data = await res.json();
      set({ rawData: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error("Failed to load exhibitors");
    }
  },

  deleteExhibitor: async (companyName) => {
    const name = String(companyName || "").trim();
    if (!name) { toast.error("Company name missing"); return false; }
    try {
      const res = await fetch(`${API}/delete_company_details_everywhere.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Exhibitor deleted");
        set((s) => ({
          rawData: s.rawData.filter(
            (r) => String(r.company_name || "").trim() !== name,
          ),
        }));
        return true;
      }
      toast.error(data?.message || "Failed to delete exhibitor");
      return false;
    } catch (err) {
      console.error("Delete exhibitor error:", err);
      toast.error("Server error while deleting");
      return false;
    }
  },
}));
