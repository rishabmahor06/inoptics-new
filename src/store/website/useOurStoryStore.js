import { create } from 'zustand';
import { getOurStory, addOurStory, updateOurStory, deleteOurStory } from '../../api/website/ourStoryApi';
import toast from 'react-hot-toast';

export const useOurStoryStore = create((set, get) => ({
  stories: [],
  loading: false,

  fetchStories: async () => {
    set({ loading: true });
    try {
      const data = await getOurStory();
      set({ stories: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load stories');
    } finally {
      set({ loading: false });
    }
  },

  addStory: async (data) => {
    const res = await addOurStory(data);
    toast.success(res.message || 'Added');
    get().fetchStories();
    return res;
  },

  updateStory: async (data) => {
    const res = await updateOurStory(data);
    toast.success(res.message || 'Updated');
    get().fetchStories();
    return res;
  },

  deleteStory: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteOurStory(id);
    toast.success(res.message || 'Deleted');
    get().fetchStories();
  },
}));
