import { create } from 'zustand';
import {
  getPrivacy, addPrivacy, updatePrivacy, deletePrivacy,
  getTerms, addTerms, updateTerms, deleteTerms,
} from '../../api/website/privacyTermsApi';
import toast from 'react-hot-toast';

export const usePrivacyTermsStore = create((set, get) => ({
  privacyRows: [],
  termsRows: [],
  loadingPrivacy: false,
  loadingTerms: false,

  fetchPrivacy: async () => {
    set({ loadingPrivacy: true });
    try {
      const data = await getPrivacy();
      set({ privacyRows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load privacy');
    } finally {
      set({ loadingPrivacy: false });
    }
  },

  addPrivacy: async (data) => {
    const res = await addPrivacy(data);
    toast.success(res.message || 'Added');
    get().fetchPrivacy();
    return res;
  },

  updatePrivacy: async (data) => {
    const res = await updatePrivacy(data);
    toast.success(res.message || 'Updated');
    get().fetchPrivacy();
    return res;
  },

  deletePrivacy: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deletePrivacy(id);
    toast.success(res.message || 'Deleted');
    get().fetchPrivacy();
  },

  fetchTerms: async () => {
    set({ loadingTerms: true });
    try {
      const data = await getTerms();
      set({ termsRows: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load terms');
    } finally {
      set({ loadingTerms: false });
    }
  },

  addTerms: async (data) => {
    const res = await addTerms(data);
    toast.success(res.message || 'Added');
    get().fetchTerms();
    return res;
  },

  updateTerms: async (data) => {
    const res = await updateTerms(data);
    toast.success(res.message || 'Updated');
    get().fetchTerms();
    return res;
  },

  deleteTerms: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteTerms(id);
    toast.success(res.message || 'Deleted');
    get().fetchTerms();
  },
}));
