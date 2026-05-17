import { SectorSelector, Input } from "@/components";
import Link from "next/link";
import {
  FIELD_LABELS,
  FIELD_PLACEHOLDERS,
  FORM_FIELDS,
} from "@/constants/personForm";
import { INTEREST_SECTORS } from "@/constants/sectors";
import styles from "./PersonForm.module.scss";

export default function PersonFormStage2({ formData, onInputChange, errors }) {
  const handleSectorSelect = (sector) => {
    try {
      const currentSectors = formData[FORM_FIELDS.SECTORES_INDUSTRIALES] || [];
      const isSelected = currentSectors.includes(sector);

      if (isSelected) {
        onInputChange(
          FORM_FIELDS.SECTORES_INDUSTRIALES,
          currentSectors.filter((s) => s !== sector)
        );
      } else {
        onInputChange(FORM_FIELDS.SECTORES_INDUSTRIALES, [
          ...currentSectors,
          sector,
        ]);
      }
    } catch (error) {
      console.error("Error selecting sector:", error);
      // You could show an error message here if you have a toast/notification system
    }
  };

  return (
    <>
      <div className={styles.formFieldsRow}>
        <div className={styles.leftColumn}>
          <div className={styles.formField}>
            <Input
              label={FIELD_LABELS.RUBRO_INDUSTRIA}
              value={formData[FORM_FIELDS.RUBRO_INDUSTRIA] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.RUBRO_INDUSTRIA, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.RUBRO_INDUSTRIA}
              required={true}
              error={errors[FORM_FIELDS.RUBRO_INDUSTRIA]}
              tabIndex={1}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.formField}>
            <Input
              label={FIELD_LABELS.EMPRESA}
              value={formData[FORM_FIELDS.EMPRESA] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.EMPRESA, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.EMPRESA}
              required={true}
              error={errors[FORM_FIELDS.EMPRESA]}
              tabIndex={2}
            />
          </div>
        </div>
      </div>

      <div className={styles.sectorSection}>
        <h3 className={styles.sectorTitle}>{FIELD_LABELS.SECTORES_INTERES}</h3>
        <SectorSelector
          sectors={INTEREST_SECTORS}
          selected={formData[FORM_FIELDS.SECTORES_INDUSTRIALES] || []}
          onSelect={handleSectorSelect}
          required
        />
        {errors?.[FORM_FIELDS.SECTORES_INDUSTRIALES] && (
          <span
            style={{ color: "#dc2626", fontSize: 12, fontFamily: "Roboto" }}
          >
            {errors[FORM_FIELDS.SECTORES_INDUSTRIALES]}
          </span>
        )}
      </div>

      <div className={styles.formField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData[FORM_FIELDS.ACEPTA_TERMINOS] || false}
            onChange={(e) =>
              onInputChange(FORM_FIELDS.ACEPTA_TERMINOS, e.target.checked)
            }
            className={styles.checkbox}
            required
          />
          <span className={styles.checkboxText}>
            Acepto los{" "}
            <Link
              href="/terminos-y-condiciones"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              política de privacidad
            </Link>
            *
          </span>
        </label>
        {errors?.[FORM_FIELDS.ACEPTA_TERMINOS] && (
          <span className={styles.checkboxError}>
            {errors[FORM_FIELDS.ACEPTA_TERMINOS]}
          </span>
        )}
      </div>
    </>
  );
}
