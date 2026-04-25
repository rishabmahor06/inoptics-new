import React, { useEffect, useState } from 'react';
import { useAboutUsStore } from '../../../store/website/useAboutUsStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions, imgSrc, ImgPreview,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function AboutUsSection() {
  const { aboutRows, loadingAbout, fetchAbout, addAbout, updateAbout, deleteAbout } = useAboutUsStore();
  const [modal, setModal]       = useState(null);
  const [editing, setEditing]   = useState(null);
  const [title, setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);

  useEffect(() => { fetchAbout(); }, [fetchAbout]);

  const openAdd = () => { setTitle(''); setDescription(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addAbout(fd);
      else await updateAbout(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="About Us" count={aboutRows.length}>
        <AddBtn onClick={openAdd} label="Add Section" />
      </SectionHeader>

      {!loadingAbout && aboutRows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {aboutRows.map(row => {
            const src = imgSrc(row.image);
            return (
              <div key={row.id} className="bg-white rounded-xl border border-zinc-200 p-5 flex gap-4 hover:shadow-md hover:border-blue-200 transition-all group">
                {src && (
                  <img src={src} alt={row.title}
                    onClick={() => setPreview(src)}
                    title="Click to preview"
                    className="w-20 h-20 object-cover rounded-xl border border-zinc-100 shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-800 mb-1">{row.title}</p>
                  <div className="text-xs text-zinc-500 line-clamp-3" dangerouslySetInnerHTML={{ __html: row.description || '' }} />
                  <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditBtn onClick={() => openEdit(row)} />
                    <DelBtn onClick={() => deleteAbout(row.id)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'IMAGE', 'ACTIONS']} loading={loadingAbout} empty={aboutRows.length === 0}>
        {aboutRows.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdImage src={row.image} onPreview={setPreview} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteAbout(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add About Us' : 'Edit About Us'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Section title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={description} onChange={setDescription} placeholder="About us content..." />
            </Field>
            {modal === 'edit' && editing?.image && (
              <Field label="Current Image">
                <img src={imgSrc(editing.image)} alt={title}
                  className="h-20 w-28 object-contain rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer"
                  onClick={() => setPreview(imgSrc(editing.image))} />
                <p className="text-xs text-zinc-400 mt-1">Click to preview</p>
              </Field>
            )}
            <Field label={modal === 'edit' ? 'Replace Image (optional)' : 'Image'}>
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
