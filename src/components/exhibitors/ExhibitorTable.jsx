import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdDescription, MdVisibility } from 'react-icons/md';

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

export default function ExhibitorTable({
  companySearch = '',
  bsSearch = '',
  onEdit,
  onDelete,
  onTerms,
  onView,
}) {
  const [exhibitorData, setExhibitorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(r => r.json())
      .then(data => {
        setExhibitorData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Group by company_name
  const groupedMap = exhibitorData.reduce((acc, row) => {
    const key = row.company_name;
    if (!acc[key]) {
      acc[key] = {
        ...row,
        stall_nos: [],
        categories: [],
        stall_areas: [],
      };
    }
    if (row.stall_no)    acc[key].stall_nos.push(row.stall_no);
    if (row.category)    acc[key].categories.push(row.category);
    if (row.stall_area)  acc[key].stall_areas.push(row.stall_area);
    return acc;
  }, {});

  let grouped = Object.values(groupedMap);

  // Alphabetical sort by company_name
  grouped.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));

  // Assign row numbers after sort
  grouped = grouped.map((row, i) => ({ ...row, _rowNum: i + 1 }));

  // Filter
  if (companySearch.trim()) {
    const q = companySearch.trim().toLowerCase();
    grouped = grouped.filter(r => (r.company_name || '').toLowerCase().includes(q));
  }
  if (bsSearch.trim()) {
    const q = bsSearch.trim().toUpperCase();
    grouped = grouped.filter(r => detectBS(r.categories).some(bs => bs === q));
  }

  const styles = {
    wrapper: {
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      overflow: 'hidden',
    },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
      background: '#18181b',
      color: '#fff',
      padding: '10px 12px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '9px 12px',
      borderBottom: '1px solid #f0f0f0',
      color: '#3f3f46',
      verticalAlign: 'middle',
    },
    trEven: { background: '#fafafa' },
    trOdd: { background: '#fff' },
    badge: (bg, color) => ({
      display: 'inline-block',
      background: bg,
      color,
      borderRadius: 4,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 600,
      margin: '1px 2px',
    }),
    actionBtn: (bg, color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: bg,
      color,
      border: 'none',
      borderRadius: 6,
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      margin: '2px',
      whiteSpace: 'nowrap',
    }),
    centerMsg: {
      padding: '40px',
      textAlign: 'center',
      color: '#a1a1aa',
      fontSize: 14,
    },
  };

  if (loading) return <div style={styles.centerMsg}>Loading exhibitors...</div>;
  if (error)   return <div style={{ ...styles.centerMsg, color: '#ef4444' }}>Error: {error}</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'COMPANY NAME', 'STALL NO', 'STALL AREA', 'B/S', 'EMAIL', 'MOBILE', 'ACTION'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.centerMsg}>No exhibitors found.</td>
              </tr>
            ) : grouped.map((row, idx) => {
              const bsList   = detectBS(row.categories);
              const stallChunks = chunk(row.stall_nos, 2);
              const areaChunks  = chunk(row.stall_areas, 2);
              const bsChunks    = chunk(bsList, 2);
              const termsAccepted = row.undertaking_accepted === '1' || row.undertaking_accepted === 1;

              return (
                <tr key={row._rowNum} style={idx % 2 === 0 ? styles.trOdd : styles.trEven}>
                  <td style={styles.td}>{row._rowNum}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#18181b', minWidth: 160 }}>
                    {row.company_name}
                  </td>

                  {/* Stall No */}
                  <td style={styles.td}>
                    {stallChunks.map((ch, ci) => (
                      <div key={ci}>
                        {ch.map((sn, si) => (
                          <span key={si} style={styles.badge('#e0f2fe', '#0369a1')}>{sn}</span>
                        ))}
                      </div>
                    ))}
                  </td>

                  {/* Stall Area */}
                  <td style={styles.td}>
                    {areaChunks.map((ch, ci) => (
                      <div key={ci}>
                        {ch.map((sa, si) => (
                          <span key={si} style={styles.badge('#f3f4f6', '#374151')}>{sa}</span>
                        ))}
                      </div>
                    ))}
                  </td>

                  {/* B/S */}
                  <td style={styles.td}>
                    {bsChunks.map((ch, ci) => (
                      <div key={ci}>
                        {ch.map((bs, si) => (
                          <span key={si} style={styles.badge(
                            bs === 'B' ? '#fef3c7' : bs === 'S' ? '#dcfce7' : '#f3f4f6',
                            bs === 'B' ? '#92400e' : bs === 'S' ? '#166534' : '#6b7280',
                          )}>{bs}</span>
                        ))}
                      </div>
                    ))}
                  </td>

                  <td style={{ ...styles.td, minWidth: 140 }}>{row.email}</td>
                  <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{row.mobile}</td>

                  {/* Actions */}
                  <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                    <button
                      style={styles.actionBtn('#dcfce7', '#166534')}
                      onClick={() => onEdit && onEdit(row)}
                      title="Edit"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                    <button
                      style={styles.actionBtn('#fee2e2', '#dc2626')}
                      onClick={() => onDelete && onDelete(row)}
                      title="Delete"
                    >
                      <MdDelete size={14} /> Delete
                    </button>
                    <button
                      style={styles.actionBtn(
                        termsAccepted ? '#dbeafe' : '#fef9c3',
                        termsAccepted ? '#1d4ed8' : '#92400e',
                      )}
                      onClick={() => onTerms && onTerms(row)}
                      title="Terms"
                    >
                      <MdDescription size={14} /> Terms
                    </button>
                    <button
                      style={styles.actionBtn('#cffafe', '#0e7490')}
                      onClick={() => onView && onView(row)}
                      title="View"
                    >
                      <MdVisibility size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
