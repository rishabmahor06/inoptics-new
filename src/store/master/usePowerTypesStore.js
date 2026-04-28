import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const post = (ep, body) =>
  fetch(`${API}/${ep}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const usePowerTypesStore = create((set, get) => ({
  rows: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res  = await fetch(`${API}/get_power_requirement.php`);
      const data = await res.json();
      set({ rows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error("Failed to load power requirements");
    } finally {
      set({ loading: false });
    }
  },

  add: async (data) => {
    try {
      const res = await post("add_power_requirement.php", data);
      toast.success(res.message || "Power type added");
      get().fetch();
      return true;
    } catch {
      toast.error("Error adding");
      return false;
    }
  },

  update: async (data) => {
    try {
      const res = await post("update_power_requirement.php", data);
      toast.success(res.message || "Power type updated");
      get().fetch();
      return true;
    } catch {
      toast.error("Error updating");
      return false;
    }
  },

  delete: async (id) => {
    try {
      const res = await post("delete_power_requirement.php", { id });
      toast.success(res.message || "Deleted");
      get().fetch();
    } catch {
      toast.error("Error deleting");
    }
  },
}));
