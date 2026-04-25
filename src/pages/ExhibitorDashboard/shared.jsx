import React from 'react';
import { MdClose, MdSave, MdAdd } from 'react-icons/md';

export const API = 'https://inoptics.in/api';

export const apiFetch = async (ep) => {
  const res  = await fetch(`${API}/${ep}`);
  const json = await res.json();
  if (Array.isArray(json)) return json;
  for (const k of ['data', 'records', 'items', 'result', 'results']) {
    if (Array.isArray(json?.[k])) return json[k];
  }
  const arr = Object.values(json || {}).find(Array.isArray);
  return arr ?? [];
};

export const apiPost = (ep, body) =>
  fetch(`${API}/${ep}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());

export const apiPostForm = (ep, fd) =>
  fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());

export function Modal({ title, onClose, wide = false, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${wide ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`}
        style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 shrink-0">
          <p className="text-[14px] font-bold text-zinc-800">{title}</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
            <MdClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function SectionShell({ icon: Icon, iconBg, iconColor, title, subtitle, onAdd, addLabel = 'Add', children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <Icon size={17} style={{ color: iconColor }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-zinc-800 leading-none">{title}</p>
            {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {onAdd && (
          <button onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <MdAdd size={14} /> {addLabel}
          </button>
        )}
      </div> */}
      <div className="p-5 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export function ModalActions({ onCancel, onSave, saving, saveLabel = 'Save' }) {
  return (
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-100">
      <button onClick={onCancel}
        className="px-4 py-2 text-[12px] font-semibold text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
        Cancel
      </button>
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
        <MdSave size={13} /> {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}
