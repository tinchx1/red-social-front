"use client";
import React from "react";
import styles from "./Toggle.module.scss";

/**
 * @param {{ 
 *   checked: boolean; 
 *   onChange: (checked: boolean) => void; 
 *   disabled?: boolean; 
 *   className?: string;
 *   id?: string;
 *   variant?: 'default' | 'community';
 * }} props
 */
export default function Toggle({ checked, onChange, disabled = false, className, id, variant = 'default' }) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const getToggleClasses = () => {
    const classes = [styles.toggle];
    if (checked) classes.push(styles["toggle--checked"]);
    if (disabled) classes.push(styles["toggle--disabled"]);
    if (variant === 'community') classes.push(styles["toggle--community"]);
    if (className) classes.push(className);
    return classes.join(" ");
  };

  return (
    <div
      className={getToggleClasses()}
      onClick={handleToggle}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb} />
      </div>
    </div>
  );
}
