import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const post = (ep, body) =>
  fetch(`${API}/${ep}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const useProductsStore = create((set, get) => ({
  rows: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res  = await fetch(`${API}/get_product.php`);
      const data = await res.json();
      set({ rows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error("Failed to load products");
    } finally {
      set({ loading: false });
    }
  },

  add: async (name) => {
    try {
      const res = await post("add_product.php", { name });
      toast.success(res.message || "Product added");
      get().fetch();
      return true;
    } catch { toast.error("Error adding"); return false; }
  },

  update: async (id, name) => {
    try {
      const res = await post("update_product.php", { id, name });
      toast.success(res.message || "Product updated");
      get().fetch();
      return true;
    } catch { toast.error("Error updating"); return false; }
  },

  delete: async (id) => {
    try {
      const res = await post("delete_product.php", { id });
      toast.success(res.message || "Deleted");
      get().fetch();
    } catch { toast.error("Error deleting"); }
  },
}));
