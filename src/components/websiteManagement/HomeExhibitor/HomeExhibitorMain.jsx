import React, { useEffect, useState } from 'react';
import { useHomeExhibitorStore } from '../../../store/website/useHomeExhibitorStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function HomeExhibitorMain() {
  const { mainItems, loadingMain, fetchMain, addMain, updateMain, deleteMain } = useHomeExhibitorStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

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
            <TdImage src={row.image} />
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
