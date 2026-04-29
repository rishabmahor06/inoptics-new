import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';
import { useProductsStore } from '../../store/master/useProductsStore';

export default function Products() {
  const { rows, loading, fetch: load, add, update, delete: remove } = useProductsStore();
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));

  const openAdd  = () => { setName(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setName(row.name || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const ok = modal === 'add' ? await add(name) : await update(editing.id, name);
      if (ok) setModal(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await remove(id);
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
