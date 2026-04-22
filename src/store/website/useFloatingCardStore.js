import { create } from 'zustand';
import { getFloatingCards, addFloatingCard, updateFloatingCard, deleteFloatingCard } from '../../api/website/floatingCardApi';
import toast from 'react-hot-toast';

export const useFloatingCardStore = create((set, get) => ({
  cards: [],
  loading: false,

  fetchCards: async () => {
    set({ loading: true });
    try {
      const data = await getFloatingCards();
      set({ cards: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load floating cards');
    } finally {
      set({ loading: false });
    }
  },

  addCard: async (data) => {
    const res = await addFloatingCard(data);
    toast.success(res.message || 'Added');
    get().fetchCards();
    return res;
  },

  updateCard: async (data) => {
    const res = await updateFloatingCard(data);
    toast.success(res.message || 'Updated');
    get().fetchCards();
    return res;
  },

  deleteCard: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteFloatingCard(id);
    toast.success(res.message || 'Deleted');
    get().fetchCards();
  },
}));
