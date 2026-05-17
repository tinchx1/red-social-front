"use client";
import React from "react";
import { Input } from "@/components/ui";
import PasswordRequirements from "@/components/auth/PasswordRequirements/PasswordRequirements";
import styles from "./EditUserDataModal.module.scss";

/**
 * @param {{
 *  formData: any;
 *  errors: any;
 *  onInputChange: (e: any) => void;
 *  onBlur: (e: any) => void;
 * }} props
 */
export default function PasswordTab({
  formData,
  errors,
  onInputChange,
  onBlur,
}) {
  return (
    <div className={styles.formContent}>
      <Input
        label="Contraseña actual"
        name="currentPassword"
        type="password"
        value={formData.currentPassword}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="••••••••"
        showPasswordToggle
        rounded="none"
        error={errors.currentPassword}
      />
      <Input
        label="Nueva contraseña"
        name="newPassword"
        type="password"
        value={formData.newPassword}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="••••••••"
        showPasswordToggle
        rounded="none"
        error={errors.newPassword}
      />
      <Input
        label="Confirmar nueva contraseña"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="••••••••"
        showPasswordToggle
        rounded="none"
        error={errors.confirmPassword}
      />
      <PasswordRequirements password={formData.newPassword} />
    </div>
  );
}
