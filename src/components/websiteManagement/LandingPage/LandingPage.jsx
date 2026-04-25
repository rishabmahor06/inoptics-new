import React, { useEffect, useState } from 'react';
import { useLandingPageStore } from '../../../store/website/useLandingPageStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, Field, WmInput, WmFileInput,
  SectionHeader, imgSrc, ImgPreview,
} from '../shared/WmShared';

const SPONSOR_TYPES = [
  'Platinum', 'Gold', 'Footer-hoya', 'Silver', 'Bronze', 'Diamond', 'Title',
  'Co-Title', 'Associate', 'Supporting', 'Media Partner', 'Knowledge Partner',
  'Technology Partner', 'Hospitality Partner', 'Logistics Partner', 'Exhibition Partner', 'Other',
];

const EMPTY_FORM = { name: '', sponsor_type: SPONSOR_TYPES[0] };

export default function LandingPage() {
  const { sponsors, loading, fetchSponsors, addSponsor, updateSponsor, deleteSponsor } = useLandingPageStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null); // { src, name }

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const openAdd = () => { setForm(EMPTY_FORM); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({
      name: row.name || row.title || '',
      sponsor_type: row.sponsor_type || SPONSOR_TYPES[0],
    });
    setFile(null); setEditing(row); setModal('edit');
  };

  const rowImg = (row) => row.image_path || row.image || row.image_url || row.logo || null;

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

  const displayName = (row) => row.name || row.title || '—';

  return (
    <div className="space-y-6">
      <SectionHeader title="Sponsor Images" count={sponsors.length}>
        <AddBtn onClick={openAdd} label="Add Sponsor" />
      </SectionHeader>

      {loading ? (
        <div className="flex justify-center py-14">
          <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
          <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No sponsors yet. Click "Add Sponsor" to get started.</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        /* All sponsors exist but none matched a type group — show flat grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sponsors.map(row => (
            <SponsorCard key={row.id} row={row} displayName={displayName} rowImg={rowImg}
              onPreview={() => setPreview({ src: imgSrc(rowImg(row)), alt: displayName(row) })}
              onEdit={() => openEdit(row)}
              onDelete={() => deleteSponsor(row.id)} />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-zinc-900 text-white rounded-md">
                {type}
              </span>
              <span className="text-xs text-zinc-400">{items.length} sponsor{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map(row => (
                <SponsorCard key={row.id} row={row} displayName={displayName} rowImg={rowImg}
                  onPreview={() => setPreview({ src: imgSrc(rowImg(row)), alt: displayName(row) })}
                  onEdit={() => openEdit(row)}
                  onDelete={() => deleteSponsor(row.id)} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <WmModal
          title={modal === 'add' ? 'Add Sponsor' : 'Edit Sponsor'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}
        >
          <div className="space-y-4">
            <Field label="Name" required>
              <WmInput
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Sponsor name"
              />
            </Field>

            <Field label="Sponsor Type">
              <select
                value={form.sponsor_type}
                onChange={e => setForm(p => ({ ...p, sponsor_type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SPONSOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            {/* Current image preview (edit mode) */}
            {modal === 'edit' && rowImg(editing) && (
              <Field label="Current Image">
                <div className="flex items-center gap-3">
                  <img
                    src={imgSrc(rowImg(editing))}
                    alt={displayName(editing)}
                    className="h-20 w-28 object-contain rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer"
                    onClick={() => setPreview({ src: imgSrc(rowImg(editing)), alt: displayName(editing) })}
                  />
                  <p className="text-xs text-zinc-400">Click image to preview</p>
                </div>
              </Field>
            )}

            <Field label={modal === 'edit' ? 'Replace Image (optional)' : 'Logo Image'}>
              <WmFileInput accept="image/*" onChange={e => setFile(e.target.files[0])} label="Choose Image" />
              {file && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-16 w-24 object-contain rounded-lg border border-zinc-200 bg-zinc-50"
                  />
                  <p className="text-xs text-emerald-600">{file.name}</p>
                </div>
              )}
            </Field>
          </div>
        </WmModal>
      )}

      {/* Full-screen image preview */}
      {preview && (
        <ImgPreview src={preview.src} alt={preview.alt} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

/* Sponsor card tile */
function SponsorCard({ row, displayName, rowImg, onPreview, onEdit, onDelete }) {
  const imagePath = rowImg(row);
  const hasImage = !!imagePath;
  const src = imgSrc(imagePath);
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group flex flex-col">
      {/* Image area */}
      <div
        className="relative h-32 bg-zinc-50 flex items-center justify-center cursor-pointer"
        onClick={onPreview}
      >
        {hasImage ? (
          <img
            src={src}
            alt={displayName(row)}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="text-3xl font-bold text-zinc-300">
            {displayName(row)?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Hover overlay */}
        {hasImage && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              🔍 Preview
            </span>
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-zinc-100">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-800 truncate">{displayName(row)}</p>
          <p className="text-[11px] text-zinc-400 font-mono">#{row.id}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <EditBtn onClick={onEdit} />
          <DelBtn onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}
