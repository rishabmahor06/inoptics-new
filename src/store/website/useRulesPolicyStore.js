import { create } from 'zustand';
import { getRules, addRules, updateRules, deleteRules } from '../../api/website/rulesPolicyApi';
import toast from 'react-hot-toast';

export const useRulesPolicyStore = create((set, get) => ({
  rules: [],
  loading: false,

  fetchRules: async () => {
    set({ loading: true });
    try {
      const data = await getRules();
      set({ rules: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load rules');
    } finally {
      set({ loading: false });
    }
  },

  addRule: async (data) => {
    const res = await addRules(data);
    toast.success(res.message || 'Added');
    get().fetchRules();
    return res;
  },

  updateRule: async (data) => {
    const res = await updateRules(data);
    toast.success(res.message || 'Updated');
    get().fetchRules();
    return res;
  },

  deleteRule: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteRules(id);
    toast.success(res.message || 'Deleted');
    get().fetchRules();
  },
}));
