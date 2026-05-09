import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  getVisitorGuideMain,  saveVisitorGuideMain,
  getVisitorGuideCards, addVisitorGuideCard, updateVisitorGuideCard, deleteVisitorGuideCard,
  getVisitorMetroMap,   saveVisitorMetroMap,
} from '../../api/website/visitorGuideApi';

export const useVisitorGuideStore = create((set, get) => ({
  /* state */
  main: null,
  cards: [],
  metro: null,
  loadingMain: false,
  loadingCards: false,
  loadingMetro: false,

  /* ============ MAIN ============ */
  fetchMain: async () => {
    set({ loadingMain: true });
    try {
      const d = await getVisitorGuideMain();
      const item = Array.isArray(d) ? (d[0] || null) : (d || null);
      set({ main: item });
    } catch {
      toast.error('Failed to load visitor guide');
    } finally {
      set({ loadingMain: false });
    }
  },
  saveMain: async (fd) => {
    const res = await saveVisitorGuideMain(fd);
    toast.success(res?.message || 'Saved');
    get().fetchMain();
    return res;
  },

  /* ============ CARDS ============ */
  fetchCards: async () => {
    set({ loadingCards: true });
    try {
      const d = await getVisitorGuideCards();
      set({ cards: Array.isArray(d) ? d : [] });
    } catch {
      toast.error('Failed to load cards');
    } finally {
      set({ loadingCards: false });
    }
  },
  addCard: async (fd) => {
    const res = await addVisitorGuideCard(fd);
    toast.success(res?.message || 'Added');
    get().fetchCards();
    return res;
  },
  updateCard: async (fd) => {
    const res = await updateVisitorGuideCard(fd);
    toast.success(res?.message || 'Updated');
    get().fetchCards();
    return res;
  },
  deleteCard: async (id) => {
    if (!window.confirm('Delete this card?')) return;
    const res = await deleteVisitorGuideCard(id);
    toast.success(res?.message || 'Deleted');
    get().fetchCards();
  },

  /* ============ METRO MAP ============ */
  fetchMetro: async () => {
    set({ loadingMetro: true });
    try {
      const d = await getVisitorMetroMap();
      const item = Array.isArray(d) ? (d[0] || null) : (d || null);
      set({ metro: item });
    } catch {
      toast.error('Failed to load metro map');
    } finally {
      set({ loadingMetro: false });
    }
  },
  saveMetro: async (fd) => {
    const res = await saveVisitorMetroMap(fd);
    toast.success(res?.message || 'Saved');
    get().fetchMetro();
    return res;
  },
}));
