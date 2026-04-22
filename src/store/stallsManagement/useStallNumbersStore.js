import { create } from 'zustand';
import toast from 'react-hot-toast';
import { stallNumbersApi } from '../../api/stallsManagement/stallNumbersApi';

export const useStallNumbersStore = create((set, get) => ({
  rows: [], loading: false,

  fetch: async () => {
    set({ loading: true });
    try { const d = await stallNumbersApi.getAll(); set({ rows: Array.isArray(d) ? d : (d.data ?? []) }); }
    catch { toast.error('Failed to load stall numbers'); }
    finally { set({ loading: false }); }
  },

  add: async (data) => {
    const res = await stallNumbersApi.add(data);
    if (res.success !== false) { toast.success(res.message || 'Added'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  update: async (data) => {
    const res = await stallNumbersApi.update(data);
    if (res.success !== false) { toast.success(res.message || 'Updated'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  delete: async (id) => {
    const res = await stallNumbersApi.delete(id);
    toast.success(res.message || 'Deleted'); get().fetch();
  },
}));
