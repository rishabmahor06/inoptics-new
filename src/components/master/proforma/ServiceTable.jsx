import React from 'react';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

const parseOpts = (v) =>
  Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

export default function ServiceTable({ services, onEdit, onDelete, onAdd }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[13px] font-bold text-zinc-800">Invoice Services</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Define line items on proforma invoices</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
          <MdAdd size={14} /> Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-10 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-xl">
          No services configured yet
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['#', 'Service Name', 'Description', 'Invoice Columns', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((svc, i) => {
                const opts = parseOpts(svc.selectedOptions);
                return (
                  <tr key={svc.name || i} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-3 py-3 text-[12px] text-zinc-400 shrink-0">{i + 1}</td>
                    <td className="px-3 py-3 text-[13px] font-semibold text-zinc-800 max-w-32.5">{svc.name}</td>
                    <td className="px-3 py-3 text-[12px] text-zinc-500 max-w-35">
                      <span className="line-clamp-2">{svc.description || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      {opts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {opts.map(o => (
                            <span key={o} className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">{o}</span>
                          ))}
                        </div>
                      ) : <span className="text-zinc-300 text-[12px]">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => onEdit(svc)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          <MdEdit size={13} />
                        </button>
                        <button onClick={() => onDelete(svc.name)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                          <MdDelete size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
