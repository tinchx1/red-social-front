"use client";

import styles from "./AccountTypeTabs.module.scss";

/**
 * @param {{
 *   label?: string;
 *   value: string;
 *   options: { value: string; label: string }[];
 *   onChange: (value: string) => void;
 * }} props
 */
export default function AccountTypeTabs({ label, value, options, onChange }) {
  return (
    <div className={styles.wrapper}>
      {label && <p className={styles.label}>{label}</p>}
      <div className={styles.tabs}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}






