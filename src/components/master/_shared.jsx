import React from 'react';

export const API = 'https://inoptics.in/api';

export const apiFetch = (ep) => fetch(`${API}/${ep}`).then(r => r.json());
export const apiPost  = (ep, data) =>
  fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const apiPostForm = (ep, fd) =>
  fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());

export function MasterTable({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="bg-zinc-900 text-zinc-100 px-4 py-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="py-14 text-center text-sm text-zinc-400">Loading...</td></tr>
          ) : empty ? (
            <tr><td colSpan={headers.length} className="py-14 text-center text-sm text-zinc-400">No records found</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

export function MasterTr({ children, index }) {
  return (
    <tr className={`hover:bg-zinc-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
      {children}
    </tr>
  );
}

export function MasterTd({ children, className = '' }) {
  return <td className={`px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-700 ${className}`}>{children}</td>;
}

export function MasterActions({ onEdit, onDelete }) {
  return (
    <td className="px-4 py-3 border-b border-zinc-100">
      <div className="flex gap-1.5">
        {onEdit && (
          <button onClick={onEdit}
            className="px-2.5 py-1.5 text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
            Edit
          </button>
        )}
        <button onClick={onDelete}
          className="px-2.5 py-1.5 text-[12px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
          Delete
        </button>
      </div>
    </td>
  );
}

export function MasterModal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-100 shrink-0">
          <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MasterField({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function MasterInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300" />
  );
}

export function SectionHead({ title, count, onAdd, addLabel = '+ Add', search, onSearch }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
        {count !== undefined && <p className="text-xs text-zinc-400 mt-0.5">{count} record{count !== 1 ? 's' : ''}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onSearch !== undefined && (
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search..."
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
        )}
        {onAdd && (
          <button onClick={onAdd}
            className="bg-blue-600 text-white rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
