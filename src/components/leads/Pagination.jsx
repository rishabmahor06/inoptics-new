import React from 'react';
import styles from './Pagination.module.css';

const ChevLeft = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevRight = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function Pagination({ currentPage, totalPages, perPage, onPageChange, onPerPageChange }) {
  const pages = [1, 2, 3, 4, 5];

  return (
    <div className={styles.pagination}>
      <div className={styles.left}>
        <span className={styles.showLabel}>Show</span>
        <select
          className={styles.perPage}
          value={perPage}
          onChange={e => onPerPageChange(Number(e.target.value))}
        >
          {[5, 11, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className={styles.showLabel}>Leads per page</span>
      </div>

      <div className={styles.right}>
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevLeft />
        </button>

        {pages.map(p => (
          <button
            key={p}
            className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <span className={styles.dots}>...</span>

        <button
          className={`${styles.pageBtn} ${currentPage === totalPages ? styles.active : ''}`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>

        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevRight />
        </button>
      </div>
    </div>
  );
}
