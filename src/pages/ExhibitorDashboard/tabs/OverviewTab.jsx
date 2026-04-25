import React, { useState, useEffect } from 'react';
import { MdBusiness, MdEvent, MdPeople, MdNewspaper, MdTableChart, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, SectionShell, Modal, ModalActions } from '../shared';
import CustomEditor from '../../../components/CustomEditor/CustomEditor';

/* ── shared card styles ── */
const CARD = 'bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden';
const CARD_HEADER = 'flex items-center justify-between px-4 py-3 border-b border-zinc-100';
const CARD_BODY = 'p-4';
const BTN_EDIT = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors';
const BTN_DEL  = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors';
const BTN_ADD  = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors';
const INPUT    = 'w-full h-9 px-3 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition';
const TEXTAREA = 'w-full px-3 py-2 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none transition';
const EMPTY    = 'flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-200 rounded-xl text-center';

function SectionIcon({ iconBg, iconColor, Icon }) {
  return (
    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: iconBg }}>
      <Icon size={16} style={{ color: iconColor }} />
    </div>
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
    apiFetch('get_exhibitor_event_schedule.php').then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
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

  const item = items[0];

  return (
    <>
      <div className={CARD}>
        <div className={CARD_HEADER}>
          <div className="flex items-center gap-2.5">
            <SectionIcon iconBg="#dcfce7" iconColor="#16a34a" Icon={MdEvent} />
            <p className="text-sm font-bold text-zinc-900">Event Schedule</p>
          </div>
          {!item && (
            <button className={BTN_ADD} onClick={() => setModal({ description: '' })}>
              <MdAdd size={13} /> Add
            </button>
          )}
        </div>
        <div className={CARD_BODY}>
          {loading ? (
            <div className="h-20 bg-zinc-100 rounded-lg animate-pulse" />
          ) : !item ? (
            <div className={EMPTY}>
              <p className="text-sm text-zinc-400">No event schedule added</p>
              <button className="mt-2 text-sm font-semibold text-blue-600 hover:underline" onClick={() => setModal({ description: '' })}>+ Add schedule</button>
            </div>
          ) : (
            <div>
              <div className="text-sm text-zinc-700 leading-relaxed mb-3 [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: item.description || '' }} />
              <div className="flex gap-2">
                <button className={BTN_EDIT} onClick={() => setModal({ id: item.id, description: item.description || '' })}><MdEdit size={13} /> Edit</button>
                <button className={BTN_DEL} onClick={async () => { if (!window.confirm('Delete?')) return; await apiPost('delete_exhibitor_event_schedule.php', { id: item.id }); load(); }}><MdDelete size={13} /> Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit Event Schedule' : 'Add Event Schedule'} onClose={() => setModal(null)} wide>
          <CustomEditor value={modal.description} onChange={html => setModal(m => ({ ...m, description: html }))} placeholder="Enter event schedule description..." />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving} saveLabel={modal.id ? 'Update' : 'Save'} />
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
    apiFetch('get_exhibitor_dashboard_schedule.php').then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addPoint    = ()        => setModal(m => ({ ...m, points: [...m.points, { title: '', text: '' }] }));
  const removePoint = (i)       => setModal(m => ({ ...m, points: m.points.filter((_, idx) => idx !== i) }));
  const updatePoint = (i, k, v) => setModal(m => { const pts = [...m.points]; pts[i] = { ...pts[i], [k]: v }; return { ...m, points: pts }; });

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

  return (
    <>
      <div className={CARD}>
        <div className={CARD_HEADER}>
          <div className="flex items-center gap-2.5">
            <SectionIcon iconBg="#ede9fe" iconColor="#8b5cf6" Icon={MdPeople} />
            <p className="text-sm font-bold text-zinc-900">Dashboard Schedule</p>
          </div>
          {items.length === 0 && (
            <button className={BTN_ADD} onClick={() => setModal({ points: [{ title: '', text: '' }] })}>
              <MdAdd size={13} /> Add
            </button>
          )}
        </div>
        <div className={CARD_BODY}>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-8 bg-zinc-100 rounded-lg animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className={EMPTY}>
              <p className="text-sm text-zinc-400">No dashboard schedule added</p>
              <button className="mt-2 text-sm font-semibold text-blue-600 hover:underline" onClick={() => setModal({ points: [{ title: '', text: '' }] })}>+ Add now</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id ?? idx}>
                  <ol className="space-y-2 mb-3">
                    {(item.points || []).map((pt, pi) => (
                      <li key={pi}>
                        <p className="text-sm font-semibold text-zinc-800">{pi + 1}. {pt.title}</p>
                        {pt.text && (
                          <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                            {pt.text.split('\n').filter(l => l.trim()).map((line, li) => (
                              <li key={li} className="text-xs text-zinc-500">{line}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                  <div className="flex gap-2">
                    <button className={BTN_EDIT} onClick={() => setModal({ id: item.id, points: item.points || [{ title: '', text: '' }] })}><MdEdit size={13} /> Edit</button>
                    <button className={BTN_DEL} onClick={async () => { if (!window.confirm('Delete?')) return; await apiPost('delete_exhibitor_dashboard_schedule.php', { id: item.id }); load(); }}><MdDelete size={13} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit Dashboard Schedule' : 'Add Dashboard Schedule'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {modal.points.map((pt, i) => (
              <div key={i} className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Point {i + 1}</p>
                  {modal.points.length > 1 && (
                    <button onClick={() => removePoint(i)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
                  )}
                </div>
                <input value={pt.title} onChange={e => updatePoint(i, 'title', e.target.value)} placeholder="Point heading *" className={INPUT} />
                <textarea value={pt.text} onChange={e => updatePoint(i, 'text', e.target.value)} placeholder="Point detail text" rows={3} className={TEXTAREA} />
              </div>
            ))}
            <button onClick={addPoint} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
              <MdAdd size={14} /> Add More Points
            </button>
          </div>
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving} saveLabel={modal.id ? 'Update' : 'Save'} />
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

  const load = () => { setLoad(true); apiFetch('get_latest_news.php').then(setItems).catch(() => setItems([])).finally(() => setLoad(false)); };
  useEffect(() => { load(); }, []);

  const addItem    = ()        => setModal(m => ({ ...m, news: [...m.news, { title: '', text: '', news_link: '' }] }));
  const removeItem = (i)       => setModal(m => ({ ...m, news: m.news.filter((_, idx) => idx !== i) }));
  const updateItem = (i, k, v) => setModal(m => { const n = [...m.news]; n[i] = { ...n[i], [k]: v }; return { ...m, news: n }; });

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

  return (
    <>
      <div className={CARD}>
        <div className={CARD_HEADER}>
          <div className="flex items-center gap-2.5">
            <SectionIcon iconBg="#fef3c7" iconColor="#d97706" Icon={MdNewspaper} />
            <p className="text-sm font-bold text-zinc-900">Latest News</p>
          </div>
          {items.length === 0 && (
            <button className={BTN_ADD} onClick={() => setModal({ news: [{ title: '', text: '', news_link: '' }] })}>
              <MdAdd size={13} /> Add
            </button>
          )}
        </div>
        <div className={CARD_BODY}>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className={EMPTY}>
              <p className="text-sm text-zinc-400">No latest news added</p>
              <button className="mt-2 text-sm font-semibold text-blue-600 hover:underline" onClick={() => setModal({ news: [{ title: '', text: '', news_link: '' }] })}>+ Add news</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id ?? idx} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                  {(item.news || [item]).map((n, ni) => (
                    <div key={ni} className="mb-2 last:mb-0">
                      <p className="text-sm font-semibold text-zinc-800">{n.title}</p>
                      {n.text && <p className="text-xs text-zinc-500 mt-0.5">{n.text}</p>}
                      {n.news_link && <a href={n.news_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">Read more →</a>}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <button className={BTN_EDIT} onClick={() => setModal({ id: item.id, news: item.news || [{ title: item.title || '', text: item.text || '', news_link: item.news_link || '' }] })}><MdEdit size={13} /> Edit</button>
                    <button className={BTN_DEL} onClick={async () => { if (!window.confirm('Delete?')) return; await apiPost('delete_latest_news.php', { id: item.id }); load(); }}><MdDelete size={13} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit Latest News' : 'Add Latest News'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {modal.news.map((n, i) => (
              <div key={i} className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Item {i + 1}</p>
                  {modal.news.length > 1 && <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>}
                </div>
                <input value={n.title} onChange={e => updateItem(i, 'title', e.target.value)} placeholder="Title *" className={INPUT} />
                <textarea value={n.text} onChange={e => updateItem(i, 'text', e.target.value)} placeholder="Description" rows={2} className={TEXTAREA} />
                <input value={n.news_link} onChange={e => updateItem(i, 'news_link', e.target.value)} placeholder="https://link (optional)" className={INPUT} />
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
              <MdAdd size={14} /> Add More
            </button>
          </div>
          <ModalActions onCancel={() => setModal(null)} onSave={handleSave} saving={saving} saveLabel={modal.id ? 'Update' : 'Save'} />
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
    { label: 'Stall No',    value: data?.stall_number   },
    { label: 'Category',    value: data?.stall_category },
    { label: 'Area',        value: data?.stall_area     },
    { label: 'Hall',        value: data?.hall           },
    { label: 'Company',     value: data?.company_name   },
  ];

  return (
    <div className={CARD}>
      <div className={CARD_HEADER}>
        <div className="flex items-center gap-2.5">
          <SectionIcon iconBg="#fce7f3" iconColor="#ec4899" Icon={MdTableChart} />
          <p className="text-sm font-bold text-zinc-900">Particulars</p>
        </div>
      </div>
      <div className={CARD_BODY}>
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-7 bg-zinc-100 rounded-md animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-zinc-500 w-24 shrink-0">{r.label}</span>
                <span className="text-sm text-zinc-800 font-medium text-right">{r.value || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Overview Tab ── */
export default function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventScheduleCard />
        <DashboardScheduleCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LatestNewsCard />
        <ParticularsCard />
      </div>
    </div>
  );
}
