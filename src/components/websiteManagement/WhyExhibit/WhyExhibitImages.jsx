import React, { useEffect, useState } from 'react';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import { AddBtn, WmModal, Field, WmInput, WmFileInput, SectionHeader } from '../shared/WmShared';
import { MdDelete } from 'react-icons/md';

export default function WhyExhibitImages() {
  const { images, loadingImages, fetchImages, addImage, deleteImage } = useWhyExhibitStore();
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleSave = async () => {
    if (!file) { alert('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      if (title) fd.append('title', title);
      await addImage(fd);
      setModal(false); setFile(null); setTitle('');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Why Exhibit — Images" count={images.length}>
        <AddBtn onClick={() => { setFile(null); setTitle(''); setModal(true); }} label="Upload Image" />
      </SectionHeader>

      {loadingImages ? (
        <div className="flex justify-center py-10">
          <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-sm">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map(row => (
            <div key={row.id}
              className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-square hover:shadow-md transition-all">
              <img src={row.image || row.url} alt={row.title || ''} className="w-full h-full object-cover" />
              {row.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 px-2 py-1.5">
                  <p className="text-[11px] text-white truncate">{row.title}</p>
                </div>
              )}
              <button onClick={() => deleteImage(row.id)}
                className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg">
                <MdDelete size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WmModal title="Upload Why Exhibit Image" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title (optional)">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Image title" />
            </Field>
            <Field label="Image" required>
              <WmFileInput accept="image/*" onChange={e => setFile(e.target.files[0])} label="Choose Image" />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
