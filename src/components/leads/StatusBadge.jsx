import React from 'react';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  const cls = status === 'Cold Lead' ? styles.cold
    : status === 'Hot Lead' ? styles.hot
    : styles.warm;

  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}
