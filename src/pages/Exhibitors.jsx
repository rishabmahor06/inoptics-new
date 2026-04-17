import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdDescription, MdVisibility, MdSearch } from 'react-icons/md';
import { useNavStore } from '../store/useNavStore';
import ExhibitorEditView from './exhibitorTab/ExhibitorEditView';

const API_URL = 'https://inoptics.in/api/get_exhibitors.php';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function detectBS(categories) {
  return categories.map(cat => {
    const c = (cat || '').toLowerCase();
    if (c.includes('bare')) return 'B';
    if (c.includes('shell')) return 'S';
    return '-';
  });
}

function StallBadge({ label }) {
  return (
    <span className="inline-block bg-sky-50 text-sky-600 border border-sky-200 rounded-md px-2 py-0.5 text-[12px] font-semibold mx-0.5 my-0.5 whitespace-nowrap">
      {label}
    </span>
  );
}

function BSBadge({ label }) {
  if (label === 'B') return (
    <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 border border-amber-200 rounded-md px-2 py-0.5 text-[12px] font-bold mx-0.5 my-0.5">B</span>
  );
  if (label === 'S') return (
    <span className="inline-flex items-center justify-center bg-green-100 text-green-700 border border-green-200 rounded-md px-2 py-0.5 text-[12px] font-bold mx-0.5 my-0.5">S</span>
  );
  return (
    <span className="inline-flex items-center justify-center bg-zinc-100 text-zinc-400 rounded-md px-2 py-0.5 text-[12px] font-bold mx-0.5 my-0.5">-</span>
  );
}

export default function Exhibitors() {
  const { editingExhibitor, setEditingExhibitor } = useNavStore();
  const [rawData,       setRawData]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [companySearch, setCompanySearch] = useState('');
  const [bsSearch,      setBsSearch]      = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => { setRawData(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (editingExhibitor) return <ExhibitorEditView />;

  const groupedMap = rawData.reduce((acc, row) => {
    const key = row.company_name;
    if (!acc[key]) acc[key] = { ...row, stall_nos: [], categories: [], stall_areas: [] };
    if (row.stall_no)   acc[key].stall_nos.push(row.stall_no);
    if (row.category)   acc[key].categories.push(row.category);
    if (row.stall_area) acc[key].stall_areas.push(row.stall_area);
    return acc;
  }, {});

  let grouped = Object.values(groupedMap);
  grouped.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
  grouped = grouped.map((row, i) => ({ ...row, _rowNum: i + 1 }));

  if (companySearch.trim()) {
    const q = companySearch.trim().toLowerCase();
    grouped = grouped.filter(r => (r.company_name || '').toLowerCase().includes(q));
  }
  if (bsSearch.trim()) {
    const q = bsSearch.trim().toUpperCase();
    grouped = grouped.filter(r => detectBS(r.categories).some(bs => bs === q));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-wrap gap-2.5 items-center">
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
          <MdSearch size={15} className="text-zinc-400 shrink-0" />
          <input
            className="bg-transparent outline-none text-[13px] text-zinc-800 w-44 placeholder:text-zinc-400 border-0"
            placeholder="Search company..."
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
          <input
            className="bg-transparent outline-none text-[13px] text-zinc-800 w-16 placeholder:text-zinc-400 border-0"
            placeholder="B / S"
            value={bsSearch}
            onChange={e => setBsSearch(e.target.value)}
          />
        </div>
        <span className="ml-auto text-[13px] text-zinc-400 font-medium">
          {grouped.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-zinc-400 text-sm">Loading exhibitors...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-sm">Error: {error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID', 'COMPANY NAME', 'STALL NO', 'STALL AREA', 'B/S', 'EMAIL', 'MOBILE', 'ACTION'].map(h => (
                  <th
                    key={h}
                    className="bg-zinc-900 text-white px-4 py-3 text-left font-semibold text-[11px] tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 text-sm">No exhibitors found.</td>
                </tr>
              ) : grouped.map((row, idx) => {
                const bsList  = detectBS(row.categories);
                const stallCh = chunk(row.stall_nos, 2);
                const areaCh  = chunk(row.stall_areas, 2);
                const bsCh    = chunk(bsList, 2);
                const accepted = row.undertaking_accepted === '1' || row.undertaking_accepted === 1;

                return (
                  <tr
                    key={row._rowNum}
                    className={`transition-colors hover:bg-zinc-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400 font-medium align-middle w-10">
                      {row._rowNum}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle min-w-48">
                      <span className="text-[13px] font-semibold text-zinc-900">{row.company_name}</span>
                    </td>

                    {/* Stall No */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle">
                      {stallCh.map((ch, ci) => (
                        <div key={ci} className="flex flex-wrap">
                          {ch.map((sn, si) => <StallBadge key={si} label={sn} />)}
                        </div>
                      ))}
                    </td>

                    {/* Stall Area */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle">
                      {areaCh.map((ch, ci) => (
                        <div key={ci} className="flex flex-wrap">
                          {ch.map((sa, si) => (
                            <span key={si} className="inline-block text-[13px] text-zinc-600 mr-2">{sa}</span>
                          ))}
                        </div>
                      ))}
                    </td>

                    {/* B/S */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle">
                      {bsCh.map((ch, ci) => (
                        <div key={ci} className="flex flex-wrap">
                          {ch.map((bs, si) => <BSBadge key={si} label={bs} />)}
                        </div>
                      ))}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle min-w-44">
                      <span className="text-[13px] text-zinc-600">{row.email}</span>
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle whitespace-nowrap">
                      <span className="text-[13px] text-zinc-700 font-medium">{row.mobile}</span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 border-b border-zinc-100 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setEditingExhibitor(row)}
                          className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-green-100 transition-colors cursor-pointer border-solid"
                        >
                          <MdEdit size={14} /> Edit
                        </button>
                        <button className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-red-100 transition-colors cursor-pointer border-solid">
                          <MdDelete size={14} /> Delete
                        </button>
                        <button className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer border-solid
                          ${accepted
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}>
                          <MdDescription size={14} /> Terms
                        </button>
                        <button className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-cyan-100 transition-colors cursor-pointer border-solid">
                          <MdVisibility size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
