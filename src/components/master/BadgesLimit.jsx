import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

const EMPTY = { min_sq_ft: '', max_sq_ft: '', no_of_badges: '' };

export default function BadgesLimit() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/get_badge_limit.php`); const d = await r.json(); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({ min_sq_ft: row.min_sq_ft || '', max_sq_ft: row.max_sq_ft || '', no_of_badges: row.no_of_badges || '' });
    setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.min_sq_ft || !form.max_sq_ft || !form.no_of_badges) { toast.error('All fields required'); return; }
    setSaving(true);
    try {
      const body = modal === 'add'
        ? { min_sq_ft: form.min_sq_ft, max_sq_ft: form.max_sq_ft, no_of_badges: form.no_of_badges }
        : { id: editing.id, min_sq_ft: form.min_sq_ft, max_sq_ft: form.max_sq_ft, no_of_badges: form.no_of_badges };
      const res = await fetch(`${API}/${modal === 'add' ? 'add_badge_limit.php' : 'edit_badge_limit.php'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this badge limit?')) return;
    try {
      const r = await fetch(`${API}/delete_badge_limit.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json());
      toast.success(r.message || 'Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div>
      <SectionHead title="Badge Limits" count={rows.length} onAdd={openAdd} addLabel="+ Add Badge Limit" />
      <MasterTable headers={['#', 'MIN SQ FT', 'MAX SQ FT', 'NO. OF BADGES', 'ACTIONS']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <MasterTd>{row.min_sq_ft} sq ft</MasterTd>
            <MasterTd>{row.max_sq_ft} sq ft</MasterTd>
            <MasterTd>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-[12px] font-semibold">
                {row.no_of_badges} badges
              </span>
            </MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>
      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Badge Limit`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MasterField label="Min Sq Ft" required>
                <MasterInput type="number" value={form.min_sq_ft} onChange={set('min_sq_ft')} placeholder="e.g. 0" />
              </MasterField>
              <MasterField label="Max Sq Ft" required>
                <MasterInput type="number" value={form.max_sq_ft} onChange={set('max_sq_ft')} placeholder="e.g. 100" />
              </MasterField>
            </div>
            <MasterField label="No. of Badges" required>
              <MasterInput type="number" value={form.no_of_badges} onChange={set('no_of_badges')} placeholder="e.g. 5" />
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
