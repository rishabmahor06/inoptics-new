import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

const EMPTY = {
  label: "",
  address: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  gst: "",
};

const FIELDS = [
  {
    key: "label",
    label: "Label",
    placeholder: "e.g. Head Office",
    required: true,
  },
  {
    key: "address",
    label: "Address",
    placeholder: "Full address",
    textarea: true,
  },
  { key: "city", label: "City", placeholder: "e.g. New Delhi" },
  { key: "state", label: "State", placeholder: "e.g. Delhi" },
  { key: "pincode", label: "Pincode", placeholder: "e.g. 110024" },
  { key: "phone", label: "Phone", placeholder: "Contact number" },
  { key: "email", label: "Email", placeholder: "Comma-separated emails" },
  { key: "gst", label: "GST No", placeholder: "e.g. 07AABCR1234A1Z5" },
];

export default function AddressModal({ editing, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        label: editing.label || "",
        address: editing.address || "",
        city: editing.city || "",
        state: editing.state || "",
        pincode: editing.pincode || "",
        phone: editing.phone || "",
        email: editing.email || "",
        gst: editing.gst || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.address.trim()) {
      return;
    }
    setSaving(true);
    const payload = { ...form, is_active: editing?.is_active ?? 0 };
    const ok = await onSave(payload);
    setSaving(false);
    if (ok !== false) onClose();
  };

  const isEditing = !!(editing?.address || editing?.state);
  const inputCls =
    "w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <p className="text-[14px] font-bold text-zinc-800">
            {isEditing ? "Edit" : "Add"} Company Address
          </p>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {FIELDS.map(({ key, label, placeholder, textarea, required }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              {textarea ? (
                <textarea
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              ) : (
                <input
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditing ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
