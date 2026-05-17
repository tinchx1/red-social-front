"use client";
import React from 'react';
import styles from './PaymentPill.module.scss';

/**
 * @param {{ status: string }} props
 */
const PaymentPill = ({ status }) => {
  const getPillConfig = () => {
    if (status === 'paid' || status === 'completed') {
      return {
        className: styles.paymentPillPaid,
        label: 'Pagado',
        dotColor: '#34C759'
      };
    }
    
    if (status === 'pending') {
      return {
        className: styles.paymentPillPending,
        label: 'Pendiente',
        dotColor: '#FF9500'
      };
    }
    
    return {
      className: styles.paymentPillPending,
      label: 'Pendiente',
      dotColor: '#FF9500'
    };
  };

  const config = getPillConfig();

  return (
    <span className={`${styles.paymentPill} ${config.className}`}>
      <span className={styles.paymentDot} style={{ backgroundColor: config.dotColor }} />
      {config.label}
    </span>
  );
};

export default PaymentPill;




