import { create } from "zustand";
import toast from "react-hot-toast";
import { proformaApi } from "../../api/master/proformaApi";

export const useProformaStore = create((set, get) => ({
  addresses: [],
  services: [],
  loading: false,

  fetchAddresses: async () => {
    set({ loading: true });
    try {
      const d = await proformaApi.getAddresses();
      set({ addresses: Array.isArray(d) ? d : [] });
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      set({ loading: false });
    }
  },

  saveAddress: async (data) => {
    try {
      const res = await proformaApi.saveAddress(data);
      if (res.success !== false) {
        toast.success(res.message || "Address saved");
        get().fetchAddresses();
        return true;
      }
      toast.error(res.message || "Failed");
      return false;
    } catch {
      toast.error("Server error");
      return false;
    }
  },

  deleteAddress: async (label) => {
    try {
      const res = await proformaApi.deleteAddress(label);
      toast.success(res.message || "Deleted");
      get().fetchAddresses();
    } catch {
      toast.error("Error deleting");
    }
  },

  setActiveAddress: async (id) => {
    try {
      await proformaApi.setActiveAddress(id);
      get().fetchAddresses();
    } catch {
      toast.error("Error setting active");
    }
  },

  fetchServices: async () => {
    try {
      const d = await proformaApi.getServices();
      set({ services: Array.isArray(d) ? d : [] });
    } catch {
      toast.error("Failed to load services");
    }
  },

  addService: async (data) => {
    try {
      const res = await proformaApi.addService(data);
      if (res.success !== false) {
        toast.success(res.message || "Service added");
        get().fetchServices();
        return true;
      }
      toast.error(res.message || "Failed");
      return false;
    } catch {
      toast.error("Server error");
      return false;
    }
  },

  updateService: async (data) => {
    try {
      const res = await proformaApi.updateService(data);
      if (res.success !== false) {
        toast.success(res.message || "Updated");
        get().fetchServices();
        return true;
      }
      toast.error(res.message || "Failed");
      return false;
    } catch {
      toast.error("Server error");
      return false;
    }
  },

  deleteService: async (name) => {
    try {
      const res = await proformaApi.deleteService(name);
      toast.success(res.message || "Deleted");
      get().fetchServices();
    } catch {
      toast.error("Error deleting");
    }
  },
}));
