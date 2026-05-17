"use client";
import React from "react";
import { Input, Select } from "@/components/ui";
import { PROVINCE_OPTIONS } from "@/constants/personForm";
import styles from "./EditUserDataModal.module.scss";

/**
 * @param {{
 *  formData: any;
 *  errors: any;
 *  isPersonAccount: boolean;
 *  onInputChange: (e: any) => void;
 *  onBlur: (e: any) => void;
 * }} props
 */
export default function PersonalDataTab({
  formData,
  errors,
  isPersonAccount,
  onInputChange,
  onBlur,
}) {
  return (
    <div className={styles.formContent}>
      <Input
        label={isPersonAccount ? "Nombre" : "Nombre de la empresa/parque"}
        name="firstName"
        value={formData.firstName}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder={isPersonAccount ? "Pepe" : "Tech Solutions SA"}
        rounded="none"
        error={errors.firstName}
      />
      {isPersonAccount ? (
        <Input
          label="Apellido"
          name="lastName"
          value={formData.lastName}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="Argento"
          rounded="none"
          error={errors.lastName}
        />
      ) : (
        <Input
          label="Representante"
          name="representative"
          value={formData.representative}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="María Elena Rodríguez"
          rounded="none"
          error={errors.representative}
        />
      )}
      <Input
        label="Teléfono"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="+54 9 221 123 4585"
        rounded="none"
        error={errors.phone}
      />
      <Select
        label="Provincia"
        name="province"
        value={formData.province || ""}
        onChange={(value) =>
          onInputChange({ target: { name: "province", value } })
        }
        onBlur={() =>
          onBlur({ target: { name: "province", value: formData.province } })
        }
        options={PROVINCE_OPTIONS}
        placeholder="Seleccionar provincia"
        rounded="none"
        className={styles.provinceSelect}
        useCustomSelectedStyle={true}
        error={errors.province}
      />
      {isPersonAccount ? (
        <Input
          label="Ciudad"
          name="city"
          value={formData.city}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="Azul"
          rounded="none"
          error={errors.city}
        />
      ) : (
        <Input
          label="Localidad"
          name="locality"
          value={formData.locality}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="La Plata"
          rounded="none"
          error={errors.locality}
        />
      )}
      {!isPersonAccount && (
        <Input
          label="Dirección"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="Calle 50 N° 123"
          rounded="none"
          error={errors.address}
        />
      )}
      <Input
        label="Rubro/Industria"
        name="industry"
        value={formData.industry}
        onChange={onInputChange}
        onBlur={onBlur}
        placeholder="Inmobiliario"
        rounded="none"
        error={errors.industry}
      />
      {isPersonAccount && (
        <Input
          label="Empresa"
          name="company"
          value={formData.company}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder="DELSUD"
          rounded="none"
          error={errors.company}
        />
      )}
    </div>
  );
}
