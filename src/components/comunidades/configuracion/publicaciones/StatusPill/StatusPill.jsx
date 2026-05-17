"use client";
import React from 'react';
import styles from './StatusPill.module.scss';

const StatusPill = ({ status }) => {
  const isApproved = status === 'approved';
  const pillClass = isApproved
    ? `${styles.statusPill} ${styles.statusPillApproved}`
    : `${styles.statusPill} ${styles.statusPillRejected}`;

  return (
    <span className={pillClass}>
      <span className={styles.statusDot} />
      {isApproved ? 'Activa' : 'Bloqueada'}
    </span>
  );
};

export default StatusPill;

