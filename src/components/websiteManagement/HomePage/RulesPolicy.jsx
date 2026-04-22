import React, { useEffect, useState } from 'react';
import { useRulesPolicyStore } from '../../../store/website/useRulesPolicyStore';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from '../shared/WmShared';
import CustomEditor from '../../CustomEditor/CustomEditor';

export default function RulesPolicy() {
  const { rules, loading, fetchRules, addRule, updateRule, deleteRule } = useRulesPolicyStore();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openAdd = () => { setTitle(''); setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setContent(row.description || row.content || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
      if (modal === 'add') await addRule(payload);
      else await updateRule(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Rules & Policy" count={rules.length}>
        <AddBtn onClick={openAdd} label="Add Rule" />
      </SectionHeader>

      {!loading && rules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {rules.map((rule, i) => (
            <div key={rule.id}
              className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md hover:border-zinc-300 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-zinc-800">{rule.title}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <EditBtn onClick={() => openEdit(rule)} />
                  <DelBtn onClick={() => deleteRule(rule.id)} />
                </div>
              </div>
              <div className="text-xs text-zinc-500 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: rule.description || rule.content || '' }} />
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'CONTENT', 'ACTIONS']} loading={loading} empty={rules.length === 0}>
        {rules.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description || row.content} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn onClick={() => deleteRule(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === 'add' ? 'Add Rule' : 'Edit Rule'}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Rule title" />
            </Field>
            <Field label="Content">
              <CustomEditor value={content} onChange={setContent} placeholder="Rule / policy content..." />
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
