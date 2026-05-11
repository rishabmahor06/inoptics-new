import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdMail,
  MdSave,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";

const API = "https://inoptics.in/api";

export default function EmailAppliedPlace() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // null = create mode, row = edit mode
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/fetch_email_applied_place.php`);
      const d = await r.json();
      const list = Array.isArray(d)
        ? d
        : Array.isArray(d?.data)
        ? d.data
        : Array.isArray(d?.records)
        ? d.records
        : [];
      setRows(list);
    } catch {
      toast.error("Failed to load email names");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.name || r.email_name || r.applied_place || "")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const isEdit = selected != null;

  const startCreate = () => {
    setSelected(null);
    setName("");
  };

  const startEdit = (row) => {
    setSelected(row);
    setName(row.name || row.email_name || row.applied_place || "");
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit
        ? `${API}/update_email_applied_place.php`
        : `${API}/create_email_applied_place.php`;
      const body = isEdit
        ? { id: selected.id, applied_place: trimmed }
        : { applied_place: trimmed };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      const ok =
        data?.success === true ||
        data?.status === "success" ||
        res.ok;
      if (!ok) throw new Error(data?.message || "Save failed");
      toast.success(isEdit ? "Updated" : "Created");
      await load();
      if (!isEdit) setName("");
    } catch (err) {
      toast.error(err.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name || row.email_name}"?`)) return;
    try {
      const res = await fetch(`${API}/delete_email_applied_place.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const data = await res.json().catch(() => ({}));
      const ok =
        data?.success === true || data?.status === "success" || res.ok;
      if (!ok) throw new Error(data?.message || "Delete failed");
      toast.success("Deleted");
      if (selected?.id === row.id) startCreate();
      load();
    } catch (err) {
      toast.error(err.message || "Error deleting");
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Email Applied Place
          </h2>
          
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
          {rows.length} total
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ============ LEFT — LIST ============ */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
            <div className="relative flex-1">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search names..."
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1 px-3 h-9 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="New"
            >
              <MdAdd size={15} /> New
            </button>
          </div>

          {loading ? (
            <ListSkel />
          ) : filtered.length === 0 ? (
            <Empty
              text={
                search ? "No matches found" : "No email names yet. Add one →"
              }
            />
          ) : (
            <ul className="divide-y divide-zinc-100 max-h-[60vh] overflow-y-auto">
              {filtered.map((row, i) => {
                const label =
                  row.name || row.email_name || row.applied_place || "—";
                const isSelected = selected?.id === row.id;
                return (
                  <li
                    key={row.id}
                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2.5 transition-colors ${
                      isSelected ? "bg-blue-50/60" : "hover:bg-zinc-50"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MdMail size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-800 truncate">
                        {label}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        ID: {row.id}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(row)}
                      className="w-8 h-8 rounded-md text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                      title="Edit"
                    >
                      <MdEdit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="w-8 h-8 rounded-md text-red-600 hover:bg-red-50 flex items-center justify-center"
                      title="Delete"
                    >
                      <MdDelete size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ============ RIGHT — FORM ============ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isEdit
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isEdit ? <MdEdit size={14} /> : <MdAdd size={14} />}
                </div>
                <h3 className="text-[13.5px] font-bold text-zinc-900">
                  {isEdit ? "Edit Name" : "Create New"}
                </h3>
              </div>
              {isEdit && (
                <button
                  onClick={startCreate}
                  className="w-7 h-7 rounded-md text-zinc-500 hover:bg-zinc-100 flex items-center justify-center"
                  title="Cancel edit"
                >
                  <MdClose size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-zinc-600 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payment Receive"
                  autoFocus
                  className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isEdit && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Editing ID #{selected.id}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {isEdit && (
                  <button
                    type="button"
                    onClick={startCreate}
                    disabled={saving}
                    className="flex-1 h-10 text-[12.5px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 h-10 text-[12.5px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      {isEdit ? <MdSave size={14} /> : <MdCheckCircle size={14} />}
                      {isEdit ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkel() {
  return (
    <ul className="divide-y divide-zinc-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex items-center gap-2.5 px-4 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/5 bg-zinc-100 rounded animate-pulse" />
            <div className="h-2.5 w-1/4 bg-zinc-100 rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty({ text }) {
  return (
    <div className="py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-300">
        <MdMail size={22} />
      </div>
      <p className="text-[13px] text-zinc-500">{text}</p>
    </div>
  );
}
