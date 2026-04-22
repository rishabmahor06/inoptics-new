import React, { useEffect, useState } from 'react';
import { useFloatingCardStore } from '../../../store/website/useFloatingCardStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function FloatingCard() {
  const { cards, loading, fetchCards, addCard, updateCard, deleteCard } = useFloatingCardStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openAdd = () => { setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setContent(row.description || row.content || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addCard(payload);
      else await updateCard(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Floating Cards" count={cards.length}>
        <AddBtn onClick={openAdd} label="Add Card" />
      </SectionHeader>

      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {cards.map(row => (
            <div key={row.id}
              className="relative bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditBtn onClick={() => openEdit(row)} />
                <DelBtn onClick={() => deleteCard(row.id)} />
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mb-2">#{row.id}</div>
              <div className="text-sm text-zinc-700 line-clamp-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: row.description || row.content || '' }} />
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'DESCRIPTION', 'ACTIONS']} loading={loading} empty={cards.length === 0}>
        {cards.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <TdHtml html={row.description || row.content} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteCard(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Floating Card' : 'Edit Floating Card'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <Field label="Content">
            <CustomEditor value={content} onChange={setContent} placeholder="Floating card content..." />
          </Field>
        </WmModal>
      )}
    </div>
  );
}
