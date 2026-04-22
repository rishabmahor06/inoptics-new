import React from 'react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export function AddBtn({ onClick, label = 'Add' }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3.5 py-2 text-[13px] font-semibold hover:bg-blue-700 transition-colors">
      <MdAdd size={16} />{label}
    </button>
  );
}

export function EditBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-emerald-100 transition-colors">
      <MdEdit size={13} />Edit
    </button>
  );
}

export function DelBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-red-100 transition-colors">
      <MdDelete size={13} />Delete
    </button>
  );
}

export function WmModal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/80 rounded-b-2xl shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WmTable({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h}
                className="bg-zinc-900 text-zinc-100 px-4 py-3 text-left font-semibold text-[11px] tracking-wider uppercase whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="py-16 text-center">
                <div className="flex items-center justify-center gap-2 text-zinc-400">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-sm">Loading...</span>
                </div>
              </td>
            </tr>
          ) : empty ? (
            <tr>
              <td colSpan={headers.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">No records found</span>
                </div>
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function WmInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-300" />
  );
}

export function WmTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-300 resize-none" />
  );
}

export function WmFileInput({ onChange, accept = 'image/*', label = 'Choose file' }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <span className="px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg border border-blue-200 group-hover:bg-blue-100 transition-colors">
        {label}
      </span>
      <input type="file" accept={accept} onChange={onChange} className="hidden" />
      <span className="text-xs text-zinc-400">Click to browse</span>
    </label>
  );
}

export function SectionHeader({ title, count, children }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-800">{title}</h3>
        {count !== undefined && (
          <p className="text-xs text-zinc-400 mt-0.5">{count} record{count !== 1 ? 's' : ''}</p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 flex-wrap border-b border-zinc-200 mb-4">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2 text-[12.5px] font-semibold border-b-2 transition-all whitespace-nowrap mr-0.5
            ${active === t
              ? 'text-blue-700 border-blue-600'
              : 'text-zinc-500 border-transparent hover:text-zinc-800 hover:border-zinc-300'
            }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function TrRow({ children, index }) {
  return (
    <tr className={`hover:bg-zinc-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-700 ${className}`}>
      {children}
    </td>
  );
}

export function TdId({ children }) {
  return (
    <td className="px-4 py-3 border-b border-zinc-100 text-[12px] text-zinc-400 font-mono">
      #{children}
    </td>
  );
}

export function TdActions({ children }) {
  return (
    <td className="px-4 py-3 border-b border-zinc-100">
      <div className="flex items-center gap-1.5">{children}</div>
    </td>
  );
}

export function TdImage({ src, alt = '' }) {
  if (!src) return <td className="px-4 py-3 border-b border-zinc-100"><span className="text-zinc-300 text-xs">—</span></td>;
  return (
    <td className="px-4 py-3 border-b border-zinc-100">
      <img src={src} alt={alt} className="h-10 w-16 object-contain rounded-lg border border-zinc-100 bg-zinc-50" />
    </td>
  );
}

export function TdHtml({ html }) {
  return (
    <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
      <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: html || '' }} />
    </td>
  );
}

export function EmptyState({ message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
      <svg className="w-12 h-12 mb-3 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}
