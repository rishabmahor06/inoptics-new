import React, { useEffect, useState } from 'react';
import { useStallNumbersStore } from '../../store/stallsManagement/useStallNumbersStore';
import { MdAdd, MdEdit, MdDelete, MdClose, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PAGE_SIZE = 15;
const EMPTY = { stall_number: '', hall_number: '' };

function Modal({ editing, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing?.id
      ? { stall_number: editing.stall_number || '', hall_number: editing.hall_number || '' }
      : EMPTY);
  }, [editing]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.stall_number.trim()) return;
    setSaving(true);
    const ok = await onSave(editing?.id ? { ...form, id: editing.id } : form);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <p className="text-[14px] font-bold text-zinc-800">{editing?.id ? 'Edit' : 'Add'} Stall Number</p>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"><MdClose size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Stall Number', key: 'stall_number', placeholder: 'e.g. A-101' },
            { label: 'Hall Number',  key: 'hall_number',  placeholder: 'e.g. Hall 1' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                {label} {key === 'stall_number' && <span className="text-red-500">*</span>}
              </label>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300" />
            </div>
          ))}
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

function Pagination({ page, total, onChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
        <MdChevronLeft size={16} />
      </button>
      {start > 1 && <span className="px-1 text-zinc-300 text-sm">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-7 h-7 text-[12px] font-semibold rounded-lg transition-colors
            ${p === page ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-1 text-zinc-300 text-sm">...</span>}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}
        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
        <MdChevronRight size={16} />
      </button>
    </div>
  );
}

export default function StallNumbers() {
  const { rows, loading, fetch, add, update, delete: del } = useStallNumbersStore();
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [page, setPage]     = useState(1);

  useEffect(() => { fetch(); }, []);

  const filtered = rows.filter(r =>
    r.stall_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.hall_number?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setPage(1); }, [search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id) => { if (window.confirm('Delete this stall number?')) del(id); };
  const handleSave   = (data) => data.id ? update(data) : add(data);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Stall Numbers</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{rows.length} stall{rows.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stalls or halls..."
            className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-300 w-48" />
          <Pagination page={page} total={filtered.length} onChange={setPage} />
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <MdAdd size={16} /> Add Stall
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['#', 'Stall Number', 'Hall Number', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    {[1, 2, 3, 4].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-400">No stall numbers found</td></tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-zinc-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-zinc-800">{row.stall_number}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200">
                        {row.hall_number || '—'}
                      </span>
                    </td>
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
