import React, { useEffect, useState } from 'react';
import { usePeopleCommentsStore } from '../../../store/website/usePeopleCommentsStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function PeopleComments() {
  const { comments, loading, fetchComments, addComment, updateComment, deleteComment } = usePeopleCommentsStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '' });
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const openAdd = () => { setForm({ name: '', designation: '' }); setComment(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({ name: row.name || '', designation: row.designation || '' });
    setComment(row.comments || ''); setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('designation', form.designation);
      fd.append('comments', comment);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addComment(fd);
      else await updateComment(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="People Comments" count={comments.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>
      <WmTable headers={['#', 'IMAGE', 'COMMENT', 'NAME', 'DESIGNATION', 'ACTIONS']} loading={loading} empty={comments.length === 0}>
        {comments.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image
                ? <img src={row.image} alt="" className="h-10 w-10 object-cover rounded-full border-2 border-zinc-200" />
                : <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm">
                    {row.name?.[0]}
                  </div>
              }
            </td>
            <TdHtml html={row.comments} />
            <Td className="font-semibold text-zinc-800">{row.name}</Td>
            <Td className="text-zinc-500">{row.designation}</Td>
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteComment(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add Comment' : 'Edit Comment'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <WmInput value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
              </Field>
              <Field label="Designation">
                <WmInput value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="Designation" />
              </Field>
            </div>
            <Field label="Comment">
              <CustomEditor value={comment} onChange={setComment} placeholder="Comment..." />
            </Field>
            <Field label="Photo">
              <WmFileInput onChange={e => setFile(e.target.files[0])} />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
