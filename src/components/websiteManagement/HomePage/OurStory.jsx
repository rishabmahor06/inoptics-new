import React, { useEffect, useState } from 'react';
import { useOurStoryStore } from '../../../store/website/useOurStoryStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function OurStory() {
  const { stories, loading, fetchStories, addStory, updateStory, deleteStory } = useOurStoryStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const openAdd = () => { setTitle(''); setDescription(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addStory(payload);
      else await updateStory(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Our Story" count={stories.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>
      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'ACTIONS']} loading={loading} empty={stories.length === 0}>
        {stories.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800 max-w-[180px]">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteStory(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add Story' : 'Edit Story'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Story title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={description} onChange={setDescription} placeholder="Story description..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
