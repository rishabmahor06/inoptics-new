import { create } from 'zustand';
import { getFooter, addFooter, updateFooter, deleteFooter } from '../../api/website/footerApi';
import toast from 'react-hot-toast';

export const useFooterStore = create((set, get) => ({
  footer1: [], footer2: [], footer3: [], footer4: [],
  loading1: false, loading2: false, loading3: false, loading4: false,

  fetchFooter: async (n) => {
    set({ [`loading${n}`]: true });
    try {
      const data = await getFooter(n);
      set({ [`footer${n}`]: Array.isArray(data) ? data : [] });
    } catch {
      toast.error(`Failed to load footer ${n}`);
    } finally {
      set({ [`loading${n}`]: false });
    }
  },

  addFooterItem: async (n, fd) => {
    const res = await addFooter(n, fd);
    toast.success(res.message || 'Added');
    get().fetchFooter(n);
    return res;
  },

  updateFooterItem: async (n, fd) => {
    const res = await updateFooter(n, fd);
    toast.success(res.message || 'Updated');
    get().fetchFooter(n);
    return res;
  },

  deleteFooterItem: async (n, id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteFooter(n, id);
    toast.success(res.message || 'Deleted');
    get().fetchFooter(n);
  },
}));
