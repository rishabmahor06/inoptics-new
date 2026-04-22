import React, { useEffect, useState } from 'react';
import { useFounderStore } from '../../../store/website/useFounderStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function FounderSection() {
  const { founders, loading, fetchFounders, addFounder, updateFounder, deleteFounder } = useFounderStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFounders(); }, [fetchFounders]);

  const openAdd = () => { setHeading(''); setDescription(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setHeading(row.heading || ''); setDescription(row.description || '');
    setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('heading', heading);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addFounder(fd);
      else await updateFounder(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Founder Section" count={founders.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>
      <WmTable headers={['#', 'HEADING', 'DESCRIPTION', 'IMAGE', 'ACTIONS']} loading={loading} empty={founders.length === 0}>
        {founders.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.heading}</Td>
            <TdHtml html={row.description} />
            <TdImage src={row.image} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteFounder(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add Founder' : 'Edit Founder'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Heading">
              <WmInput value={heading} onChange={e => setHeading(e.target.value)} placeholder="Heading" />
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
