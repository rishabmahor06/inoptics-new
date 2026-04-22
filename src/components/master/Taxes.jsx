import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

export default function Taxes() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [taxName, setTaxName] = useState('');
  const [taxValue, setTaxValue] = useState('');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/get_taxes.php`); const d = await r.json(); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load taxes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.value?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setTaxName(''); setTaxValue(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setTaxName(row.name || '');
    setTaxValue((row.value || '').replace('%', ''));
    setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    if (!taxName.trim() || !taxValue) { toast.error('All fields are required'); return; }
    setSaving(true);
    try {
      const body = modal === 'add'
        ? { name: taxName, value: `${taxValue}%` }
        : { id: editing.id, name: taxName, value: `${taxValue}%` };
      const res = await fetch(`${API}/${modal === 'add' ? 'add_taxes.php' : 'update_taxes.php'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tax?')) return;
    try {
      const r = await fetch(`${API}/delete_taxes.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json());
      toast.success(r.message || 'Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div>
      <SectionHead title="Taxes" count={rows.length} onAdd={openAdd} addLabel="+ Add Tax" search={search} onSearch={setSearch} />
      <MasterTable headers={['#', 'TAX NAME', 'VALUE', 'ACTIONS']} loading={loading} empty={filtered.length === 0}>
        {filtered.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <MasterTd className="font-medium text-zinc-800">{row.name}</MasterTd>
            <MasterTd>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[12px] font-semibold border border-blue-100">
                {row.value}
              </span>
            </MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>
      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Tax`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <MasterField label="Tax Name" required>
              <MasterInput value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="e.g. GST" />
            </MasterField>
            <MasterField label="Tax Value (%)" required>
              <div className="flex items-center gap-2">
                <MasterInput type="number" value={taxValue} onChange={e => setTaxValue(e.target.value)} placeholder="e.g. 18" />
                <span className="text-sm font-semibold text-zinc-500">%</span>
              </div>
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
