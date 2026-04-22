import { create } from 'zustand';
import toast from 'react-hot-toast';
import { stallCategoriesApi } from '../../api/stallsManagement/stallCategoriesApi';

export const useStallCategoriesStore = create((set, get) => ({
  rows: [], loading: false,

  fetch: async () => {
    set({ loading: true });
    try { const d = await stallCategoriesApi.getAll(); set({ rows: Array.isArray(d) ? d : (d.data ?? []) }); }
    catch { toast.error('Failed to load stall categories'); }
    finally { set({ loading: false }); }
  },

  add: async (data) => {
    const res = await stallCategoriesApi.add(data);
    if (res.success !== false) { toast.success(res.message || 'Added'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  update: async (data) => {
    const res = await stallCategoriesApi.update(data);
    if (res.success !== false) { toast.success(res.message || 'Updated'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  delete: async (id) => {
    const res = await stallCategoriesApi.delete(id);
    toast.success(res.message || 'Deleted'); get().fetch();
  },
}));
