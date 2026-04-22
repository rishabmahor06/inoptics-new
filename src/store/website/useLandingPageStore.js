import { create } from 'zustand';
import { getSponsors, addSponsor, updateSponsor, deleteSponsor } from '../../api/website/landingPageApi';
import toast from 'react-hot-toast';

export const useLandingPageStore = create((set, get) => ({
  sponsors: [],
  loading: false,

  fetchSponsors: async () => {
    set({ loading: true });
    try {
      const data = await getSponsors();
      set({ sponsors: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load sponsors');
    } finally {
      set({ loading: false });
    }
  },

  addSponsor: async (fd) => {
    const res = await addSponsor(fd);
    toast.success(res.message || 'Sponsor added');
    get().fetchSponsors();
    return res;
  },

  updateSponsor: async (fd) => {
    const res = await updateSponsor(fd);
    toast.success(res.message || 'Sponsor updated');
    get().fetchSponsors();
    return res;
  },

  deleteSponsor: async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    const res = await deleteSponsor(id);
    toast.success(res.message || 'Deleted');
    get().fetchSponsors();
  },
}));
