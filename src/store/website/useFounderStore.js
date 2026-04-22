import { create } from 'zustand';
import { getFounders, addFounder, updateFounder, deleteFounder } from '../../api/website/founderApi';
import toast from 'react-hot-toast';

export const useFounderStore = create((set, get) => ({
  founders: [],
  loading: false,

  fetchFounders: async () => {
    set({ loading: true });
    try {
      const data = await getFounders();
      set({ founders: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load founder section');
    } finally {
      set({ loading: false });
    }
  },

  addFounder: async (fd) => {
    const res = await addFounder(fd);
    toast.success(res.message || 'Added');
    get().fetchFounders();
    return res;
  },

  updateFounder: async (fd) => {
    const res = await updateFounder(fd);
    toast.success(res.message || 'Updated');
    get().fetchFounders();
    return res;
  },

  deleteFounder: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteFounder(id);
    toast.success(res.message || 'Deleted');
    get().fetchFounders();
  },
}));
