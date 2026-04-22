import { create } from 'zustand';
import toast from 'react-hot-toast';
import { stallAreasApi } from '../../api/stallsManagement/stallAreasApi';

export const useStallAreasStore = create((set, get) => ({
  rows: [], loading: false,

  fetch: async () => {
    set({ loading: true });
    try { const d = await stallAreasApi.getAll(); set({ rows: Array.isArray(d) ? d : (d.data ?? []) }); }
    catch { toast.error('Failed to load stall areas'); }
    finally { set({ loading: false }); }
  },

  add: async (data) => {
    const res = await stallAreasApi.add(data);
    if (res.success !== false) { toast.success(res.message || 'Added'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  update: async (data) => {
    const res = await stallAreasApi.update(data);
    if (res.success !== false) { toast.success(res.message || 'Updated'); get().fetch(); return true; }
    toast.error(res.message || 'Failed'); return false;
  },

  delete: async (id) => {
    const res = await stallAreasApi.delete(id);
    toast.success(res.message || 'Deleted'); get().fetch();
  },
}));
