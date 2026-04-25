import React, { useEffect, useState } from 'react';
import { useHomeExhibitorStore } from '../../../store/website/useHomeExhibitorStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdActions, imgSrc, ImgPreview,
} from '../shared/WmShared';
import { MdImage } from 'react-icons/md';

export default function HomeExhibitorCards() {
  const { cardItems, loadingCards, fetchCards, addCard, updateCard, deleteCard } = useHomeExhibitorStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle]     = useState('');
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openAdd = () => { setTitle(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!file && !editing) { alert('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addCard(fd);
      else await updateCard(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Home Exhibitor — Cards" count={cardItems.length}>
        <AddBtn onClick={openAdd} label="Add Card" />
      </SectionHeader>

      {!loadingCards && cardItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
          {cardItems.map(row => {
            const src = imgSrc(row.image);
            return (
              <div key={row.id}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group flex flex-col">
                <div
                  className="relative h-24 bg-zinc-50 flex items-center justify-center cursor-pointer"
                  onClick={() => src && setPreview(src)}>
                  {src ? (
                    <>
                      <img src={src} alt={row.title || ''} className="h-full w-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full">
                          🔍 Preview
                        </span>
                      </div>
                    </>
                  ) : (
                    <MdImage className="text-zinc-200" size={32} />
                  )}
                </div>
                <div className="px-2.5 py-2 flex items-center justify-between gap-1 border-t border-zinc-100">
                  {row.title && <p className="text-xs font-semibold text-zinc-700 truncate flex-1">{row.title}</p>}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <EditBtn onClick={() => openEdit(row)} />
                    <DelBtn onClick={() => deleteCard(row.id)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'IMAGE', 'ACTIONS']} loading={loadingCards} empty={cardItems.length === 0}>
        {cardItems.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-medium">{row.title}</Td>
            <TdImage src={row.image} onPreview={setPreview} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteCard(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Card' : 'Edit Card'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" />
            </Field>
            {modal === 'edit' && editing?.image && (
              <Field label="Current Image">
                <img src={imgSrc(editing.image)} alt={title}
                  className="h-20 w-28 object-contain rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer"
                  onClick={() => setPreview(imgSrc(editing.image))} />
                <p className="text-xs text-zinc-400 mt-1">Click to preview</p>
              </Field>
            )}
            <Field label={modal === 'edit' ? 'Replace Image (optional)' : 'Image'} required={!editing}>
              <WmFileInput onChange={e => setFile(e.target.files[0])} />
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
