import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';
import CustomEditor from '../../../components/CustomEditor/CustomEditor';
import { MdEdit, MdDelete } from 'react-icons/md';

const CANDIDATES = [
  'content', 'rule', 'guideline', 'guidelines', 'instruction', 'instructions',
  'description', 'text', 'body', 'html', 'detail', 'details',
];

function resolveContent(item, primaryKey) {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (item[primaryKey] != null && item[primaryKey] !== '') return item[primaryKey];
  for (const k of CANDIDATES) {
    if (k !== primaryKey && item[k] != null && item[k] !== '') return String(item[k]);
  }
  const fallback = Object.entries(item).find(
    ([k, v]) => k !== 'id' && k !== 'status' && typeof v === 'string' && v.trim() !== ''
  );
  return fallback ? fallback[1] : '';
}

function resolveKey(item, primaryKey) {
  if (item == null || typeof item === 'string') return primaryKey;
  if (item[primaryKey] != null) return primaryKey;
  for (const k of CANDIDATES) {
    if (k !== primaryKey && item[k] != null) return k;
  }
  const fallback = Object.entries(item).find(
    ([k, v]) => k !== 'id' && k !== 'status' && typeof v === 'string' && v.trim() !== ''
  );
  return fallback ? fallback[0] : primaryKey;
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
      toast.success(modal.id ? 'Updated' : 'Added');
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
            {[1,2].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-200 rounded-xl text-center">
            <p className="text-sm text-zinc-400">No {title.toLowerCase()} added yet</p>
            <button onClick={() => setModal({ html: '' })}
              className="mt-2 text-sm font-semibold text-blue-600 hover:underline">+ Add first item</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const itemId      = typeof item === 'object' ? item?.[idKey] : undefined;
              const htmlContent = resolveContent(item, contentKey);
              const detectedKey = resolveKey(item, contentKey);
              return (
                <div key={itemId ?? idx} className="bg-white rounded-lg border border-zinc-200 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-1 min-w-0 overflow-x-auto
                        text-sm text-zinc-800 leading-relaxed
                        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-2
                        [&_thead]:bg-zinc-800 [&_thead_th]:text-white
                        [&_th]:border [&_th]:border-zinc-300 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-left [&_th]:whitespace-nowrap
                        [&_td]:border [&_td]:border-zinc-200 [&_td]:px-4 [&_td]:py-2 [&_td]:text-zinc-700 [&_td]:whitespace-nowrap
                        [&_tr:nth-child(even)_td]:bg-zinc-50
                        [&_tr:hover_td]:bg-blue-50/40
                        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-1
                        [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-semibold
                        [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1
                        [&_strong]:font-semibold [&_b]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                    <div className="flex gap-1.5 shrink-0 mt-0.5">
                      <button
                        onClick={() => setModal({ id: itemId, html: htmlContent, _detectedKey: detectedKey })}
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        <MdEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(itemId)}
                        className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
