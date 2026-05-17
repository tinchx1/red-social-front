"use client";

import styles from "./WarningLabel.module.scss";
import OctagonWarningIcon from "@/assets/octagon_warning.svg?react";

/**
 * @param {{
 *   text: string;
 *   className?: string;
 * }} props
 */
export default function WarningLabel({ text, className = "" }) {
  if (!text) return null;

  return (
    <div className={`${styles.container} ${className}`}>
      <OctagonWarningIcon className={styles.icon} />
      <span className={styles.text}>{text}</span>
    </div>
  );
}
