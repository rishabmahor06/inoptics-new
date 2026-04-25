import React, { useState, useEffect } from 'react';
import {
  MdBusiness, MdEvent, MdPeople, MdNewspaper, MdTableChart,
  MdEdit, MdDelete, MdAdd,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';
import CustomEditor from '../../../components/CustomEditor/CustomEditor';

/* ── Company Details ── */
function CompanyDetailsCard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('get_exhibitor_profile.php')
      .then(arr => setData(Array.isArray(arr) ? arr[0] : arr))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const rows = [
    { label: 'Company Name',   key: 'company_name'   },
    { label: 'Mobile',         key: 'mobile'         },
    { label: 'Email',          key: 'email'          },
    { label: 'GST',            key: 'gst'            },
    { label: 'Stall Number',   key: 'stall_number'   },
    { label: 'Stall Category', key: 'stall_category' },
  ];

  return (
    <SectionShell icon={MdBusiness} iconBg="#dbeafe" iconColor="#3b82f6" title="Company Details">
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-7 bg-zinc-100 rounded-lg animate-pulse" />)}
        </div>
      ) : !data ? (
        <p className="text-[12px] text-zinc-400 text-center py-6">No profile data found.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.key} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
              <span className="text-[11px] font-semibold text-zinc-500 w-32 shrink-0">{r.label}</span>
              <span className="text-[12px] text-zinc-800 font-medium text-right flex-1 truncate">{data[r.key] || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ── Event Schedule ── */
function EventScheduleCard() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('get_exhibitor_event_schedule.php')
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
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

  const item = items[0];

  return (
    <>
      <SectionShell icon={MdEvent} iconBg="#dcfce7" iconColor="#16a34a"
        title="Event Schedule"
        onAdd={!item ? () => setModal({ description: '' }) : undefined}
        addLabel="Add">
        {loading ? (
          <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
        ) : !item ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[12px] text-zinc-400">No event schedule added</p>
            <button onClick={() => setModal({ description: '' })}
              className="mt-1 text-[12px] font-semibold text-blue-600 hover:underline">+ Add schedule</button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <div
              className="text-[12px] text-zinc-700 leading-relaxed prose prose-sm max-w-none mb-3"
              dangerouslySetInnerHTML={{ __html: item.description || '' }}
            />
            <div className="flex gap-1.5">
              <button onClick={() => setModal({ id: item.id, description: item.description || '' })}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                <MdEdit size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                <MdDelete size={12} /> Delete
              </button>
            </div>
          </div>
        )}
      </SectionShell>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit Event Schedule' : 'Add Event Schedule'} onClose={() => setModal(null)} wide>
          <CustomEditor value={modal.description} onChange={html => setModal(m => ({ ...m, description: html }))}
            placeholder="Enter event schedule description..." />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving}
            saveLabel={modal.id ? 'Update' : 'Save'} />
        </Modal>
      )}
    </>
  );
}

/* ── Dashboard Schedule ── */
function DashboardScheduleCard() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('get_exhibitor_dashboard_schedule.php')
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
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
        onAdd={items.length === 0 ? () => setModal({ points: [{ title: '', text: '' }] }) : undefined}
        addLabel="Add">
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-zinc-100 rounded-lg animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[12px] text-zinc-400">No dashboard schedule added</p>
            <button onClick={() => setModal({ points: [{ title: '', text: '' }] })}
              className="mt-1 text-[12px] font-semibold text-blue-600 hover:underline">+ Add now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id ?? idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                <ol className="space-y-1.5 mb-3">
                  {(item.points || []).map((pt, pi) => (
                    <li key={pi}>
                      <p className="text-[12px] font-bold text-zinc-800">{pi + 1}. {pt.title}</p>
                      {pt.text && (
                        <ul className="ml-4 mt-0.5 space-y-0.5">
                          {pt.text.split('\n').filter(l => l.trim()).map((line, li) => (
                            <li key={li} className="text-[11px] text-zinc-500 list-disc ml-3">{line}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ id: item.id, points: item.points || [{ title: '', text: '' }] })}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                    <MdEdit size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                    <MdDelete size={12} /> Delete
                  </button>
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
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving}
            saveLabel={modal.id ? 'Update' : 'Save'} />
        </Modal>
      )}
    </>
  );
}

/* ── Latest News ── */
function LatestNewsCard() {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [modal, setModal]   = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoad(true);
    apiFetch('get_latest_news.php')
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoad(false));
  };
  useEffect(() => { load(); }, []);

  const addItem    = ()         => setModal(m => ({ ...m, news: [...m.news, { title: '', text: '', news_link: '' }] }));
  const removeItem = (i)        => setModal(m => ({ ...m, news: m.news.filter((_, idx) => idx !== i) }));
  const updateItem = (i, k, v)  => setModal(m => { const n = [...m.news]; n[i] = { ...n[i], [k]: v }; return { ...m, news: n }; });

  const handleSave = async () => {
    if (modal.news.some(n => !n.title.trim())) { toast.error('All items need a title'); return; }
    setSaving(true);
    try {
      const body = { news: modal.news };
      if (modal.id) body.id = modal.id;
      await apiPost(modal.id ? 'update_latest_news.php' : 'add_latest_news.php', body);
      toast.success(modal.id ? 'Updated' : 'Added');
      setModal(null); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await apiPost('delete_latest_news.php', { id }); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <SectionShell icon={MdNewspaper} iconBg="#fef3c7" iconColor="#d97706"
        title="Latest News"
        onAdd={items.length === 0 ? () => setModal({ news: [{ title: '', text: '', news_link: '' }] }) : undefined}
        addLabel="Add News">
        {loading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-[12px] text-zinc-400">No latest news added</p>
            <button onClick={() => setModal({ news: [{ title: '', text: '', news_link: '' }] })}
              className="mt-1 text-[12px] font-semibold text-blue-600 hover:underline">+ Add news</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id ?? idx} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                <div className="space-y-1.5 mb-3">
                  {(item.news || [item]).map((n, ni) => (
                    <div key={ni}>
                      <p className="text-[12px] font-bold text-zinc-800">{n.title}</p>
                      {n.text && <p className="text-[11px] text-zinc-500 mt-0.5">{n.text}</p>}
                      {n.news_link && (
                        <a href={n.news_link} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline mt-0.5 inline-block">Read more →</a>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ id: item.id, news: item.news || [{ title: item.title || '', text: item.text || '', news_link: item.news_link || '' }] })}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                    <MdEdit size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                    <MdDelete size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit Latest News' : 'Add Latest News'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {modal.news.map((n, i) => (
              <div key={i} className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Item {i + 1}</p>
                  {modal.news.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-[11px] text-red-500 hover:text-red-700 font-semibold">Remove</button>
                  )}
                </div>
                <input value={n.title} onChange={e => updateItem(i, 'title', e.target.value)}
                  placeholder="Title *"
                  className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea value={n.text} onChange={e => updateItem(i, 'text', e.target.value)}
                  placeholder="Description" rows={2}
                  className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <input value={n.news_link} onChange={e => updateItem(i, 'news_link', e.target.value)}
                  placeholder="https://link (optional)"
                  className="w-full px-3 py-2 text-[12px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <button onClick={addItem}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700">
              <MdAdd size={14} /> Add More
            </button>
          </div>
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving}
            saveLabel={modal.id ? 'Update' : 'Save'} />
        </Modal>
      )}
    </>
  );
}

/* ── Particulars ── */
function ParticularsCard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('get_exhibitor_profile.php')
      .then(arr => setData(Array.isArray(arr) ? arr[0] : arr))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const rows = [
    { label: 'Stall No',    value: data?.stall_number   || '—' },
    { label: 'Category',    value: data?.stall_category || '—' },
    { label: 'Area',        value: data?.stall_area     || '—' },
    { label: 'Hall',        value: data?.hall           || '—' },
    { label: 'Exhibitor',   value: data?.company_name   || '—' },
  ];

  return (
    <SectionShell icon={MdTableChart} iconBg="#fce7f3" iconColor="#ec4899" title="Particulars">
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-7 bg-zinc-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
              <span className="text-[11px] font-semibold text-zinc-500 w-24 shrink-0">{r.label}</span>
              <span className="text-[12px] text-zinc-800 font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ── Overview Tab ── */
export default function OverviewTab() {
  return (
    <div className="space-y-4">
      {/* Top row: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompanyDetailsCard />
        <EventScheduleCard />
        <DashboardScheduleCard />
      </div>

      {/* Bottom row: 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LatestNewsCard />
        <ParticularsCard />
      </div>
    </div>
  );
}
