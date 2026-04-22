import React, { useEffect, useState } from 'react';
import { useHomeExhibitorStore } from '../../../store/website/useHomeExhibitorStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdActions,
} from '../shared/WmShared';

export default function HomeExhibitorCards() {
  const { cardItems, loadingCards, fetchCards, addCard, updateCard, deleteCard } = useHomeExhibitorStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

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
          {cardItems.map(row => (
            <div key={row.id}
              className="bg-white rounded-xl border border-zinc-200 p-3 flex flex-col items-center gap-2 hover:shadow-md hover:border-blue-200 transition-all group">
              {row.image
                ? <img src={row.image} alt={row.title || ''} className="w-full h-16 object-contain rounded-lg" />
                : <div className="w-full h-16 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 text-xs">No Image</div>
              }
              {row.title && <p className="text-xs font-semibold text-zinc-700 text-center truncate w-full">{row.title}</p>}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditBtn onClick={() => openEdit(row)} />
                <DelBtn onClick={() => deleteCard(row.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'IMAGE', 'ACTIONS']} loading={loadingCards} empty={cardItems.length === 0}>
        {cardItems.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-medium">{row.title}</Td>
            <TdImage src={row.image} />
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
            <Field label="Image" required={!editing}>
              <WmFileInput onChange={e => setFile(e.target.files[0])} />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
