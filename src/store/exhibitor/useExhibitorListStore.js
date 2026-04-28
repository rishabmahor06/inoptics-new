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
}));
