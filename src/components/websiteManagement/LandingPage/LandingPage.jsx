import React, { useEffect, useState } from 'react';
import { useLandingPageStore } from '../../../store/website/useLandingPageStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdActions, TdImage,
} from '../shared/WmShared';

const SPONSOR_TYPES = [
  'Platinum', 'Gold', 'Footer-hoya', 'Silver', 'Bronze', 'Diamond', 'Title',
  'Co-Title', 'Associate', 'Supporting', 'Media Partner', 'Knowledge Partner',
  'Technology Partner', 'Hospitality Partner', 'Logistics Partner', 'Exhibition Partner', 'Other',
];

const EMPTY_FORM = { name: '', sponsor_type: SPONSOR_TYPES[0] };

export default function LandingPage() {
  const { sponsors, loading, fetchSponsors, addSponsor, updateSponsor, deleteSponsor } = useLandingPageStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const openAdd = () => { setForm(EMPTY_FORM); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({ name: row.name || '', sponsor_type: row.sponsor_type || SPONSOR_TYPES[0] });
    setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('sponsor_type', form.sponsor_type);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addSponsor(fd);
      else await updateSponsor(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  const grouped = SPONSOR_TYPES.reduce((acc, type) => {
    const items = sponsors.filter(s => s.sponsor_type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <SectionHeader title="Sponsors" count={sponsors.length}>
        <AddBtn onClick={openAdd} label="Add Sponsor" />
      </SectionHeader>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-sm">No sponsors yet. Add your first sponsor.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-zinc-900 text-white rounded-md">
                {type}
              </span>
              <span className="text-xs text-zinc-400">{items.length} sponsor{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map(row => (
                <div key={row.id}
                  className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all group">
                  {row.image ? (
                    <img src={row.image} alt={row.name}
                      className="w-14 h-14 object-contain rounded-lg border border-zinc-100 bg-zinc-50 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <span className="text-zinc-400 text-lg font-bold">{row.name?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate">{row.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">#{row.id}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditBtn onClick={() => openEdit(row)} />
                    <DelBtn onClick={() => deleteSponsor(row.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {modal && (
        <WmModal
          title={modal === 'add' ? 'Add Sponsor' : 'Edit Sponsor'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Name" required>
              <WmInput value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sponsor name" />
            </Field>
            <Field label="Sponsor Type">
              <select value={form.sponsor_type} onChange={e => setForm(p => ({ ...p, sponsor_type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SPONSOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Logo Image">
              <WmFileInput accept="image/*" onChange={e => setFile(e.target.files[0])} label="Choose Image" />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
