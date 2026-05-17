import { Input, PasswordRequirements, Select } from "@/components";
import {
  PROVINCE_OPTIONS,
  FIELD_LABELS,
  FIELD_PLACEHOLDERS,
  FORM_FIELDS,
} from "@/constants/personForm";
import styles from "./PersonForm.module.scss";

export default function PersonFormStage1({ formData, onInputChange, errors }) {
  return (
    <div className={styles.formFieldsContainer}>
      {/* Mobile-only name section */}
      <div className={styles.mobileNameSection}>
        <div className={styles.formField}>
          <Input
            label={FIELD_LABELS.NOMBRE}
            value={formData[FORM_FIELDS.NOMBRE] || ""}
            onChange={(e) => onInputChange(FORM_FIELDS.NOMBRE, e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.NOMBRE}
            required={true}
            error={errors[FORM_FIELDS.NOMBRE]}
            tabIndex={1}
          />
        </div>
        <div className={styles.formField}>
          <Input
            label={FIELD_LABELS.APELLIDO}
            value={formData[FORM_FIELDS.APELLIDO] || ""}
            onChange={(e) =>
              onInputChange(FORM_FIELDS.APELLIDO, e.target.value)
            }
            placeholder={FIELD_PLACEHOLDERS.APELLIDO}
            required={true}
            error={errors[FORM_FIELDS.APELLIDO]}
            tabIndex={2}
          />
        </div>
      </div>
      <div className={styles.formFieldsRow}>
        <div className={styles.leftColumn}>
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label={FIELD_LABELS.NOMBRE}
              value={formData[FORM_FIELDS.NOMBRE] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.NOMBRE, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.NOMBRE}
              required={true}
              error={errors[FORM_FIELDS.NOMBRE]}
              tabIndex={1}
            />
          </div>
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label={FIELD_LABELS.CONTRASEÑA}
              type="password"
              showPasswordToggle={true}
              value={formData[FORM_FIELDS.CONTRASEÑA] || ""}
              onChange={(e) => {
                onInputChange(FORM_FIELDS.CONTRASEÑA, e.target.value);
                // Limpiar error de confirmación cuando cambia la contraseña principal
                if (errors[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]) {
                  onInputChange(
                    FORM_FIELDS.CONFIRMAR_CONTRASEÑA,
                    formData[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]
                  );
                }
              }}
              placeholder={FIELD_PLACEHOLDERS.CONTRASEÑA}
              required={true}
              error={errors[FORM_FIELDS.CONTRASEÑA]}
              tabIndex={3}
            />
          </div>
          <div className={styles.formField}>
            <Input
              id="email"
              label={FIELD_LABELS.EMAIL}
              type="email"
              value={formData[FORM_FIELDS.EMAIL] || ""}
              onChange={(e) => onInputChange(FORM_FIELDS.EMAIL, e.target.value)}
              placeholder={FIELD_PLACEHOLDERS.EMAIL}
              required={true}
              autoComplete="email"
              error={errors[FORM_FIELDS.EMAIL]}
              tabIndex={5}
            />
          </div>
          {/* Mobile-only telefono after email */}
          <div className={`${styles.formField} ${styles.mobileOnly}`}>
            <Input
              label={FIELD_LABELS.TELEFONO}
              type="number"
              min="0"
              value={formData[FORM_FIELDS.TELEFONO] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.TELEFONO, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.TELEFONO}
              required={true}
              error={errors[FORM_FIELDS.TELEFONO]}
              tabIndex={6}
            />
          </div>
          <div className={styles.formField}>
            <Select
              label={FIELD_LABELS.PROVINCIA}
              value={formData[FORM_FIELDS.PROVINCIA] || ""}
              onChange={(value) => onInputChange(FORM_FIELDS.PROVINCIA, value)}
              options={PROVINCE_OPTIONS}
              placeholder={FIELD_PLACEHOLDERS.PROVINCIA}
              required={true}
              error={errors[FORM_FIELDS.PROVINCIA]}
              tabIndex={7}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label={FIELD_LABELS.APELLIDO}
              value={formData[FORM_FIELDS.APELLIDO] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.APELLIDO, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.APELLIDO}
              required={true}
              error={errors[FORM_FIELDS.APELLIDO]}
              tabIndex={2}
            />
          </div>
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label={FIELD_LABELS.CONFIRMAR_CONTRASEÑA}
              type="password"
              showPasswordToggle={true}
              value={formData[FORM_FIELDS.CONFIRMAR_CONTRASEÑA] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.CONFIRMAR_CONTRASEÑA, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.CONTRASEÑA}
              required={true}
              error={errors[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]}
              tabIndex={4}
            />
          </div>
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label={FIELD_LABELS.TELEFONO}
              type="number"
              min="0"
              value={formData[FORM_FIELDS.TELEFONO] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.TELEFONO, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.TELEFONO}
              required={true}
              error={errors[FORM_FIELDS.TELEFONO]}
              tabIndex={6}
            />
          </div>
          <div className={styles.formField}>
            <Input
              label={FIELD_LABELS.CIUDAD}
              value={formData[FORM_FIELDS.CIUDAD] || ""}
              onChange={(e) =>
                onInputChange(FORM_FIELDS.CIUDAD, e.target.value)
              }
              placeholder={FIELD_PLACEHOLDERS.CIUDAD}
              required={true}
              error={errors[FORM_FIELDS.CIUDAD]}
              tabIndex={8}
            />
          </div>
        </div>
      </div>

      {/* Mobile-only password section at the bottom */}
      <div className={styles.mobileOnly}>
        <div className={styles.formField}>
          <Input
            label={FIELD_LABELS.CONTRASEÑA}
            type="password"
            showPasswordToggle={true}
            value={formData[FORM_FIELDS.CONTRASEÑA] || ""}
            onChange={(e) => {
              onInputChange(FORM_FIELDS.CONTRASEÑA, e.target.value);
              // Limpiar error de confirmación cuando cambia la contraseña principal
              if (errors[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]) {
                onInputChange(
                  FORM_FIELDS.CONFIRMAR_CONTRASEÑA,
                  formData[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]
                );
              }
            }}
            placeholder={FIELD_PLACEHOLDERS.CONTRASEÑA}
            required={true}
            error={errors[FORM_FIELDS.CONTRASEÑA]}
            tabIndex={3}
          />
        </div>
        <div className={styles.formField}>
          <Input
            id="confirmarContraseña"
            label={FIELD_LABELS.CONFIRMAR_CONTRASEÑA}
            type="password"
            showPasswordToggle={true}
            value={formData[FORM_FIELDS.CONFIRMAR_CONTRASEÑA] || ""}
            onChange={(e) =>
              onInputChange(FORM_FIELDS.CONFIRMAR_CONTRASEÑA, e.target.value)
            }
            placeholder={FIELD_PLACEHOLDERS.CONTRASEÑA}
            required={true}
            error={errors[FORM_FIELDS.CONFIRMAR_CONTRASEÑA]}
            tabIndex={4}
          />
        </div>
      </div>

      <PasswordRequirements password={formData[FORM_FIELDS.CONTRASEÑA]} />
    </div>
  );
}
