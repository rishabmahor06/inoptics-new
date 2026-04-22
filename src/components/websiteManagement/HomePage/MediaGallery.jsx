import React, { useEffect, useState } from 'react';
import { useMediaGalleryStore } from '../../../store/website/useMediaGalleryStore';
import { AddBtn, WmModal, Field, WmInput, WmFileInput, SectionHeader } from '../shared/WmShared';
import { MdDelete, MdImage } from 'react-icons/md';

export default function MediaGallery() {
  const { media, loading, fetchMedia, addMedia, deleteMedia } = useMediaGalleryStore();
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleSave = async () => {
    if (!file) { alert('Please select a file'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title);
      await addMedia(fd);
      setModal(false); setTitle(''); setFile(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Media Gallery" count={media.length}>
        <AddBtn onClick={() => { setFile(null); setTitle(''); setModal(true); }} label="Upload" />
      </SectionHeader>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <MdImage className="opacity-20 mb-2" size={52} />
          <p className="text-sm">No media uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map(row => (
            <div key={row.id}
              className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square hover:shadow-md transition-all">
              <img
                src={row.image || row.url}
                alt={row.title || ''}
                className="w-full h-full object-cover" />
              {row.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="text-[11px] text-white truncate">{row.title}</p>
                </div>
              )}
              <button onClick={() => deleteMedia(row.id)}
                className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg">
                <MdDelete size={14} />
              </button>
              <div className="absolute top-1.5 left-1.5">
                <span className="text-[10px] text-white bg-black/50 rounded px-1.5 py-0.5">#{row.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WmModal title="Upload Media" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
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
