import React from "react";
import styles from "./SettingsCard.module.scss";

/**
 * @param {{ children: React.ReactNode; className?: string }} props
 */
export default function SettingsCard({ children, className }) {
  return <div className={`${styles.card} ${className || ""}`}>{children}</div>;
}
