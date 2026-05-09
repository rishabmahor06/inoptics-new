import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  getForExhibitorsMain,  saveForExhibitorsMain,
  getForExhibitorsCards, addForExhibitorCard, updateForExhibitorCard, deleteForExhibitorCard,
} from '../../api/website/forExhibitorsApi';

export const useForExhibitorsStore = create((set, get) => ({
  main: null,
  cards: [],
  loadingMain: false,
  loadingCards: false,

  fetchMain: async () => {
    set({ loadingMain: true });
    try {
      const d = await getForExhibitorsMain();
      const item = Array.isArray(d) ? (d[0] || null) : (d || null);
      set({ main: item });
    } catch { toast.error('Failed to load main'); }
    finally  { set({ loadingMain: false }); }
  },
  saveMain: async (fd) => {
    const res = await saveForExhibitorsMain(fd);
    toast.success(res?.message || 'Saved');
    get().fetchMain();
    return res;
  },

  fetchCards: async () => {
    set({ loadingCards: true });
    try {
      const d = await getForExhibitorsCards();
      set({ cards: Array.isArray(d) ? d : [] });
    } catch { toast.error('Failed to load cards'); }
    finally  { set({ loadingCards: false }); }
  },
  addCard:    async (fd) => { const r = await addForExhibitorCard(fd);    toast.success(r?.message || 'Added');   get().fetchCards(); return r; },
  updateCard: async (fd) => { const r = await updateForExhibitorCard(fd); toast.success(r?.message || 'Updated'); get().fetchCards(); return r; },
  deleteCard: async (id) => {
    if (!window.confirm('Delete this card?')) return;
    const r = await deleteForExhibitorCard(id);
    toast.success(r?.message || 'Deleted');
    get().fetchCards();
  },
}));
