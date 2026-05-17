"use client";
import React from "react";
import styles from "./StatusPill.module.scss";
import dayjs from "dayjs";

/**
 * @param {{ status: string; isPaused?: boolean; paymentStatus?: string; endDate?: string }} props
 */
const StatusPill = ({ status, isPaused = false, paymentStatus, endDate }) => {
  const getPillConfig = () => {
    if (isPaused) {
      return {
        className: styles.statusPillPaused,
        label: "Pausada",
        dotColor: "#FF9500",
      };
    }

    // Check if the ad has expired (past end date)
    if (endDate && dayjs(endDate).isBefore(dayjs(), 'day')) {
      return {
        className: styles.statusPillInactive,
        label: "Finalizado",
        dotColor: "#8E8E93",
      };
    }

    // If status is active but payment is pending, show as pending
    if (status === "active" && paymentStatus === "pending") {
      return {
        className: styles.statusPillPending,
        label: "Pendiente",
        dotColor: "#FF9500",
      };
    }

    if (status === "active") {
      return {
        className: styles.statusPillActive,
        label: "Activa",
        dotColor: "#34C759",
      };
    }

    if (status === "pending") {
      return {
        className: styles.statusPillPending,
        label: "Pendiente",
        dotColor: "#FF9500",
      };
    }
    return {
      className: styles.statusPillInactive,
      label: "Finalizado",
      dotColor: "#8E8E93",
    };
  };

  const config = getPillConfig();

  return (
    <span className={`${styles.statusPill} ${config.className}`}>
      <span
        className={styles.statusDot}
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
};

export default StatusPill;
