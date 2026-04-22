import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

const EMPTY = { power_type: '', price: '' };

export default function PowerRequirement() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/get_power_requirement.php`); const d = await r.json(); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load power requirements'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    r.power_type?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ power_type: row.power_type || '', price: row.price || '' }); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!form.power_type.trim() || !form.price) { toast.error('All fields required'); return; }
    setSaving(true);
    try {
      const body = modal === 'add'
        ? { power_type: form.power_type, price: parseFloat(form.price) }
        : { id: editing.id, power_type: form.power_type, price: parseFloat(form.price) };
      const res = await fetch(`${API}/${modal === 'add' ? 'add_power_requirement.php' : 'update_power_requirement.php'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this power requirement?')) return;
    try {
      const r = await fetch(`${API}/delete_power_requirement.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json());
      toast.success(r.message || 'Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  const types = [...new Set(rows.map(r => r.power_type?.trim()).filter(Boolean))];

  return (
    <div>
      <SectionHead title="Power Requirement" count={rows.length} onAdd={openAdd} addLabel="+ Add Power" search={search} onSearch={setSearch} />

      {!loading && types.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {types.map(t => (
            <span key={t} className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200">
              {t}
            </span>
          ))}
        </div>
      )}

      <MasterTable headers={['#', 'POWER TYPE', 'PRICE (₹)', 'ACTIONS']} loading={loading} empty={filtered.length === 0}>
        {filtered.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <MasterTd className="font-medium text-zinc-800">{row.power_type}</MasterTd>
            <MasterTd className="font-semibold text-zinc-800">₹ {parseFloat(row.price || 0).toLocaleString('en-IN')}</MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>

      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Power Requirement`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <MasterField label="Power Type" required>
              <MasterInput value={form.power_type} onChange={set('power_type')} placeholder="e.g. 3 Phase 15A" />
            </MasterField>
            <MasterField label="Price (₹)" required>
              <MasterInput type="number" value={form.price} onChange={set('price')} placeholder="e.g. 5000" />
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
