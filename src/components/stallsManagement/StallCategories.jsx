import React, { useEffect, useState } from 'react';
import { useStallCategoriesStore } from '../../store/stallsManagement/useStallCategoriesStore';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

const STALL_TYPES = ['Bare Space', 'Shell Scheme'];
const EMPTY = { category: '', type: 'Bare Space', rupees: '', dollar: '', euro: '' };

function Modal({ editing, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing?.id
      ? { category: editing.category || '', type: editing.type || 'Bare Space', rupees: editing.rupees || '', dollar: editing.dollar || '', euro: editing.euro || '' }
      : EMPTY);
  }, [editing]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.category.trim()) return;
    setSaving(true);
    const ok = await onSave(editing?.id ? { ...form, id: editing.id } : form);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <p className="text-[14px] font-bold text-zinc-800">{editing?.id ? 'Edit' : 'Add'} Stall Category</p>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"><MdClose size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category Name <span className="text-red-500">*</span></label>
            <input value={form.category} onChange={set('category')} placeholder="e.g. Premium"
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Bare / Shell</label>
            <select value={form.type} onChange={set('type')}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Price (₹)', key: 'rupees', placeholder: '0' },
              { label: 'Price ($)', key: 'dollar', placeholder: '0' },
              { label: 'Price (€)', key: 'euro',   placeholder: '0' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input type="number" value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : (editing?.id ? 'Update' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}

const fmt = (n) => n ? parseFloat(n).toLocaleString('en-IN') : '—';

export default function StallCategories() {
  const { rows, loading, fetch, add, update, delete: del } = useStallCategoriesStore();
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);

  useEffect(() => { fetch(); }, []);

  const filtered = [...rows]
    .filter(r => r.category?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.category || '').localeCompare(b.category || ''));

  const handleDelete = (id) => { if (window.confirm('Delete this stall category?')) del(id); };
  const handleSave   = (data) => data.id ? update(data) : add(data);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Stall Categories</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{rows.length} categor{rows.length !== 1 ? 'ies' : 'y'} configured</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
            className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300 w-52" />
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <MdAdd size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['#', 'Category', 'Bare / Shell', 'Rupees (₹)', 'Dollar ($)', 'Euro (€)', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    {[1, 2, 3, 4, 5, 6, 7].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-400">No stall categories found</td></tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-zinc-800">{row.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md border ${
                        row.type === 'Shell Scheme'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {row.type || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-700">₹ {fmt(row.rupees)}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-700">$ {fmt(row.dollar)}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-700">€ {fmt(row.euro)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setModal(row)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                          <MdEdit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(row.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                          <MdDelete size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && <Modal editing={modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
