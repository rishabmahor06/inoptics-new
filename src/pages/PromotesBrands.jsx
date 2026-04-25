import React, { useState, useEffect, useRef } from 'react';
import {
  MdEdit, MdDelete, MdAdd, MdClose, MdVideoLibrary, MdCampaign, MdUpload,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import CustomEditor from '../components/CustomEditor/CustomEditor';

const API = 'https://inoptics.in/api';

const SUB_TABS = [
  { id: 'hoardings',  label: 'HOARDINGS'   },
  { id: 'videowalls', label: 'VIDEO WALLS'  },
  { id: 'sms',        label: 'SMS'          },
  { id: 'whatsapp',   label: 'WHATSAPP'     },
];

const INPUT    = 'w-full h-9 px-3 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition';
const TEXTAREA = 'w-full px-3 py-2 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none transition';

const apiPost = (ep, body) =>
  fetch(`${API}/${ep}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());

const apiPostForm = (ep, fd) =>
  fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());

async function fetchArr(ep) {
  try {
    const json = await fetch(`${API}/${ep}`).then(r => r.json());
    if (Array.isArray(json)) return json;
    for (const k of ['data', 'records', 'items', 'result', 'results']) {
      if (Array.isArray(json?.[k])) return json[k];
    }
    return [];
  } catch { return []; }
}

async function fetchSingle(ep) {
  try {
    const json = await fetch(`${API}/${ep}`).then(r => r.json());
    if (Array.isArray(json)) return json[0] ?? null;
    for (const k of ['data', 'record', 'item', 'result']) {
      if (json?.[k] && typeof json[k] === 'object' && !Array.isArray(json[k])) return json[k];
    }
    return json ?? null;
  } catch { return null; }
}

/* ─── Modal ───────────────────────────────────────────── */
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'}`} style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 shrink-0">
          <p className="text-sm font-bold text-zinc-800">{title}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700">
            <MdClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saving, saveLabel = 'Save' }) {
  return (
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-100">
      <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors">Cancel</button>
      <button onClick={onSave} disabled={saving}
        className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-60">
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}

/* ─── Phone Preview ───────────────────────────────────── */
function PhonePreview({ lines }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!lines?.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % lines.length), 3500);
    return () => clearInterval(t);
  }, [lines?.length]);

  const now  = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const msg  = lines?.[idx] || 'Your promotional message will appear here';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
      {/* Case / outer frame */}
      <div style={{
        position: 'relative',
        width: 300,
        height: 580,
        borderRadius: 50,
        background: '#A1A1AA',
        padding: 9,
        boxShadow: 'none',
      }}>
        {/* Power button — right */}
        <div style={{ position: 'absolute', right: -5, top: 90, width: 5, height: 52, background: '#27272A', borderRadius: '0 4px 4px 0', boxShadow: '2px 0 4px rgba(0,0,0,0.2)' }} />
        {/* Silent switch — left */}
        <div style={{ position: 'absolute', left: -5, top: 62, width: 5, height: 22, background: '#27272A', borderRadius: '4px 0 0 4px' }} />
        {/* Volume up — left */}
        <div style={{ position: 'absolute', left: -5, top: 95, width: 5, height: 40, background: '#27272A', borderRadius: '4px 0 0 4px' }} />
        {/* Volume down — left */}
        <div style={{ position: 'absolute', left: -5, top: 145, width: 5, height: 40, background: '#27272A', borderRadius: '4px 0 0 4px' }} />

        {/* Screen */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: 42,
          overflow: 'hidden',
          backgroundImage: 'url(https://images.unsplash.com/photo-1620207418302-439b387441b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTk4MTAxNTF8&ixlib=rb-4.0.3&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Dynamic Island pill notch */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14 }}>
            <div style={{ width: 80, height: 22, background: '#000', borderRadius: 14 }} />
          </div>

          {/* Date */}
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 500, letterSpacing: 0.2 }}>{date}</p>
          </div>

          {/* Time */}
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <p style={{ color: '#fff', fontSize: 46, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>{time}</p>
          </div>

          {/* SMS notification bubble */}
          <div style={{
            margin: '18px 14px 0',
            background: 'rgba(255,255,255,0.96)',
            borderRadius: 18,
            padding: '10px 13px',
            boxShadow: 'none',
          }}>
            <p style={{ fontSize: 14, color: '#222', lineHeight: 1.55, margin: 0 }}>
              {msg.split('\n').map((l, i) => <span key={i}>{l}{i < msg.split('\n').length - 1 && <br />}</span>)}
            </p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Swipe footer */}
          <div style={{ textAlign: 'center', paddingBottom: 18 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, margin: 0 }}>Swipe up to unlock</p>
            <div style={{ width: 76, height: 4, background: 'rgba(255,255,255,0.35)', borderRadius: 2, margin: '8px auto 0' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Instructions Box ────────────────────────────────── */
function InstructionsBox({ title, htmlContent, onAdd, onEdit, onDelete }) {
  return (
    <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-zinc-800">{title}</p>
        <div className="flex gap-1.5">
          {!htmlContent ? (
            <button onClick={onAdd}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
              <MdAdd size={13} /> Add
            </button>
          ) : (
            <>
              <button onClick={onEdit} className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"><MdEdit size={13} /></button>
              <button onClick={onDelete} className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><MdDelete size={13} /></button>
            </>
          )}
        </div>
      </div>
      {htmlContent
        ? <div className="text-sm text-zinc-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        : <p className="text-sm text-zinc-400 italic">No content added yet.</p>
      }
    </div>
  );
}

/* ─── Plans Table ─────────────────────────────────────── */
const PLAN_COLS = [
  { key: 'plan_name',          label: 'Plan Name'          },
  { key: 'delivery_frequency', label: 'Delivery Frequency' },
  { key: 'description',        label: 'Description'        },
  { key: 'price',              label: 'Price'              },
];

function PlansTable({ plans, loading, onEdit, onDelete, selectedId, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full">
        <thead className="bg-zinc-800 text-white">
          <tr>
            {PLAN_COLS.map(c => (
              <th key={c.key} className="px-4 py-2.5 text-left text-sm font-semibold whitespace-nowrap">{c.label}</th>
            ))}
            <th className="px-4 py-2.5 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <tr key={i} className="border-t border-zinc-100">
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-zinc-100 rounded animate-pulse" /></td>
                ))}
              </tr>
            ))
          ) : plans.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">No plans added yet</td></tr>
          ) : plans.map((row, i) => (
            <tr key={row.id ?? i} className={`border-t border-zinc-100 transition-colors ${selectedId === row.id ? 'bg-blue-50' : 'hover:bg-zinc-50'}`}>
              {PLAN_COLS.map(c => (
                <td key={c.key} className="px-4 py-2.5 text-sm text-zinc-700">{row[c.key] ?? '—'}</td>
              ))}
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => onEdit(row)} className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"><MdEdit size={13} /></button>
                  <button onClick={() => onDelete(row.id)} className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><MdDelete size={13} /></button>
                  <button
                    onClick={() => onSelect(selectedId === row.id ? null : row)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors
                      ${selectedId === row.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}>
                    {selectedId === row.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Plan Slide Panel ────────────────────────────────── */
function PlanSlide({ plan, msgType, onClose }) {
  const [msg, setMsg]       = useState('');
  const [saving, setSaving] = useState(false);

  const price     = parseFloat(plan?.price || 0);
  const gst       = price * 0.18;
  const total     = price + gst;
  const charCount = msg.length;
  const smsUnits  = charCount > 0 ? Math.ceil(charCount / 160) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPost(`save_${msgType.toLowerCase()}_message.php`, { plan_id: plan.id, message: msg });
      toast.success('Message saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-800">
        <p className="text-sm font-bold text-white">Selected Plan: {plan.plan_name}</p>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 text-white/70 hover:text-white transition-colors">
          <MdClose size={15} />
        </button>
      </div>
      <div className="p-5 bg-zinc-50 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm font-bold text-zinc-700 mb-2.5">Plan Details</p>
            <div className="space-y-1.5">
              {[['Plan', plan.plan_name], ['Frequency', plan.delivery_frequency], ['Description', plan.description], ['Price', `₹${price.toFixed(2)}`]].map(([k, v]) => (
                <div key={k} className="flex text-sm gap-2">
                  <span className="font-semibold text-zinc-500 w-24 shrink-0">{k}:</span>
                  <span className="text-zinc-700">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-700 mb-2">Compose {msgType} Message</p>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={6}
              placeholder={`Enter your ${msgType} message here...`} className={TEXTAREA} />
            {msgType === 'SMS' && charCount > 0 && (
              <p className="text-xs text-zinc-400 mt-1">
                {charCount} chars · counted as {smsUnits} message{smsUnits !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Message'}
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm font-bold text-zinc-700 mb-3">Particulars</p>
            {msgType === 'SMS' && (
              <p className="text-xs text-zinc-400 italic mb-3">* Messages over 160 characters are charged as multiple messages.</p>
            )}
            <div className="space-y-2">
              {[['Plan Selected', plan.plan_name], ['Price', `₹${price.toFixed(2)}`], ['GST (18%)', `₹${gst.toFixed(2)}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{k}</span>
                  <span className="font-semibold text-zinc-800">{v}</span>
                </div>
              ))}
              <hr className="border-zinc-100" />
              <div className="flex justify-between font-bold text-base"><span>GRAND TOTAL</span><span>₹{total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm font-bold text-zinc-700 mb-3">Company Info</p>
            <div className="space-y-1.5">
              {[['Company', 'ABC Exhibitors Pvt. Ltd.'], ['Stall No', 'A-101'], ['Category', 'Bare Space A++'], ['Area', '18.00 sqm']].map(([k, v]) => (
                <div key={k} className="flex text-sm gap-2">
                  <span className="font-semibold text-zinc-500 w-20 shrink-0">{k}:</span>
                  <span className="text-zinc-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HOARDINGS ───────────────────────────────────────── */
function HoardingsSection() {
  return (
    <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-xl">
      <MdCampaign size={44} className="text-zinc-300 mx-auto mb-3" />
      <p className="text-sm font-semibold text-zinc-400">Hoardings</p>
      <p className="text-xs text-zinc-300 mt-1">Content coming soon</p>
    </div>
  );
}

/* ─── VIDEO WALLS ─────────────────────────────────────── */
function VideoWallsSection() {
  const [instruction, setInstruction] = useState('');
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState('');
  const [saving, setSaving]           = useState(false);
  const [videoFile, setVideoFile]     = useState(null);
  const [uploading, setUploading]     = useState(false);
  const fileRef                       = useRef(null);

  useEffect(() => {
    /* API returns array of HTML strings: ["<p>...</p>"] */
    fetch(`${API}/get_video_wall_instruction.php`)
      .then(r => r.json())
      .then(d => {
        const content = Array.isArray(d)
          ? (typeof d[0] === 'string' ? d[0] : (d[0]?.content || ''))
          : (d?.content || '');
        setInstruction(content);
      })
      .catch(() => {});
  }, []);

  const handleSaveInstr = async () => {
    if (!form.trim()) { toast.error('Content cannot be empty'); return; }
    setSaving(true);
    try {
      /* If instruction exists → update, else → add */
      const ep = instruction ? 'update_video_wall_instruction.php' : 'add_video_wall_instruction.php';
      await apiPost(ep, { content: form });
      toast.success('Saved'); setInstruction(form); setModal(null);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteInstr = async () => {
    if (!window.confirm('Delete instruction?')) return;
    try {
      await apiPost('delete_video_wall_instruction.php', { action: 'delete_latest' });
      toast.success('Deleted'); setInstruction('');
    } catch { toast.error('Delete failed'); }
  };

  const handleUpload = async () => {
    if (!videoFile) { toast.error('Select a video file'); return; }
    const fd = new FormData();
    fd.append('video', videoFile);
    setUploading(true);
    try {
      await apiPostForm('upload_video_wall_video.php', fd);
      toast.success('Video uploaded'); setVideoFile(null);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-black aspect-video">
            <iframe className="w-full h-full"
              src="https://www.youtube.com/embed/udqRmfMC_0A"
              title="Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
          <div
            className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            onClick={() => fileRef.current?.click()}>
            <MdVideoLibrary size={32} className="text-zinc-400 mx-auto mb-2" />
            {videoFile
              ? <p className="text-sm font-semibold text-blue-600">{videoFile.name}</p>
              : <>
                  <p className="text-sm text-zinc-500">Click to select a video</p>
                  <p className="text-xs text-zinc-400 mt-0.5">MP4, MOV, AVI — landscape or portrait</p>
                </>
            }
            <input ref={fileRef} type="file" accept="video/*" className="hidden"
              onChange={e => setVideoFile(e.target.files[0])} />
          </div>
          {videoFile && (
            <button onClick={handleUpload} disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-60">
              <MdUpload size={16} /> {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          )}
        </div>
        <div>
          <InstructionsBox
            title="Video Wall Instructions"
            htmlContent={instruction}
            onAdd={() => { setForm(''); setModal('edit'); }}
            onEdit={() => { setForm(instruction); setModal('edit'); }}
            onDelete={handleDeleteInstr}
          />
        </div>
      </div>

      {modal === 'edit' && (
        <Modal wide title={instruction ? 'Edit Instructions' : 'Add Instructions'} onClose={() => setModal(null)}>
          <CustomEditor
            value={form}
            onChange={setForm}
            placeholder="Write video wall instructions here..."
          />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSaveInstr} saving={saving}
            saveLabel={instruction ? 'Update' : 'Save'} />
        </Modal>
      )}
    </>
  );
}

/* ─── Messaging (SMS / WhatsApp) ──────────────────────── */
const PREVIEW_MSGS = [
  '{BRAND}: Big news, {NAME}! 🚀 {OFFER} starts now at {EVENT}. Visit Booth {BOOTH_NO} today. Details: {SHORT_URL} STOP=opt‑out',
  '{BRAND}: Last chance! ⏰ {OFFER} ends tomorrow. Drop by Booth {BOOTH_NO} & save. See you! STOP=opt‑out',
  'Heads‑up, {NAME}! {BRAND} unveils {NEW_PRODUCT} on {EVENT_DATE}. Stay tuned—exclusive perks ahead. STOP=opt‑out',
  '{BRAND}: It’s live! 🎁 Grab {OFFER} at Booth {BOOTH_NO}. First 100 visitors get a bonus gift. Info: {SHORT_URL} STOP=opt‑out',
  '{BRAND}: Thanks for the buzz yesterday! Haven’t visited yet? Booth {BOOTH_NO} open till {END_DATE}. Don’t miss {OFFER}. STOP=opt‑out',
];



/* Endpoint config per type — matches actual API file names */
const TYPE_CONFIG = {
  SMS: {
    getPlans:        'get_sms_table.php',
    addPlan:         'add_sms_table.php',
    updatePlan:      'update_sms_table.php',      // expects { id, key, value }
    deletePlan:      'delete_sms_table.php',
    getInstr:        'get_sms_instruction.php',   // returns array of HTML strings
    addInstr:        'add_sms_instruction.php',
    updateInstr:     'update_sms_instruction.php',
    deleteInstr:     'delete_sms_instruction.php',
    deleteInstrBody: () => ({ action: 'delete_latest' }),
  },
  WhatsApp: {
    getPlans:        'get_whatsapp_table.php',
    addPlan:         'add_whatsapp_table.php',
    updatePlan:      'update_whatsapp_table.php',  // expects { id, key, value }
    deletePlan:      'delete_whatsapp_table.php',
    getInstr:        'get_whatsapp_instruction.php', // returns { success, content }
    addInstr:        'add_whatsapp_instruction.php',
    updateInstr:     'update_whatsapp_instruction.php',
    deleteInstr:     'delete_whatsapp_instruction.php',
    deleteInstrBody: () => ({ action: 'delete_latest' }),
  },
};

const EMPTY_PLAN = { plan_name: '', delivery_frequency: '', description: '', price: '' };

function MessagingSection({ type }) {
  const cfg = TYPE_CONFIG[type];

  const [instruction, setInstruction]   = useState('');
  const [instrModal, setInstrModal]     = useState(null);
  const [instrForm, setInstrForm]       = useState('');
  const [instrSaving, setInstrSaving]   = useState(false);

  const [plans, setPlans]               = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planModal, setPlanModal]       = useState(null);
  const [planForm, setPlanForm]         = useState(EMPTY_PLAN);
  const [planSaving, setPlanSaving]     = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    /* SMS returns array of HTML strings ["<p>...</p>"]
       WhatsApp returns { success: true, content: "..." } */
    fetch(`${API}/${cfg.getInstr}`)
      .then(r => r.json())
      .then(d => {
        let content = '';
        if (Array.isArray(d)) {
          content = typeof d[0] === 'string' ? d[0] : (d[0]?.content || d[0]?.instruction || '');
        } else {
          content = d?.content || d?.instruction || '';
        }
        setInstruction(content);
      })
      .catch(() => {});
    loadPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlans = async () => {
    setPlansLoading(true);
    try { setPlans(await fetchArr(cfg.getPlans)); }
    catch { setPlans([]); }
    finally { setPlansLoading(false); }
  };

  const handleSaveInstr = async () => {
    if (!instrForm.trim()) { toast.error('Content cannot be empty'); return; }
    setInstrSaving(true);
    try {
      const ep = instruction ? cfg.updateInstr : cfg.addInstr;
      await apiPost(ep, { content: instrForm });
      toast.success('Saved'); setInstruction(instrForm); setInstrModal(null);
    } catch { toast.error('Save failed'); }
    finally { setInstrSaving(false); }
  };

  const handleDeleteInstr = async () => {
    if (!window.confirm('Delete this content?')) return;
    try {
      await apiPost(cfg.deleteInstr, cfg.deleteInstrBody());
      toast.success('Deleted'); setInstruction('');
    } catch { toast.error('Delete failed'); }
  };

  const handleSavePlan = async () => {
    if (!planForm.plan_name?.trim()) { toast.error('Plan name is required'); return; }
    setPlanSaving(true);
    try {
      if (planModal?.id) {
        /* API expects { id, key, value } — one call per field */
        await Promise.all(
          Object.entries(planForm).map(([key, value]) =>
            apiPost(cfg.updatePlan, { id: planModal.id, key, value })
          )
        );
        toast.success('Plan updated');
      } else {
        await apiPost(cfg.addPlan, planForm);
        toast.success('Plan added');
      }
      setPlanModal(null); setPlanForm(EMPTY_PLAN); loadPlans();
    } catch { toast.error('Save failed'); }
    finally { setPlanSaving(false); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await apiPost(cfg.deletePlan, { id });
      toast.success('Deleted');
      if (selectedPlan?.id === id) setSelectedPlan(null);
      loadPlans();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        <div className="w-full lg:w-full xl:w-[400px] mx-auto">
          <PhonePreview lines={PREVIEW_MSGS} />
        </div>
        <div className="space-y-5">
          <InstructionsBox
            title={`Ready to Make Some Noise with ${type}?`}
            htmlContent={instruction}
            onAdd={() => { setInstrForm(''); setInstrModal('edit'); }}
            onEdit={() => { setInstrForm(instruction); setInstrModal('edit'); }}
            onDelete={handleDeleteInstr}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-zinc-800">Choose Your Messaging Plan</p>
              <button onClick={() => { setPlanForm(EMPTY_PLAN); setPlanModal({}); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                <MdAdd size={13} /> Add Plan
              </button>
            </div>
            <PlansTable
              plans={plans}
              loading={plansLoading}
              onEdit={row => {
                setPlanForm({ plan_name: row.plan_name, delivery_frequency: row.delivery_frequency, description: row.description, price: row.price });
                setPlanModal({ id: row.id });
              }}
              onDelete={handleDeletePlan}
              selectedId={selectedPlan?.id ?? null}
              onSelect={plan => setSelectedPlan(plan)}
            />
          </div>
          {selectedPlan && (
            <PlanSlide plan={selectedPlan} msgType={type} onClose={() => setSelectedPlan(null)} />
          )}
        </div>
      </div>

      {instrModal && (
        <Modal wide title={instruction ? `Edit ${type} Content` : `Add ${type} Content`} onClose={() => setInstrModal(null)}>
          <CustomEditor
            value={instrForm}
            onChange={setInstrForm}
            placeholder="Write your message content here..."
          />
          <ModalActions onCancel={() => setInstrModal(null)} onSave={handleSaveInstr} saving={instrSaving}
            saveLabel={instruction ? 'Update' : 'Save'} />
        </Modal>
      )}

      {planModal !== null && (
        <Modal title={planModal?.id ? 'Edit Plan' : 'Add Plan'} onClose={() => setPlanModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Plan Name *</label>
              <input value={planForm.plan_name} onChange={e => setPlanForm(p => ({ ...p, plan_name: e.target.value }))}
                placeholder="e.g. Weekly Boost" className={INPUT} />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Delivery Frequency</label>
              <input value={planForm.delivery_frequency} onChange={e => setPlanForm(p => ({ ...p, delivery_frequency: e.target.value }))}
                placeholder="e.g. 5 messages / week" className={INPUT} />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Description</label>
              <textarea value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Plan description" className={TEXTAREA} />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Price (₹)</label>
              <input value={planForm.price} onChange={e => setPlanForm(p => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 5000" type="number" min="0" className={INPUT} />
            </div>
          </div>
          <ModalActions onCancel={() => setPlanModal(null)} onSave={handleSavePlan} saving={planSaving}
            saveLabel={planModal?.id ? 'Update' : 'Add Plan'} />
        </Modal>
      )}
    </>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function PromotesBrands() {
  const [sub, setSub] = useState('hoardings');

  return (
    <div className="p-2 lg:p-3">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-zinc-100 [scrollbar-width:none]">
          {SUB_TABS.map(t => {
            const active = sub === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSub(t.id)}
                className={`relative px-5 py-3.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium
                  ${active ? 'font-bold text-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}>
                {t.label}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${active ? 'bg-zinc-900' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5">
          {sub === 'hoardings'  && <HoardingsSection />}
          {sub === 'videowalls' && <VideoWallsSection />}
          {sub === 'sms'        && <MessagingSection type="SMS" />}
          {sub === 'whatsapp'   && <MessagingSection type="WhatsApp" />}
        </div>
      </div>
    </div>
  );
}
