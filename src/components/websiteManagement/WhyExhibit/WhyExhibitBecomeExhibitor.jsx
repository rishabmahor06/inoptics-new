import React, { useEffect, useState } from 'react';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function WhyExhibitBecomeExhibitor() {
  const { becomeExhibitor, loadingBecome, fetchBecomeExhibitor, addBecomeExhibitor, updateBecomeExhibitor, deleteBecomeExhibitor } = useWhyExhibitStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBecomeExhibitor(); }, [fetchBecomeExhibitor]);

  const openAdd = () => { setTitle(''); setDescription(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addBecomeExhibitor(payload);
      else await updateBecomeExhibitor(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Why Exhibit — Become an Exhibitor" count={becomeExhibitor.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>
      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'ACTIONS']} loading={loadingBecome} empty={becomeExhibitor.length === 0}>
        {becomeExhibitor.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteBecomeExhibitor(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add' : 'Edit'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={description} onChange={setDescription} placeholder="Description..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
