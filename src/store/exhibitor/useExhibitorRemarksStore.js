import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const isOk = (data) =>
  data?.success === true ||
  data?.status === "success" ||
  /success/i.test(data?.message || "");

export const useExhibitorRemarksStore = create((set, get) => ({
  companyName: "",
  remarks: [],
  remarkText: "",
  editingRemarkId: null,
  loading: false,

  setRemarkText: (val) => set({ remarkText: val }),
  setEditingRemarkId: (id) => set({ editingRemarkId: id }),

  initForCompany: (companyName) => {
    if (!companyName) return;
    if (get().companyName !== companyName) {
      set({
        companyName,
        remarks: [],
        remarkText: "",
        editingRemarkId: null,
      });
    }
    get().fetchRemarks();
  },

  fetchRemarks: async () => {
    const { companyName } = get();
    if (!companyName) return;
    set({ loading: true });
    try {
      const res = await fetch(
        `${API}/get_exhibitor_remarks.php?company_name=${encodeURIComponent(companyName)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.data || data?.records || [];
      set({ remarks: arr });
    } catch {
      // silent
    } finally {
      set({ loading: false });
    }
  },

  saveRemark: async () => {
    const { companyName, remarkText } = get();
    if (!companyName) { toast.error("Company missing"); return; }
    if (!remarkText.trim()) return;
    try {
      const res = await fetch(`${API}/add_exhibitor_remark.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, remark: remarkText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (isOk(data)) {
        toast.success("Remark saved");
        set({ remarkText: "" });
        get().fetchRemarks();
      } else {
        toast.error(data?.message || "Failed to save");
      }
    } catch {
      toast.error("Server error");
    }
  },

  updateRemark: async () => {
    const { editingRemarkId, remarkText } = get();
    if (!editingRemarkId || !remarkText.trim()) return;
    try {
      const res = await fetch(`${API}/update_exhibitor_remark.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRemarkId, remark: remarkText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (isOk(data)) {
        toast.success("Remark updated");
        set({ remarkText: "", editingRemarkId: null });
        get().fetchRemarks();
      } else {
        toast.error(data?.message || "Failed to update");
      }
    } catch {
      toast.error("Server error");
    }
  },

  deleteRemark: async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this remark?")) return;
    try {
      const res = await fetch(`${API}/delete_exhibitor_remark.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (isOk(data)) {
        toast.success("Deleted");
        get().fetchRemarks();
      } else {
        toast.error(data?.message || "Failed to delete");
      }
    } catch {
      toast.error("Server error");
    }
  },

  editRemark: (item) => {
    set({ editingRemarkId: item.id, remarkText: item.remark || "" });
  },

  sendEmail: async () => {
    const { companyName } = get();
    if (!companyName) return;
    try {
      const res = await fetch(`${API}/send_exhibitor_remark_email.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json().catch(() => ({}));
      if (isOk(data)) {
        toast.success("Email sent");
      } else {
        toast.error(data?.message || "Failed to send");
      }
    } catch {
      toast.error("Server error");
    }
  },
}));
