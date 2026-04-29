import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const EMPTY = {
  website: "",
  products: [],
  home_brands: "",
  distributors: "",
  international_brands: "",
};

export const useExhibitorBrandsStore = create((set, get) => ({
  data: { ...EMPTY },
  isEdit: false,        // true when record exists on server (Submit → Update mode)
  loading: false,
  saving: false,

  /* ============ fetch ============ */

  initForCompany: (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({ data: { ...EMPTY }, isEdit: false });
    get().fetchBrands(exhibitor);
  },

  fetchBrands: async (exhibitor) => {
    if (!exhibitor?.company_name) return;
    set({ loading: true });
    try {
      const res  = await fetch(
        `${API}/get_exhibitor_brands.php?Company_name=${encodeURIComponent(exhibitor.company_name)}`,
      );
      const data = await res.json();
      if (data.status === "success") {
        set({
          data: {
            website:              data.Website || "",
            products:             data.Products ? data.Products.split(",").map((p) => p.trim()).filter(Boolean) : [],
            home_brands:          data.Home_brands || "",
            distributors:         data.Distributors || "",
            international_brands: data.International_brands || "",
          },
          isEdit: true,
        });
      } else {
        set({ data: { ...EMPTY }, isEdit: false });
      }
    } catch (err) {
      console.error("Fetch Brands Error:", err);
      toast.error("Failed to load brands");
    } finally {
      set({ loading: false });
    }
  },

  /* ============ form helpers ============ */

  setField: (k, v) => set((s) => ({ data: { ...s.data, [k]: v } })),

  addProduct: (name) => {
    if (!name) return;
    const cur = get().data.products;
    if (cur.includes(name)) return;
    set((s) => ({ data: { ...s.data, products: [...s.data.products, name] } }));
  },

  removeProduct: (name) =>
    set((s) => ({ data: { ...s.data, products: s.data.products.filter((p) => p !== name) } })),

  /* ============ submit / update ============ */

  submit: async (exhibitor) => {
    if (!exhibitor?.company_name) { toast.error("Company missing"); return false; }
    const { data, isEdit } = get();
    const payload = {
      Company_name:         exhibitor.company_name,
      website:              data.website,
      products:             (data.products || []).join(","),
      home_brands:          data.home_brands,
      distributors:         data.distributors,
      international_brands: data.international_brands,
    };
    set({ saving: true });
    try {
      const url  = isEdit ? `${API}/update_exhibitor_brands.php` : `${API}/add_exhibitor_brands.php`;
      const res  = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(isEdit ? "Brands updated successfully" : "Brands submitted successfully");
        set({ isEdit: true });
        return true;
      }
      if (json.status === "exists") {
        toast("Record exists. Switching to update mode.");
        set({ isEdit: true });
        return false;
      }
      toast.error(json.message || "Failed");
      return false;
    } catch (err) {
      console.error("Submit Brands Error:", err);
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },
}));
