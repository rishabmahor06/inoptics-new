import React, { useEffect, useState } from 'react';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function WhyExhibitMain() {
  const { exhibits, loadingExhibits, fetchExhibits, addExhibit, updateExhibit, deleteExhibit } = useWhyExhibitStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExhibits(); }, [fetchExhibits]);

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
      if (modal === 'add') await addExhibit(fd);
      else await updateExhibit(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Why Exhibit — Main" count={exhibits.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      {!loadingExhibits && exhibits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {exhibits.map(row => (
            <div key={row.id}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group">
              {row.image && <img src={row.image} alt={row.title} className="w-full h-32 object-cover" />}
              <div className="p-4">
                <p className="text-sm font-bold text-zinc-800 mb-1">{row.title}</p>
                <div className="text-xs text-zinc-500 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: row.description || '' }} />
                <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditBtn onClick={() => openEdit(row)} />
                  <DelBtn onClick={() => deleteExhibit(row.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'DESCRIPTION', 'IMAGE', 'ACTIONS']} loading={loadingExhibits} empty={exhibits.length === 0}>
        {exhibits.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdImage src={row.image} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteExhibit(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Why Exhibit' : 'Edit Why Exhibit'}
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
