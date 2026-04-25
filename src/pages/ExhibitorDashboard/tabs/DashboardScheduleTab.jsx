import React, { useState, useEffect } from 'react';
import { MdPeople, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';

export default function DashboardScheduleTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await apiFetch('get_exhibitor_dashboard_schedule.php')); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addPoint    = ()         => setModal(m => ({ ...m, points: [...m.points, { title: '', text: '' }] }));
  const removePoint = (i)        => setModal(m => ({ ...m, points: m.points.filter((_, idx) => idx !== i) }));
  const updatePoint = (i, k, v)  => setModal(m => { const pts = [...m.points]; pts[i] = { ...pts[i], [k]: v }; return { ...m, points: pts }; });

  const handleSave = async () => {
    if (modal.points.some(p => !p.title.trim())) { toast.error('All points need a heading'); return; }
    setSaving(true);
    try {
      const body = { points: modal.points };
      if (modal.id) body.id = modal.id;
      await apiPost(modal.id ? 'update_exhibitor_dashboard_schedule.php' : 'add_exhibitor_dashboard_schedule.php', body);
      toast.success(modal.id ? 'Updated' : 'Added');
      setModal(null); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await apiPost('delete_exhibitor_dashboard_schedule.php', { id }); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <SectionShell icon={MdPeople} iconBg="#ede9fe" iconColor="#8b5cf6"
        title="Dashboard Schedule"
        subtitle="Points shown on exhibitor dashboard"
        onAdd={() => setModal({ points: [{ title: '', text: '' }] })}
        addLabel="Add">
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[13px] text-zinc-400">No dashboard schedule added</p>
            <button onClick={() => setModal({ points: [{ title: '', text: '' }] })}
              className="mt-2 text-[12px] font-semibold text-blue-600 hover:underline">+ Add now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id ?? idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1.5">
                    {(item.points || []).map((pt, pi) => (
                      <div key={pi}>
                        <p className="text-[12px] font-bold text-zinc-800">{pi + 1}. {pt.title}</p>
                        {pt.text && <p className="text-[11px] text-zinc-500 ml-4 mt-0.5 whitespace-pre-line">{pt.text}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setModal({ id: item.id, points: item.points || [{ title: '', text: '' }] })}
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
        <Modal title={modal.id ? 'Edit Dashboard Schedule' : 'Add Dashboard Schedule'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {modal.points.map((pt, i) => (
              <div key={i} className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Point {i + 1}</p>
                  {modal.points.length > 1 && (
                    <button onClick={() => removePoint(i)} className="text-[11px] text-red-500 hover:text-red-700 font-semibold">Remove</button>
                  )}
                </div>
                <input value={pt.title} onChange={e => updatePoint(i, 'title', e.target.value)}
                  placeholder="Point heading *"
                  className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea value={pt.text} onChange={e => updatePoint(i, 'text', e.target.value)}
                  placeholder="Point detail text" rows={3}
                  className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            ))}
            <button onClick={addPoint}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700">
              <MdAdd size={14} /> Add More Points
            </button>
          </div>
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
