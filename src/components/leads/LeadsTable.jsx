import React, { useState } from 'react';
import styles from './LeadsTable.module.css';
import StatusBadge from './StatusBadge';
import SourceTag from './SourceTag';
import Pagination from './Pagination';
import { leadsData } from '../../data/leadsData';

const SortIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const columns = [
  { key: 'name', label: 'Leads' },
  { key: 'subject', label: 'Subject' },
  { key: 'activity', label: 'Activities' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'Created' },
  { key: 'source', label: 'Sources' },
];

export default function LeadsTable() {
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(11);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [viewMode, setViewMode] = useState('list');

  const totalPages = 16;
  const pagedData = leadsData.slice(0, perPage);

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const toggleAll = () =>
    setSelected(selected.length === pagedData.length ? [] : pagedData.map(l => l.id));

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span className={styles.toggleLabel}>List</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span className={styles.toggleLabel}>Grid</span>
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.toolbarBtn}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span className={styles.btnLabel}>Filter</span>
          </button>
          <button className={styles.toolbarBtn}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className={styles.btnLabel}>Export</span>
          </button>
          <button className={styles.addBtn}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className={styles.btnLabel}>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkTh}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selected.length === pagedData.length && pagedData.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {columns.map(col => (
                <th key={col.key} className={styles.th} onClick={() => handleSort(col.key)}>
                  <span className={styles.thInner}>
                    {col.label}
                    <span className={`${styles.sortIcon} ${sortKey === col.key ? styles.sortActive : ''}`}>
                      <SortIcon />
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((lead, idx) => (
              <tr
                key={lead.id}
                className={`${styles.row} ${selected.includes(lead.id) ? styles.rowSelected : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td className={styles.checkTd}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.includes(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    onClick={e => e.stopPropagation()}
                  />
                </td>
                <td className={styles.td}>
                  <div className={styles.leadCell}>
                    <img src={lead.avatar} alt={lead.name} className={styles.avatar} />
                    <span className={styles.leadName}>{lead.name}</span>
                  </div>
                </td>
                <td className={styles.td} data-label="Subject">
                  <span className={styles.subject}>{lead.subject}</span>
                </td>
                <td className={styles.td} data-label="Activity">
                  <div className={styles.activityCell}>
                    <span className={styles.activityIcon}><PhoneIcon /></span>
                    <span className={styles.activityText}>{lead.activity}</span>
                  </div>
                </td>
                <td className={styles.td} data-label="Status">
                  <StatusBadge status={lead.status} />
                </td>
                <td className={styles.td} data-label="Created">
                  <div className={styles.createdCell}>
                    <ClockIcon />
                    <span>{lead.created}</span>
                  </div>
                </td>
                <td className={styles.td} data-label="Source">
                  <SourceTag source={lead.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
}
