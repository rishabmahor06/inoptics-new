import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdSearch, MdAdd, MdClose, MdEdit, MdDelete, MdVisibility,
  MdRefresh, MdDescription, MdUploadFile,
} from "react-icons/md";

const API = "https://inoptics.in/api";

export default function CoreFormsTab() {
  const [forms, setForms]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory]   = useState("");
  const [file, setFile]           = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const [filePreviewUrl, setFilePreviewUrl] = useState(null);    // local blob URL inside modal
  const [previewItem, setPreviewItem]       = useState(null);    // { url, category } for table preview

  useEffect(() => {
    fetchCoreForms();
  }, []);

  // Cleanup local blob URL when file changes / modal closes
  useEffect(() => {
    if (!file) { setFilePreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fetchCoreForms = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/get_core_forms.php`);
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error fetching core forms");
    }
    setLoading(false);
  };

  const resetModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setCategory("");
    setFile(null);
  };

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setCategory("");
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setCategory(item.category || "");
    setFile(null);
    setShowModal(true);
  };

  const addCoreForm = async () => {
    if (!file)             { toast.error("Please select a PDF file"); return; }
    if (!category.trim())  { toast.error("Category is required");     return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category.trim());
      const res  = await fetch(`${API}/add_core_form.php`, { method: "POST", body: fd });
      const data = await res.json();
      toast.success(data.message || "Form added");
      fetchCoreForms();
      resetModal();
    } catch {
      toast.error("Error adding core form");
    }
    setSaving(false);
  };

  const updateCoreForm = async () => {
    if (!category.trim()) { toast.error("Category is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id", editingId);
      fd.append("category", category.trim());
      if (file) fd.append("file", file);
      const res  = await fetch(`${API}/update_core_form.php`, { method: "POST", body: fd });
      const data = await res.json();
      toast.success(data.message || "Form updated");
      fetchCoreForms();
      resetModal();
    } catch {
      toast.error("Error updating core form");
    }
    setSaving(false);
  };

  const deleteCoreForm = async (item) => {
    if (!window.confirm(`Delete the "${item.category}" form?`)) return;
    setDeleting(item.id);
    try {
      const res  = await fetch(`${API}/delete_core_form.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: item.category }),
      });
      const data = await res.json();
      toast.success(data.message || "Deleted");
      fetchCoreForms();
    } catch {
      toast.error("Error deleting core form");
    }
    setDeleting(null);
  };

  const filtered = forms.filter((f) =>
    !search.trim() ||
    (f.category || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.filename || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAdd}
            className="px-3 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 transition-colors"
          >
            <MdAdd size={16} /> Add Form
          </button>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
            {forms.length} forms
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by category or file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchCoreForms}
            disabled={loading}
            className="h-10 px-3 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5 transition-colors disabled:opacity-60 shrink-0"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 text-center text-zinc-500 text-base">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdDescription size={42} className="text-zinc-200" />
          <p className="text-base">No forms found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  {["#", "Category", "File", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                    <td className="px-4 py-3 text-[13px] text-zinc-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 text-[14px] font-semibold text-zinc-800 capitalize">
                      {item.category || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreviewItem({ url: `${API}/uploads/${item.filename}`, category: item.category })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                      >
                        <MdVisibility size={13} /> View PDF
                      </button>
                      {item.filename && (
                        <p className="text-[11px] text-zinc-400 font-mono mt-1 truncate max-w-xs">
                          {item.filename}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                          title="Edit"
                        >
                          <MdEdit size={14} />
                        </button>
                        <button
                          onClick={() => deleteCoreForm(item)}
                          disabled={deleting === item.id}
                          className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === item.id ? (
                            <span className="block w-3.5 h-3.5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                          ) : <MdDelete size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {filtered.map((item, i) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                    <p className="font-semibold text-[14px] text-zinc-800 capitalize">
                      {item.category || "—"}
                    </p>
                    {item.filename && (
                      <p className="text-[11px] text-zinc-400 font-mono truncate">{item.filename}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                    >
                      <MdEdit size={13} />
                    </button>
                    <button
                      onClick={() => deleteCoreForm(item)}
                      disabled={deleting === item.id}
                      className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                    >
                      {deleting === item.id ? (
                        <span className="block w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                      ) : <MdDelete size={13} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewItem({ url: `${API}/uploads/${item.filename}`, category: item.category })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                >
                  <MdVisibility size={13} /> View PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h3 className="text-[15px] font-bold text-zinc-800">
                {isEditing ? "Edit Form" : "Add Form"}
              </h3>
              <button
                onClick={resetModal}
                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stall Handover"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-[14px] border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
                  PDF File {isEditing && <span className="text-zinc-400 normal-case font-normal">(optional)</span>}
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-4 border-2 border-dashed border-zinc-200 rounded cursor-pointer hover:bg-zinc-50 hover:border-blue-300 transition-colors">
                  <MdUploadFile size={20} className="text-zinc-400" />
                  <span className="text-[13px] text-zinc-600">
                    {file ? file.name : "Click to choose PDF"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {isEditing && !file && (
                  <p className="text-[11px] text-zinc-400">Leave empty to keep the current file.</p>
                )}

                {/* Live preview of the chosen file */}
                {file && filePreviewUrl && (
                  <div className="mt-2 border border-zinc-200 rounded overflow-hidden bg-zinc-50">
                    <div className="px-3 py-2 border-b border-zinc-200 flex items-center justify-between gap-2 bg-white">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-zinc-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {(file.size / 1024).toFixed(1)} KB · ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="px-2 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                    {file.type === "application/pdf" ? (
                      <iframe
                        src={filePreviewUrl}
                        title="PDF preview"
                        className="w-full h-64 bg-white"
                      />
                    ) : file.type?.startsWith("image/") ? (
                      <img
                        src={filePreviewUrl}
                        alt="preview"
                        className="w-full max-h-64 object-contain bg-white"
                      />
                    ) : (
                      <div className="p-4 text-[12px] text-zinc-500 text-center">
                        Preview not available for this file type.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-zinc-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={resetModal}
                className="px-4 py-2 text-[14px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? updateCoreForm : addCoreForm}
                disabled={saving}
                className="px-4 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-60"
              >
                {saving
                  ? "Uploading..."
                  : isEditing
                    ? (file ? "Confirm & Update" : "Update")
                    : "Confirm & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL (table View PDF) */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0 gap-3">
              <h3 className="text-[15px] font-bold text-zinc-800 truncate capitalize">
                {previewItem.category || "Form Preview"}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors hidden sm:inline-flex items-center gap-1"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <MdClose size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-zinc-100 overflow-hidden">
              <iframe
                src={previewItem.url}
                title={previewItem.category || "Preview"}
                className="w-full h-[80vh] border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
