import { create } from 'zustand';
import { getPressRelease, addPressRelease, updatePressRelease, deletePressRelease } from '../../api/website/pressReleaseApi';
import toast from 'react-hot-toast';

export const usePressReleaseStore = create((set, get) => ({
  releases: [],
  loading: false,

  fetchReleases: async () => {
    set({ loading: true });
    try {
      const data = await getPressRelease();
      set({ releases: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load press releases');
    } finally {
      set({ loading: false });
    }
  },

  addRelease: async (fd) => {
    const res = await addPressRelease(fd);
    toast.success(res.message || 'Added');
    get().fetchReleases();
    return res;
  },

  updateRelease: async (fd) => {
    const res = await updatePressRelease(fd);
    toast.success(res.message || 'Updated');
    get().fetchReleases();
    return res;
  },

  deleteRelease: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deletePressRelease(id);
    toast.success(res.message || 'Deleted');
    get().fetchReleases();
  },
}));
