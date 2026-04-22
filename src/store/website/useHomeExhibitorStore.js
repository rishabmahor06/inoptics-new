import { create } from 'zustand';
import {
  getExhibitorsMain, addExhibitorsMain, updateExhibitorsMain, deleteExhibitorsMain,
  getExhibitorsCards, addExhibitorsCard, updateExhibitorsCard, deleteExhibitorsCard,
} from '../../api/website/homeExhibitorApi';
import toast from 'react-hot-toast';

export const useHomeExhibitorStore = create((set, get) => ({
  mainItems: [],
  cardItems: [],
  loadingMain: false,
  loadingCards: false,

  fetchMain: async () => {
    set({ loadingMain: true });
    try {
      const data = await getExhibitorsMain();
      set({ mainItems: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load'); }
    finally { set({ loadingMain: false }); }
  },
  addMain: async (fd) => {
    const res = await addExhibitorsMain(fd);
    toast.success(res.message || 'Added');
    get().fetchMain();
    return res;
  },
  updateMain: async (fd) => {
    const res = await updateExhibitorsMain(fd);
    toast.success(res.message || 'Updated');
    get().fetchMain();
    return res;
  },
  deleteMain: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteExhibitorsMain(id);
    toast.success(res.message || 'Deleted');
    get().fetchMain();
  },

  fetchCards: async () => {
    set({ loadingCards: true });
    try {
      const data = await getExhibitorsCards();
      set({ cardItems: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load cards'); }
    finally { set({ loadingCards: false }); }
  },
  addCard: async (fd) => {
    const res = await addExhibitorsCard(fd);
    toast.success(res.message || 'Added');
    get().fetchCards();
    return res;
  },
  updateCard: async (fd) => {
    const res = await updateExhibitorsCard(fd);
    toast.success(res.message || 'Updated');
    get().fetchCards();
    return res;
  },
  deleteCard: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteExhibitorsCard(id);
    toast.success(res.message || 'Deleted');
    get().fetchCards();
  },
}));
