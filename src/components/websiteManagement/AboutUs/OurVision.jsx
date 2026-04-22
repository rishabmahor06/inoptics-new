import React, { useEffect, useState } from 'react';
import { useAboutUsStore } from '../../../store/website/useAboutUsStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function OurVision() {
  const { visionRows, loadingVision, fetchVision, addVision, updateVision, deleteVision } = useAboutUsStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVision(); }, [fetchVision]);

  const openAdd = () => { setTitle(''); setDescription(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addVision(payload);
      else await updateVision(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Our Vision" count={visionRows.length}>
        <AddBtn onClick={openAdd} label="Add Vision" />
      </SectionHeader>

      {!loadingVision && visionRows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {visionRows.map((row, i) => (
            <div key={row.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold text-zinc-800">{row.title}</p>
              </div>
              <div className="text-xs text-zinc-500 line-clamp-4"
                dangerouslySetInnerHTML={{ __html: row.description || '' }} />
              <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditBtn onClick={() => openEdit(row)} />
                <DelBtn onClick={() => deleteVision(row.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'ACTIONS']} loading={loadingVision} empty={visionRows.length === 0}>
        {visionRows.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteVision(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Vision' : 'Edit Vision'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Vision title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={description} onChange={setDescription} placeholder="Vision description..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
