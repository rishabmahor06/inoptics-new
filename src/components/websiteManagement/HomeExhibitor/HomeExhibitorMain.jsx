import React, { useEffect, useState } from 'react';
import { useHomeExhibitorStore } from '../../../store/website/useHomeExhibitorStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions, imgSrc, ImgPreview,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function HomeExhibitorMain() {
  const { mainItems, loadingMain, fetchMain, addMain, updateMain, deleteMain } = useHomeExhibitorStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle]     = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchMain(); }, [fetchMain]);

  const openAdd = () => { setTitle(''); setDescription(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setTitle(row.title || ''); setDescription(row.description || '');
    setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addMain(fd);
      else await updateMain(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Home Exhibitor — Main" count={mainItems.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'IMAGE', 'ACTIONS']} loading={loadingMain} empty={mainItems.length === 0}>
        {mainItems.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdImage src={row.image} onPreview={setPreview} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteMain(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Main Item' : 'Edit Main Item'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={description} onChange={setDescription} placeholder="Description..." />
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
