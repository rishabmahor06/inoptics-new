import React from 'react';
import { useNavStore } from '../../store/useNavStore';

export default function Stalls() {
  const { editingExhibitor: ex } = useNavStore();
  if (!ex) return null;

  const stalls = ex.stall_nos  || [];
  const areas  = ex.stall_areas || [];
  const cats   = ex.categories  || [];

  if (stalls.length === 0) {
    return <p className="text-sm text-zinc-400">No stall data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['#', 'Stall No', 'Stall Area (sqm)', 'Category'].map(h => (
              <th key={h} className="bg-zinc-900 text-white px-3.5 py-2.5 text-left font-semibold text-[12px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stalls.map((sn, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
              <td className="px-3.5 py-2.5 border-b border-zinc-100 text-zinc-500">{i + 1}</td>
              <td className="px-3.5 py-2.5 border-b border-zinc-100 font-semibold text-zinc-900">
                <span className="bg-sky-100 text-sky-700 rounded px-2 py-0.5 text-[12px]">{sn}</span>
              </td>
              <td className="px-3.5 py-2.5 border-b border-zinc-100 text-zinc-600">{areas[i] || '—'}</td>
              <td className="px-3.5 py-2.5 border-b border-zinc-100 text-zinc-600">{cats[i] || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
