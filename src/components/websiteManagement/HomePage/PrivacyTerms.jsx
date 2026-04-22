import React, { useEffect, useState } from 'react';
import { usePrivacyTermsStore } from '../../../store/website/usePrivacyTermsStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, SubTabs,
  TrRow, Td, TdId, TdHtml, TdActions, SectionHeader,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

function PrivacySection() {
  const { privacyRows, loadingPrivacy, fetchPrivacy, addPrivacy, updatePrivacy, deletePrivacy } = usePrivacyTermsStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPrivacy(); }, [fetchPrivacy]);

  const openAdd = () => { setTitle(''); setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setContent(row.description || row.content || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addPrivacy(payload);
      else await updatePrivacy(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Privacy Policy" count={privacyRows.length}>
        <AddBtn onClick={openAdd} label="Add Section" />
      </SectionHeader>
      <WmTable headers={['#', 'TITLE', 'CONTENT', 'ACTIONS']} loading={loadingPrivacy} empty={privacyRows.length === 0}>
        {privacyRows.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800 min-w-[140px]">{row.title}</Td>
            <TdHtml html={row.description || row.content} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deletePrivacy(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add Privacy Section' : 'Edit Privacy Section'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Section title" />
            </Field>
            <Field label="Content">
              <CustomEditor value={content} onChange={setContent} placeholder="Privacy policy content..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}

function TermsSection() {
  const { termsRows, loadingTerms, fetchTerms, addTerms, updateTerms, deleteTerms } = usePrivacyTermsStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTerms(); }, [fetchTerms]);

  const openAdd = () => { setTitle(''); setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setContent(row.description || row.content || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addTerms(payload);
      else await updateTerms(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Terms & Conditions" count={termsRows.length}>
        <AddBtn onClick={openAdd} label="Add Section" />
      </SectionHeader>
      <WmTable headers={['#', 'TITLE', 'CONTENT', 'ACTIONS']} loading={loadingTerms} empty={termsRows.length === 0}>
        {termsRows.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800 min-w-[140px]">{row.title}</Td>
            <TdHtml html={row.description || row.content} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteTerms(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>
      {modal && (
        <WmModal title={modal === 'add' ? 'Add Terms Section' : 'Edit Terms Section'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Section title" />
            </Field>
            <Field label="Content">
              <CustomEditor value={content} onChange={setContent} placeholder="Terms content..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}

export default function PrivacyTerms() {
  const [sub, setSub] = useState('Privacy');
  return (
    <div className="space-y-4">
      <SubTabs tabs={['Privacy', 'Terms']} active={sub} onChange={setSub} />
      {sub === 'Privacy' ? <PrivacySection /> : <TermsSection />}
    </div>
  );
}
