import React, { useEffect, useState } from 'react';
import { usePressReleaseStore } from '../../../store/website/usePressReleaseStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdActions,
} from '../shared/WmShared';

export default function PressRelease() {
  const { releases, loading, fetchReleases, addRelease, updateRelease, deleteRelease } = usePressReleaseStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', date: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const openAdd = () => { setForm({ title: '', date: '' }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ title: row.title || '', date: row.date || '' }); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('date', form.date);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addRelease(fd);
      else await updateRelease(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Press Releases" count={releases.length}>
        <AddBtn onClick={openAdd} label="Add Press Release" />
      </SectionHeader>

      {!loading && releases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {releases.map(row => (
            <div key={row.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group">
              {row.image && (
                <img src={row.image} alt={row.title}
                  className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <p className="text-xs text-blue-600 font-semibold mb-1">{row.date}</p>
                <p className="text-sm font-semibold text-zinc-800 line-clamp-2">{row.title}</p>
                <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditBtn onClick={() => openEdit(row)} />
                  <DelBtn onClick={() => deleteRelease(row.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'DATE', 'IMAGE', 'ACTIONS']} loading={loading} empty={releases.length === 0}>
        {releases.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <Td className="text-blue-600 font-medium">{row.date}</Td>
            <TdImage src={row.image} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteRelease(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Press Release' : 'Edit Press Release'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title" required>
              <WmInput value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Press release title" />
            </Field>
            <Field label="Date">
              <WmInput type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </Field>
            <Field label="Image">
              <WmFileInput onChange={e => setFile(e.target.files[0])} />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
