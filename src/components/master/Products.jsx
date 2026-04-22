import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

export default function Products() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/get_product.php`); const d = await r.json(); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  const openAdd  = () => { setName(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setName(row.name || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/${modal === 'add' ? 'add_product.php' : 'update_product.php'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal === 'add' ? { name } : { id: editing.id, name }),
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const r = await fetch(`${API}/delete_product.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(r => r.json());
      toast.success(r.message || 'Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div>
      <SectionHead title="Products" count={rows.length} onAdd={openAdd} addLabel="+ Add Product" search={search} onSearch={setSearch} />
      <MasterTable headers={['#', 'PRODUCT NAME', 'ACTIONS']} loading={loading} empty={filtered.length === 0}>
        {filtered.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <MasterTd className="font-medium text-zinc-800">{row.name}</MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>
      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Product`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <MasterField label="Product Name" required>
            <MasterInput value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" />
          </MasterField>
        </MasterModal>
      )}
    </div>
  );
}
