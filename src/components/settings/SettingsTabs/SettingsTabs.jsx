"use client";
import React from "react";
import styles from "./SettingsTabs.module.scss";

/**
 * @param {{ activeTab: 'account' | 'plan'; onChange: (tab: 'account' | 'plan') => void }} props
 */
export default function SettingsTabs({ activeTab, onChange }) {
  return (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${
          activeTab === "account" ? styles.active : ""
        }`}
        onClick={() => onChange("account")}
      >
        Cuenta
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === "plan" ? styles.active : ""}`}
        onClick={() => onChange("plan")}
      >
        Pago y Plan
      </button>
    </div>
  );
}
