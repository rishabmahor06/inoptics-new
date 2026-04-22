import { create } from 'zustand';
import { getPeopleComments, addPeopleComment, updatePeopleComment, deletePeopleComment } from '../../api/website/peopleCommentsApi';
import toast from 'react-hot-toast';

export const usePeopleCommentsStore = create((set, get) => ({
  comments: [],
  loading: false,

  fetchComments: async () => {
    set({ loading: true });
    try {
      const data = await getPeopleComments();
      set({ comments: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load comments');
    } finally {
      set({ loading: false });
    }
  },

  addComment: async (fd) => {
    const res = await addPeopleComment(fd);
    toast.success(res.message || 'Added');
    get().fetchComments();
    return res;
  },

  updateComment: async (fd) => {
    const res = await updatePeopleComment(fd);
    toast.success(res.message || 'Updated');
    get().fetchComments();
    return res;
  },

  deleteComment: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deletePeopleComment(id);
    toast.success(res.message || 'Deleted');
    get().fetchComments();
  },
}));
