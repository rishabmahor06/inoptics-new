import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';
import CustomEditor from '../../../components/CustomEditor/CustomEditor';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

const CANDIDATES = ['content', 'rule', 'guideline', 'instruction', 'description', 'text', 'body', 'html'];

function resolveContent(item, primaryKey) {
  if (item[primaryKey] != null && item[primaryKey] !== '') return item[primaryKey];
  for (const k of CANDIDATES) {
    if (k !== primaryKey && item[k] != null && item[k] !== '') return item[k];
  }
  return '';
}

function resolveKey(item, primaryKey) {
  if (item[primaryKey] != null) return primaryKey;
  for (const k of CANDIDATES) {
    if (k !== primaryKey && item[k] != null) return k;
  }
  return primaryKey;
}

export default function HtmlContentSection({
  title, icon, iconBg, iconColor,
  getEp, addEp, updateEp, deleteEp,
  contentKey = 'content', idKey = 'id',
}) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await apiFetch(getEp)); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const html = modal?.html?.trim();
    if (!html) { toast.error('Content cannot be empty'); return; }
    setSaving(true);
    try {
      const saveKey = modal._detectedKey || contentKey;
      if (modal.id) await apiPost(updateEp, { [idKey]: modal.id, [saveKey]: html });
      else          await apiPost(addEp, { [contentKey]: html });
      toast.success(modal.id ? 'Updated successfully' : 'Added successfully');
      setModal(null); load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await apiPost(deleteEp, { [idKey]: id }); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <SectionShell icon={icon} iconBg={iconBg} iconColor={iconColor}
        title={title}
        subtitle={`${items.length} item${items.length !== 1 ? 's' : ''} configured`}
        onAdd={() => setModal({ html: '' })}
        addLabel={`Add ${title}`}>
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[13px] text-zinc-400">No {title.toLowerCase()} added yet</p>
            <button onClick={() => setModal({ html: '' })}
              className="mt-2 text-[12px] font-semibold text-blue-600 hover:underline">+ Add first item</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item[idKey] ?? idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-1 text-[12px] text-zinc-700 leading-relaxed min-w-0 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: resolveContent(item, contentKey) }}
                  />
                  <div className="flex gap-1.5 shrink-0 mt-0.5">
                    <button
                      onClick={() => setModal({ id: item[idKey], html: resolveContent(item, contentKey), _detectedKey: resolveKey(item, contentKey) })}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      <MdEdit size={13} />
                    </button>
                    <button onClick={() => handleDelete(item[idKey])}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                      <MdDelete size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      {modal !== null && (
        <Modal title={modal.id ? `Edit ${title}` : `Add ${title}`} onClose={() => setModal(null)} wide>
          <CustomEditor
            value={modal.html}
            onChange={html => setModal(m => ({ ...m, html }))}
            placeholder={`Enter ${title.toLowerCase()} content here...`}
          />
          <ModalActions
            onCancel={() => setModal(null)}
            onSave={handleSave}
            saving={saving}
            saveLabel={modal.id ? 'Update' : 'Save'}
          />
        </Modal>
      )}
    </>
  );
}
