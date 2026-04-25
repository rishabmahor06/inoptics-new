import React, { useEffect, useState } from 'react';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import { AddBtn, WmModal, Field, WmInput, WmFileInput, SectionHeader, imgSrc, ImgPreview } from '../shared/WmShared';
import { MdDelete, MdImage } from 'react-icons/md';

export default function WhyExhibitImages() {
  const { images, loadingImages, fetchImages, addImage, deleteImage } = useWhyExhibitStore();
  const [modal, setModal]     = useState(false);
  const [file, setFile]       = useState(null);
  const [title, setTitle]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

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
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <MdImage className="opacity-20 mb-2" size={48} />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map(row => {
            const src = imgSrc(row.image_url || row.image || row.url);
            return (
              <div key={row.id}
                className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-square hover:shadow-md transition-all bg-zinc-50">
                {src ? (
                  <>
                    <img src={src} alt={row.title || ''}
                      onClick={() => setPreview(src)}
                      className="w-full h-full object-cover cursor-pointer" />
                    <div onClick={() => setPreview(src)}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center cursor-pointer">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-full">
                        🔍 Preview
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdImage className="text-zinc-300" size={36} />
                  </div>
                )}
                {row.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 px-2 py-1.5 pointer-events-none">
                    <p className="text-[11px] text-white truncate">{row.title}</p>
                  </div>
                )}
                <button onClick={() => deleteImage(row.id)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg z-10">
                  <MdDelete size={14} />
                </button>
              </div>
            );
          })}
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
              {file && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={URL.createObjectURL(file)} alt="preview"
                    className="h-16 w-24 object-contain rounded-lg border border-zinc-200 bg-zinc-50" />
                  <p className="text-xs text-emerald-600">{file.name}</p>
                </div>
              )}
            </Field>
          </div>
        </WmModal>
      )}

      {preview && <ImgPreview src={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
