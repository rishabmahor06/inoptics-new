import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { MdClose, MdEdit, MdDelete, MdZoomIn } from "react-icons/md";
import {
  API,
  MasterModal,
  MasterField,
  MasterInput,
  SectionHead,
} from "./_shared";

const EMPTY_FORM = { name: "", price: "" };

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API}/uploads/${path}`;
};

function ImagePreviewModal({ src, name, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <MdClose size={18} />
        </button>
        <img
          src={src}
          alt={name}
          className="w-full rounded-2xl object-contain bg-white shadow-2xl"
          style={{ maxHeight: "80vh" }}
        />
        {name && (
          <p className="mt-3 text-[13px] font-semibold text-white/90 text-center px-4">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}

/* Skeleton card */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      <div className="h-44 bg-zinc-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-100 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
        <div className="h-7 bg-zinc-100 rounded-lg animate-pulse mt-3" />
      </div>
    </div>
  );
}

export default function FurnitureRequirement() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [image, setImage]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null); // { src, name }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/get_furniture_requirement.php`);
      const d = await r.json();
      setRows(Array.isArray(d) ? d : []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImage(null);
    setEditing(null);
    setModal("add");
  };
  const openEdit = (row) => {
    setForm({ name: row.name || "", price: row.price || "" });
    setImage(null);
    setEditing(row);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      if (image) fd.append("image", image);
      if (modal === "edit") fd.append("id", editing.id);
      const res = await fetch(
        `${API}/${modal === "add" ? "add_furniture_requirement.php" : "update_furniture_requirement.php"}`,
        { method: "POST", body: fd }
      ).then((r) => r.json());
      toast.success(res.message || "Saved");
      load();
      setModal(null);
    } catch {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const r = await fetch(`${API}/delete_furniture_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then((r) => r.json());
      toast.success(r.message || "Deleted");
      load();
    } catch {
      toast.error("Error deleting");
    }
  };

  return (
    <div>
      <SectionHead
        title="Furniture Requirement"
        count={rows.length}
        onAdd={openAdd}
        addLabel="+ Add Furniture"
        search={search}
        onSearch={setSearch}
      />

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <MdEdit size={24} className="text-zinc-300" />
          </div>
          <p className="text-[13px] font-medium text-zinc-400">
            {search ? "No results found" : "No furniture items yet"}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="text-[12px] font-semibold text-blue-600 hover:underline"
            >
              + Add first item
            </button>
          )}
        </div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((row) => {
            const src = imgSrc(row.image);
            return (
              <div
                key={row.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
              >
                {/* Image area */}
                <div
                  className="relative bg-zinc-50 flex items-center justify-center overflow-hidden"
                  style={{ height: 160 }}
                >
                  {src ? (
                    <>
                      <img
                        src={src}
                        alt={row.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                      {/* fallback */}
                      <div className="w-full h-full hidden items-center justify-center text-zinc-300 text-[11px] absolute inset-0">
                        No Image
                      </div>
                      {/* Zoom hint on hover */}
                      <button
                        onClick={() => setPreview({ src, name: row.name })}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-zinc-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow">
                          <MdZoomIn size={13} /> Preview
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[11px] font-medium">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1 border-t border-zinc-100">
                  <p className="text-[12px] font-semibold text-zinc-800 leading-snug line-clamp-2 flex-1">
                    {row.name}
                  </p>
                  <p className="text-[13px] font-bold text-blue-600 mt-1.5">
                    ₹ {parseFloat(row.price || 0).toLocaleString("en-IN")}
                  </p>
                  <div className="flex gap-1.5 mt-2.5">
                    <button
                      onClick={() => openEdit(row)}
                      className="flex-1 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="flex-1 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview popup */}
      {preview && (
        <ImagePreviewModal
          src={preview.src}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Add / Edit modal */}
      {modal && (
        <MasterModal
          title={`${modal === "add" ? "Add" : "Edit"} Furniture`}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        >
          <div className="space-y-4">
            <MasterField label="Furniture Name" required>
              <MasterInput
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Chair"
              />
            </MasterField>
            <MasterField label="Price (₹)" required>
              <MasterInput
                type="number"
                value={form.price}
                onChange={set("price")}
                placeholder="e.g. 500"
              />
            </MasterField>
            <MasterField
              label={`Image${modal === "edit" ? " (optional — leave blank to keep current)" : ""}`}
            >
              {/* Show current image when editing */}
              {modal === "edit" && editing?.image && !image && (
                <div className="mb-2 w-24 h-20 rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
                  <img
                    src={imgSrc(editing.image)}
                    alt="current"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="px-4 py-2 text-xs font-semibold bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 hover:bg-zinc-200 transition-colors">
                  Choose Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
                <span className="text-xs text-zinc-400">
                  {image ? image.name : "No file chosen"}
                </span>
              </label>
              {/* New image preview */}
              {image && (
                <div className="mt-2 w-24 h-20 rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              )}
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
