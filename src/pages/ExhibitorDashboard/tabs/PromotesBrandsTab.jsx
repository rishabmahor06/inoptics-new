import React, { useState, useEffect, useRef } from 'react';
import {
  MdEdit, MdDelete, MdAdd, MdClose, MdVideoLibrary, MdCampaign, MdUpload,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { API, apiPost, apiPostForm, Modal, ModalActions } from '../shared';

const SUB_TABS = [
  { id: 'hoardings',  label: 'HOARDINGS'   },
  { id: 'videowalls', label: 'VIDEO WALLS'  },
  { id: 'sms',        label: 'SMS'          },
  { id: 'whatsapp',   label: 'WHATSAPP'     },
];

const INPUT    = 'w-full h-9 px-3 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition';
const TEXTAREA = 'w-full px-3 py-2 text-sm border border-zinc-200 rounded-md bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 resize-none transition';

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

/* ─── Phone Preview ───────────────────────────────────── */
function PhonePreview({ lines }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!lines?.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % lines.length), 3500);
    return () => clearInterval(t);
  }, [lines?.length]);

  const now    = new Date();
  const time   = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const date   = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const msg    = lines?.[idx] || 'Your promotional message will appear here';

  return (
    <div className="flex justify-center py-4">
      <div className="relative w-44 rounded-[2.2rem] p-1.5 shadow-2xl border-[3px] border-zinc-800 bg-zinc-900" style={{ height: '22rem' }}>
        <div className="absolute right-[-3px] top-16 w-1 h-10 bg-zinc-700 rounded-l" />
        <div className="absolute left-[-3px] top-20 w-1 h-7 bg-zinc-700 rounded-r" />
        <div className="absolute left-[-3px] top-32 w-1 h-7 bg-zinc-700 rounded-r" />
        <div className="w-full h-full rounded-[1.8rem] overflow-hidden flex flex-col bg-gradient-to-b from-slate-800 to-slate-700">
          <div className="flex justify-center pt-2.5">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
          </div>
          <div className="text-center mt-1.5">
            <p className="text-white/60 text-[7px]">{date}</p>
            <p className="text-white font-bold text-xl leading-tight">{time}</p>
          </div>
          <div className="flex-1 flex items-center px-3">
            <div className="bg-white/15 rounded-xl p-2.5 text-white text-[8px] leading-relaxed w-full">
              {msg.split('\n').map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <div className="text-center pb-3">
            <p className="text-white/40 text-[7px]">Swipe up to unlock</p>
            <div className="w-7 h-0.5 bg-white/20 rounded-full mx-auto mt-1" />
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
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">No plans added yet</td>
            </tr>
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
                      ${selectedId === row.id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}>
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

  const price      = parseFloat(plan?.price || 0);
  const gst        = price * 0.18;
  const total      = price + gst;
  const charCount  = msg.length;
  const smsUnits   = charCount > 0 ? Math.ceil(charCount / 160) : 0;

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
        {/* Compose */}
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
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={6}
              placeholder={`Enter your ${msgType} message here...`}
              className={TEXTAREA}
            />
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
        {/* Particulars */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm font-bold text-zinc-700 mb-3">Particulars</p>
            {msgType === 'SMS' && (
              <p className="text-xs text-zinc-400 italic mb-3">* Messages exceeding 160 characters are charged as multiple messages.</p>
            )}
            <div className="space-y-2">
              {[['Plan Selected', plan.plan_name], ['Price', `₹${price.toFixed(2)}`], ['GST (18%)', `₹${gst.toFixed(2)}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{k}</span>
                  <span className="font-semibold text-zinc-800">{v}</span>
                </div>
              ))}
              <hr className="border-zinc-100" />
              <div className="flex justify-between font-bold text-base">
                <span>GRAND TOTAL</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
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
  const [instrId, setInstrId]         = useState(null);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState('');
  const [saving, setSaving]           = useState(false);
  const [videoFile, setVideoFile]     = useState(null);
  const [uploading, setUploading]     = useState(false);
  const fileRef                       = useRef(null);

  useEffect(() => {
    fetchSingle('get_video_wall_instruction.php').then(d => {
      if (d) { setInstruction(d.content || d.instruction || ''); setInstrId(d.id); }
    });
  }, []);

  const handleSaveInstr = async () => {
    setSaving(true);
    try {
      if (instrId) {
        await apiPost('update_video_wall_instruction.php', { id: instrId, content: form });
      } else {
        await apiPost('add_video_wall_instruction.php', { content: form });
      }
      toast.success('Saved');
      setInstruction(form); setModal(null);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteInstr = async () => {
    if (!window.confirm('Delete instruction?')) return;
    try {
      await apiPost('delete_video_wall_instruction.php', { id: instrId });
      toast.success('Deleted'); setInstruction(''); setInstrId(null);
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
        {/* Left: embed + upload */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-black aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/udqRmfMC_0A"
              title="Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
        {/* Right: instructions */}
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
        <Modal title={instrId ? 'Edit Instructions' : 'Add Instructions'} onClose={() => setModal(null)}>
          <textarea
            value={form}
            onChange={e => setForm(e.target.value)}
            rows={10}
            placeholder="Enter instructions (HTML supported)"
            className={TEXTAREA}
          />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSaveInstr} saving={saving}
            saveLabel={instrId ? 'Update' : 'Save'} />
        </Modal>
      )}
    </>
  );
}

/* ─── Messaging (SMS / WhatsApp) ──────────────────────── */
const PREVIEW_MSGS = [
  'Hi! Join us at the exhibition.\nVisit us at Stall A-101.\nDon\'t miss out!',
  'Exclusive deals await you.\nConnect with industry leaders.\nSee you there!',
];

function MessagingSection({ type }) {
  const slug = type.toLowerCase();

  const [instruction, setInstruction]     = useState('');
  const [instrId, setInstrId]             = useState(null);
  const [instrModal, setInstrModal]       = useState(null);
  const [instrForm, setInstrForm]         = useState('');
  const [instrSaving, setInstrSaving]     = useState(false);

  const [plans, setPlans]                 = useState([]);
  const [plansLoading, setPlansLoading]   = useState(false);
  const [planModal, setPlanModal]         = useState(null);
  const [planForm, setPlanForm]           = useState({ plan_name: '', delivery_frequency: '', description: '', price: '' });
  const [planSaving, setPlanSaving]       = useState(false);

  const [selectedPlan, setSelectedPlan]   = useState(null);

  useEffect(() => {
    fetchSingle(`get_${slug}_instruction.php`).then(d => {
      if (d) { setInstruction(d.content || d.instruction || d.message || ''); setInstrId(d.id); }
    });
    loadPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlans = async () => {
    setPlansLoading(true);
    try { setPlans(await fetchArr(`get_${slug}_plans.php`)); }
    catch { setPlans([]); }
    finally { setPlansLoading(false); }
  };

  const handleSaveInstr = async () => {
    setInstrSaving(true);
    try {
      if (instrId) {
        await apiPost(`update_${slug}_instruction.php`, { id: instrId, content: instrForm });
      } else {
        await apiPost(`add_${slug}_instruction.php`, { content: instrForm });
      }
      toast.success('Saved');
      setInstruction(instrForm); setInstrModal(null);
    } catch { toast.error('Save failed'); }
    finally { setInstrSaving(false); }
  };

  const handleDeleteInstr = async () => {
    if (!window.confirm('Delete?')) return;
    try {
      await apiPost(`delete_${slug}_instruction.php`, { id: instrId });
      toast.success('Deleted'); setInstruction(''); setInstrId(null);
    } catch { toast.error('Delete failed'); }
  };

  const handleSavePlan = async () => {
    if (!planForm.plan_name?.trim()) { toast.error('Plan name is required'); return; }
    setPlanSaving(true);
    try {
      if (planModal?.id) {
        await apiPost(`update_${slug}_plan.php`, { id: planModal.id, ...planForm });
        toast.success('Plan updated');
      } else {
        await apiPost(`add_${slug}_plan.php`, planForm);
        toast.success('Plan added');
      }
      setPlanModal(null);
      setPlanForm({ plan_name: '', delivery_frequency: '', description: '', price: '' });
      loadPlans();
    } catch { toast.error('Save failed'); }
    finally { setPlanSaving(false); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await apiPost(`delete_${slug}_plan.php`, { id });
      toast.success('Deleted');
      if (selectedPlan?.id === id) setSelectedPlan(null);
      loadPlans();
    } catch { toast.error('Delete failed'); }
  };

  const emptyPlanForm = { plan_name: '', delivery_frequency: '', description: '', price: '' };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        {/* Phone preview */}
        <div className="w-full lg:w-52">
          <PhonePreview lines={PREVIEW_MSGS} />
        </div>

        {/* Right */}
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
              <button
                onClick={() => { setPlanForm(emptyPlanForm); setPlanModal({}); }}
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
        <Modal title={instrId ? `Edit ${type} Content` : `Add ${type} Content`} onClose={() => setInstrModal(null)}>
          <textarea
            value={instrForm}
            onChange={e => setInstrForm(e.target.value)}
            rows={10}
            placeholder="Enter content (HTML supported)"
            className={TEXTAREA}
          />
          <ModalActions onCancel={() => setInstrModal(null)} onSave={handleSaveInstr} saving={instrSaving}
            saveLabel={instrId ? 'Update' : 'Save'} />
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

/* ─── Main ────────────────────────────────────────────── */
export default function PromotesBrandsTab() {
  const [sub, setSub] = useState('hoardings');

  return (
    <div className="p-5 space-y-5">
      {/* Sub-tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`px-4 py-2 text-xs font-bold rounded-md border transition-colors
              ${sub === t.id
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'hoardings'  && <HoardingsSection />}
      {sub === 'videowalls' && <VideoWallsSection />}
      {sub === 'sms'        && <MessagingSection type="SMS" />}
      {sub === 'whatsapp'   && <MessagingSection type="WhatsApp" />}
    </div>
  );
}
