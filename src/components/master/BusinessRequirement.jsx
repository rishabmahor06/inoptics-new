import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const API = 'https://inoptics.in/api';
const post = (ep, data) => fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export default function BusinessRequirement() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/get_business_requirement.php`);
      const d = await r.json();
      setRows(Array.isArray(d) ? d : []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows
    .filter(r => r.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name?.localeCompare(b.name));

  const openAdd  = () => { setName(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setName(row.name || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await post(
        modal === 'add' ? 'add_business_requirement.php' : 'update_business_requirement.php',
        modal === 'add' ? { name } : { id: editing.id, name }
      );
      toast.success(res.message || 'Saved');
      load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { const r = await post('delete_business_requirement.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Business Requirement</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{rows.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          <button onClick={openAdd}
            className="bg-blue-600 text-white rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
            + Add
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['#', 'NAME', 'ACTIONS'].map(h => (
                <th key={h} className="bg-zinc-900 text-zinc-100 px-4 py-3 text-left text-[11px] font-semibold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-12 text-center text-sm text-zinc-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-sm text-zinc-400">No records found</td></tr>
            ) : filtered.map((row, i) => (
              <tr key={row.id} className={`hover:bg-zinc-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
                <td className="px-4 py-3 border-b border-zinc-100 text-[12px] text-zinc-400">{i + 1}</td>
                <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.name}</td>
                <td className="px-4 py-3 border-b border-zinc-100">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(row)}
                      className="px-2.5 py-1.5 text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(row.id)}
                      className="px-2.5 py-1.5 text-[12px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-800">{modal === 'add' ? 'Add' : 'Edit'} Business Requirement</h3>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Business Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter business name"
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
