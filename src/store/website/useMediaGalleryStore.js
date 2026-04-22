import { create } from 'zustand';
import { getMediaGallery, addMediaGallery, deleteMediaGallery } from '../../api/website/mediaGalleryApi';
import toast from 'react-hot-toast';

export const useMediaGalleryStore = create((set, get) => ({
  media: [],
  loading: false,

  fetchMedia: async () => {
    set({ loading: true });
    try {
      const data = await getMediaGallery();
      set({ media: Array.isArray(data) ? data : [] });
    } catch {
      toast.error('Failed to load media gallery');
    } finally {
      set({ loading: false });
    }
  },

  addMedia: async (fd) => {
    const res = await addMediaGallery(fd);
    toast.success(res.message || 'Uploaded');
    get().fetchMedia();
    return res;
  },

  deleteMedia: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteMediaGallery(id);
    toast.success(res.message || 'Deleted');
    get().fetchMedia();
  },
}));
