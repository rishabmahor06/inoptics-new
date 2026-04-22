import { create } from 'zustand';
import {
  getWhyExhibit, addWhyExhibit, updateWhyExhibit, deleteWhyExhibit,
  getWhyExhibitImages, addWhyExhibitImage, deleteWhyExhibitImage,
  getWhyExhibitPDFs, addWhyExhibitPDF, deleteWhyExhibitPDF,
  getWhyExhibitBecomeExhibitor, addWhyExhibitBecomeExhibitor,
  updateWhyExhibitBecomeExhibitor, deleteWhyExhibitBecomeExhibitor,
} from '../../api/website/whyExhibitApi';
import toast from 'react-hot-toast';

export const useWhyExhibitStore = create((set, get) => ({
  exhibits: [],
  images: [],
  pdfs: [],
  becomeExhibitor: [],
  loadingExhibits: false,
  loadingImages: false,
  loadingPdfs: false,
  loadingBecome: false,

  fetchExhibits: async () => {
    set({ loadingExhibits: true });
    try {
      const data = await getWhyExhibit();
      set({ exhibits: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load'); }
    finally { set({ loadingExhibits: false }); }
  },
  addExhibit: async (fd) => {
    const res = await addWhyExhibit(fd);
    toast.success(res.message || 'Added');
    get().fetchExhibits();
    return res;
  },
  updateExhibit: async (fd) => {
    const res = await updateWhyExhibit(fd);
    toast.success(res.message || 'Updated');
    get().fetchExhibits();
    return res;
  },
  deleteExhibit: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteWhyExhibit(id);
    toast.success(res.message || 'Deleted');
    get().fetchExhibits();
  },

  fetchImages: async () => {
    set({ loadingImages: true });
    try {
      const data = await getWhyExhibitImages();
      set({ images: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load images'); }
    finally { set({ loadingImages: false }); }
  },
  addImage: async (fd) => {
    const res = await addWhyExhibitImage(fd);
    toast.success(res.message || 'Added');
    get().fetchImages();
    return res;
  },
  deleteImage: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteWhyExhibitImage(id);
    toast.success(res.message || 'Deleted');
    get().fetchImages();
  },

  fetchPdfs: async () => {
    set({ loadingPdfs: true });
    try {
      const data = await getWhyExhibitPDFs();
      set({ pdfs: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load PDFs'); }
    finally { set({ loadingPdfs: false }); }
  },
  addPdf: async (fd) => {
    const res = await addWhyExhibitPDF(fd);
    toast.success(res.message || 'Added');
    get().fetchPdfs();
    return res;
  },
  deletePdf: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteWhyExhibitPDF(id);
    toast.success(res.message || 'Deleted');
    get().fetchPdfs();
  },

  fetchBecomeExhibitor: async () => {
    set({ loadingBecome: true });
    try {
      const data = await getWhyExhibitBecomeExhibitor();
      set({ becomeExhibitor: Array.isArray(data) ? data : [] });
    } catch { toast.error('Failed to load'); }
    finally { set({ loadingBecome: false }); }
  },
  addBecomeExhibitor: async (data) => {
    const res = await addWhyExhibitBecomeExhibitor(data);
    toast.success(res.message || 'Added');
    get().fetchBecomeExhibitor();
    return res;
  },
  updateBecomeExhibitor: async (data) => {
    const res = await updateWhyExhibitBecomeExhibitor(data);
    toast.success(res.message || 'Updated');
    get().fetchBecomeExhibitor();
    return res;
  },
  deleteBecomeExhibitor: async (id) => {
    if (!window.confirm('Delete?')) return;
    const res = await deleteWhyExhibitBecomeExhibitor(id);
    toast.success(res.message || 'Deleted');
    get().fetchBecomeExhibitor();
  },
}));
