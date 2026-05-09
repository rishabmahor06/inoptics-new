import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchExhibitors,
  fetchStalls,
  fetchProducts,
  fetchBrands,
  saveBrands,
} from "../api/profileApi";
import { getExhibitor } from "../api/base";

const parseProducts = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const emptyBrands = {
  website: "",
  products: [],
  home_brands: "",
  distributors: "",
  international_brands: "",
};

export const useProfileStore = create((set, get) => ({
  exhibitors: [],
  stallList: [],
  products: [],
  brandsData: { ...emptyBrands },
  hasBrandsData: false,
  loading: false,
  saving: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const ex = getExhibitor();
      const company = ex?.company_name || "";
      const [exs, stalls, prods, brands] = await Promise.all([
        fetchExhibitors().catch(() => []),
        fetchStalls().catch(() => []),
        fetchProducts().catch(() => []),
        company ? fetchBrands(company).catch(() => null) : Promise.resolve(null),
      ]);
      set({
        exhibitors: exs,
        stallList: stalls,
        products: prods,
      });
      if (brands && (brands.website || brands.products || brands.home_brands)) {
        set({
          brandsData: {
            website: brands.website || "",
            products: parseProducts(brands.products),
            home_brands: brands.home_brands || "",
            distributors: brands.distributors || "",
            international_brands: brands.international_brands || "",
          },
          hasBrandsData: true,
        });
      } else {
        set({ brandsData: { ...emptyBrands }, hasBrandsData: false });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      set({ loading: false });
    }
  },

  setBrandsData: (updater) =>
    set((state) => ({
      brandsData:
        typeof updater === "function" ? updater(state.brandsData) : updater,
    })),

  submitBrands: async () => {
    const { brandsData, hasBrandsData } = get();
    const ex = getExhibitor();
    const companyName = ex?.company_name || "";
    if (!companyName) {
      toast.error("Company name missing");
      return false;
    }
    set({ saving: true });
    try {
      const payload = {
        company_name: companyName,
        website: brandsData.website || "",
        products: JSON.stringify(brandsData.products || []),
        home_brands: brandsData.home_brands || "",
        distributors: brandsData.distributors || "",
        international_brands: brandsData.international_brands || "",
      };
      const res = await saveBrands(payload, hasBrandsData);
      const ok =
        res?.status === "success" ||
        res?.success === true ||
        res?.status === true ||
        res?.message?.toLowerCase?.().includes("success");
      if (!ok && res?.error) throw new Error(res.error);
      toast.success(hasBrandsData ? "Brands updated" : "Brands saved");
      set({ hasBrandsData: true });
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
      return false;
    } finally {
      set({ saving: false });
    }
  },
}));
