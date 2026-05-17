"use client";
import React from "react";
import { Input } from "@/components/ui";
import styles from "./EditUserDataModal.module.scss";

/**
 * @param {{
 *  formData: any;
 *  errors: any;
 *  onInputChange: (e: any) => void;
 *  onBlur: (e: any) => void;
 * }} props
 */
export default function EmailTab({ formData, errors, onInputChange, onBlur }) {
  return (
    <div className={styles.formContent}>
      <Input
        label="Correo electrónico actual"
        name="currentEmail"
        type="email"
        value={formData.email}
        disabled
        rounded="none"
        style={{ color: "#969696" }}
      />
      <Input
        label="Nuevo correo electrónico"
        name="newEmail"
        type="email"
        value={formData.newEmail}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="nuevo@empresa.com"
        rounded="none"
        error={errors.newEmail}
      />
      <p className={styles.emailNote}>
        *Se te enviará un mail de confirmación al nuevo correo electrónico.
      </p>
    </div>
  );
}
