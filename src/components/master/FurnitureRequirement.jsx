import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

const EMPTY_FORM = { name: '', price: '' };

export default function FurnitureRequirement() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [image, setImage]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/get_furniture_requirement.php`); const d = await r.json(); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd  = () => { setForm(EMPTY_FORM); setImage(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ name: row.name || '', price: row.price || '' }); setImage(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      if (image) fd.append('image', image);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await fetch(`${API}/${modal === 'add' ? 'add_furniture_requirement.php' : 'update_furniture_requirement.php'}`, {
        method: 'POST', body: fd,
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const r = await fetch(`${API}/delete_furniture_requirement.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json());
      toast.success(r.message || 'Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div>
      <SectionHead title="Furniture Requirement" count={rows.length} onAdd={openAdd} addLabel="+ Add Furniture" search={search} onSearch={setSearch} />

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
          {filtered.map(row => (
            <div key={row.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-all group">
              {row.image
                ? <img src={row.image} alt={row.name} className="w-full h-28 object-cover" />
                : <div className="w-full h-28 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">No Image</div>
              }
              <div className="p-3">
                <p className="text-[13px] font-semibold text-zinc-800 truncate">{row.name}</p>
                <p className="text-[12px] text-blue-600 font-semibold mt-0.5">₹ {parseFloat(row.price || 0).toLocaleString('en-IN')}</p>
                <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(row)}
                    className="flex-1 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">Edit</button>
                  <button onClick={() => handleDelete(row.id)}
                    className="flex-1 py-1 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MasterTable headers={['#', 'IMAGE', 'NAME', 'PRICE', 'ACTIONS']} loading={loading} empty={filtered.length === 0}>
        {filtered.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image
                ? <img src={row.image} alt={row.name} className="h-10 w-14 object-cover rounded-lg border border-zinc-100" />
                : <div className="h-10 w-14 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px]">No img</div>
              }
            </td>
            <MasterTd className="font-medium text-zinc-800">{row.name}</MasterTd>
            <MasterTd className="font-semibold text-zinc-800">₹ {parseFloat(row.price || 0).toLocaleString('en-IN')}</MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>

      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Furniture`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <MasterField label="Furniture Name" required>
              <MasterInput value={form.name} onChange={set('name')} placeholder="e.g. Chair" />
            </MasterField>
            <MasterField label="Price (₹)" required>
              <MasterInput type="number" value={form.price} onChange={set('price')} placeholder="e.g. 500" />
            </MasterField>
            <MasterField label={`Image${modal === 'edit' ? ' (optional — leave blank to keep current)' : ''}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="px-4 py-2 text-xs font-semibold bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 hover:bg-zinc-200 transition-colors">
                  Choose Image
                </span>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="hidden" />
                <span className="text-xs text-zinc-400">{image ? image.name : 'No file chosen'}</span>
              </label>
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
