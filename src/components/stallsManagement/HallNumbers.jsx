import React, { useEffect, useState } from 'react';
import { useHallNumbersStore } from '../../store/stallsManagement/useHallNumbersStore';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';

function Modal({ editing, onClose, onSave }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(editing?.id ? editing.hall_number || '' : ''); }, [editing]);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    const ok = await onSave(editing?.id ? { id: editing.id, hall_number: value } : { hall_number: value });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <p className="text-[14px] font-bold text-zinc-800">{editing?.id ? 'Edit' : 'Add'} Hall Number</p>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"><MdClose size={18} /></button>
        </div>
        <div className="p-5">
          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Hall Number <span className="text-red-500">*</span></label>
          <input value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. Hall 1"
            className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300" />
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

export default function HallNumbers() {
  const { rows, loading, fetch, add, update, delete: del } = useHallNumbersStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => { fetch(); }, []);

  const filtered = rows.filter(r => r.hall_number?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id) => { if (window.confirm('Delete this hall number?')) del(id); };

  const handleSave = (data) => data.id ? update(data) : add(data);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Hall Numbers</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{rows.length} hall{rows.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search halls..."
            className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300 w-48" />
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <MdAdd size={16} /> Add Hall
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['#', 'Hall Number', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    {[1, 2, 3].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-zinc-400">No hall numbers found</td></tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-800">{row.hall_number}</td>
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
