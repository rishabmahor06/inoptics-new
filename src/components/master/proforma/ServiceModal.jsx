import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const OPTIONS = ['CAT', 'BARE/SHELL', 'STALL NO', 'TYPE', 'STALL SIZE', 'PRICE PER KW', 'POWER REQUIRED', 'PHASE', 'EXTRA BADGES'];
const EMPTY   = { name: '', description: '', selectedOptions: [] };

const parseOpts = (v) =>
  Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

export default function ServiceModal({ editing, onClose, onSave }) {
  const [form, setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing
      ? { name: editing.name || '', description: editing.description || '', selectedOptions: parseOpts(editing.selectedOptions) }
      : EMPTY
    );
  }, [editing]);

  const toggleOpt = (opt) =>
    setForm(p => ({
      ...p,
      selectedOptions: p.selectedOptions.includes(opt)
        ? p.selectedOptions.filter(o => o !== opt)
        : [...p.selectedOptions, opt],
    }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    let ok;
    if (editing?.name) {
      ok = await onSave({ oldName: editing.name, ...form });
    } else {
      ok = await onSave(form);
    }
    setSaving(false);
    if (ok !== false) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <p className="text-[14px] font-bold text-zinc-800">{editing?.name ? 'Edit' : 'Add'} Service</p>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"><MdClose size={18} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">
              Particulars Service <span className="text-red-500">*</span>
            </label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Stall Space Charges"
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2} placeholder="Optional description..."
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-zinc-300" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Invoice Columns</label>
            <div className="grid grid-cols-2 gap-1.5">
              {OPTIONS.map(opt => {
                const checked = form.selectedOptions.includes(opt);
                return (
                  <label key={opt}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-[12px] font-medium select-none
                      ${checked ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOpt(opt)} className="accent-blue-600 shrink-0" />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100 shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : (editing?.name ? 'Update' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}
