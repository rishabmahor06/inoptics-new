import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  getExhibitorLoginContent,
  addExhibitorLoginContent,
  updateExhibitorLoginContent,
  deleteExhibitorLoginContent,
} from '../../api/website/exhibitorLoginContentApi';

export const useExhibitorLoginContentStore = create((set, get) => ({
  rows: [],
  loading: false,

  fetchRows: async () => {
    set({ loading: true });
    try {
      const d = await getExhibitorLoginContent();
      set({ rows: Array.isArray(d) ? d : [] });
    } catch { toast.error('Failed to load'); }
    finally  { set({ loading: false }); }
  },
  addRow:    async (fd) => { const r = await addExhibitorLoginContent(fd);    toast.success(r?.message || 'Added');   get().fetchRows(); return r; },
  updateRow: async (fd) => { const r = await updateExhibitorLoginContent(fd); toast.success(r?.message || 'Updated'); get().fetchRows(); return r; },
  deleteRow: async (id) => {
    if (!window.confirm('Delete?')) return;
    const r = await deleteExhibitorLoginContent(id);
    toast.success(r?.message || 'Deleted');
    get().fetchRows();
  },
}));
