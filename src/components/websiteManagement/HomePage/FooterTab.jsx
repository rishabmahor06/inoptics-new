import React, { useEffect, useState } from 'react';
import { useFooterStore } from '../../../store/website/useFooterStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

const FOOTER_CONFIG = {
  1: { label: 'Footer 1 — Image + Description', fields: ['description', 'image'] },
  2: { label: 'Footer 2 — Title + Description',  fields: ['title', 'description'] },
  3: { label: 'Footer 3 — Description Only',      fields: ['description'] },
  4: { label: 'Footer 4 — Title + Image',          fields: ['title', 'image'] },
};

function FooterBlock({ num }) {
  const { [`footer${num}`]: rows, [`loading${num}`]: loading,
    fetchFooter, addFooterItem, updateFooterItem, deleteFooterItem } = useFooterStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const cfg = FOOTER_CONFIG[num];
  const hasTitle = cfg.fields.includes('title');
  const hasDesc  = cfg.fields.includes('description');
  const hasImage = cfg.fields.includes('image');

  useEffect(() => { fetchFooter(num); }, [fetchFooter, num]);

  const openAdd = () => { setForm({ title: '', description: '' }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({ title: row.title || '', description: row.description || '' });
    setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (hasTitle) fd.append('title', form.title);
      if (hasDesc)  fd.append('description', form.description);
      if (hasImage && file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      if (modal === 'add') await addFooterItem(num, fd);
      else await updateFooterItem(num, fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  const headers = ['#',
    ...(hasTitle ? ['TITLE'] : []),
    ...(hasDesc  ? ['DESCRIPTION'] : []),
    ...(hasImage ? ['IMAGE'] : []),
    'ACTIONS',
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-800">{cfg.label}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{(rows || []).length} items</p>
        </div>
        <AddBtn onClick={openAdd} />
      </div>
      <WmTable headers={headers} loading={loading} empty={(rows || []).length === 0}>
        {(rows || []).map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            {hasTitle  && <Td className="font-medium">{row.title}</Td>}
            {hasDesc   && <TdHtml html={row.description} />}
            {hasImage  && <TdImage src={row.image} />}
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteFooterItem(num, row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={`${modal === 'add' ? 'Add' : 'Edit'} Footer ${num}`}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {hasTitle && (
              <Field label="Title">
                <WmInput value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
              </Field>
            )}
            {hasDesc && (
              <Field label="Description">
                <CustomEditor value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} placeholder="Description..." />
              </Field>
            )}
            {hasImage && (
              <Field label="Image">
                <WmFileInput onChange={e => setFile(e.target.files[0])} />
                {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
              </Field>
            )}
          </div>
        </WmModal>
      )}
    </div>
  );
}

export default function FooterTab() {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-zinc-700">Footer Sections</h3>
      {[1, 2, 3, 4].map(n => <FooterBlock key={n} num={n} />)}
    </div>
  );
}
