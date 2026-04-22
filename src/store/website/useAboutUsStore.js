import { create } from 'zustand';
import {
  getAboutUs, addAboutUs, updateAboutUs, deleteAboutUs,
  getOurVision, addOurVision, updateOurVision, deleteOurVision,
} from '../../api/website/aboutUsApi';
import toast from 'react-hot-toast';

export const useAboutUsStore = create((set, get) => ({
  aboutRows: [],
  visionRows: [],
  loadingAbout: false,
  loadingVision: false,

  fetchAbout: async () => {
    set({ loadingAbout: true });
    try {
      const data = await getAboutUs();
      set({ aboutRows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load about us');
    } finally {
      set({ loadingAbout: false });
    }
  },

  addAbout: async (fd) => {
    const res = await addAboutUs(fd);
    toast.success(res.message || 'Added');
    get().fetchAbout();
    return res;
  },

  updateAbout: async (fd) => {
    const res = await updateAboutUs(fd);
    toast.success(res.message || 'Updated');
    get().fetchAbout();
    return res;
  },

  deleteAbout: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteAboutUs(id);
    toast.success(res.message || 'Deleted');
    get().fetchAbout();
  },

  fetchVision: async () => {
    set({ loadingVision: true });
    try {
      const data = await getOurVision();
      set({ visionRows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load vision');
    } finally {
      set({ loadingVision: false });
    }
  },

  addVision: async (data) => {
    const res = await addOurVision(data);
    toast.success(res.message || 'Added');
    get().fetchVision();
    return res;
  },

  updateVision: async (data) => {
    const res = await updateOurVision(data);
    toast.success(res.message || 'Updated');
    get().fetchVision();
    return res;
  },

  deleteVision: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteOurVision(id);
    toast.success(res.message || 'Deleted');
    get().fetchVision();
  },
}));
