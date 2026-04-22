import { create } from 'zustand';
import { getHomeVideos, uploadHomeVideo, deleteHomeVideo } from '../../api/website/homeVideoApi';
import toast from 'react-hot-toast';

export const useHomeVideoStore = create((set, get) => ({
  videos: [],
  loading: false,

  fetchVideos: async () => {
    set({ loading: true });
    try {
      const data = await getHomeVideos();
      set({ videos: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load videos');
    } finally {
      set({ loading: false });
    }
  },

  uploadVideo: async (fd) => {
    const res = await uploadHomeVideo(fd);
    toast.success(res.message || 'Video uploaded');
    get().fetchVideos();
    return res;
  },

  deleteVideo: async (id) => {
    if (!window.confirm('Delete this video?')) return;
    const res = await deleteHomeVideo(id);
    toast.success(res.message || 'Deleted');
    get().fetchVideos();
  },
}));
