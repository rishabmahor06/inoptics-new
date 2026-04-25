import React, { useState, useEffect } from 'react';
import { MdEvent } from 'react-icons/md';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';
import CustomEditor from '../../../components/CustomEditor/CustomEditor';
import { MdEdit, MdDelete } from 'react-icons/md';

export default function EventScheduleTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await apiFetch('get_exhibitor_event_schedule.php')); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const html = modal?.description?.trim();
    if (!html) { toast.error('Description required'); return; }
    setSaving(true);
    try {
      if (modal.id) await apiPost('update_exhibitor_event_schedule.php', { id: modal.id, description: html });
      else          await apiPost('add_exhibitor_event_schedule.php', { description: html });
      toast.success(modal.id ? 'Updated' : 'Added');
      setModal(null); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await apiPost('delete_exhibitor_event_schedule.php', { id }); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <SectionShell icon={MdEvent} iconBg="#dbeafe" iconColor="#3b82f6"
        title="Event Schedule"
        subtitle="Event timeline shown to exhibitors"
        onAdd={() => setModal({ description: '' })}
        addLabel="Add Schedule">
        {loading ? (
          <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
        ) : items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[13px] text-zinc-400">No event schedule added</p>
            <button onClick={() => setModal({ description: '' })}
              className="mt-2 text-[12px] font-semibold text-blue-600 hover:underline">+ Add schedule</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id ?? idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 text-[12px] text-zinc-700 leading-relaxed min-w-0 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.description || '' }} />
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setModal({ id: item.id, description: item.description || '' })}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                      <MdEdit size={13} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
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
        <Modal title={modal.id ? 'Edit Event Schedule' : 'Add Event Schedule'} onClose={() => setModal(null)} wide>
          <CustomEditor
            value={modal.description}
            onChange={html => setModal(m => ({ ...m, description: html }))}
            placeholder="Enter event schedule description..."
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
