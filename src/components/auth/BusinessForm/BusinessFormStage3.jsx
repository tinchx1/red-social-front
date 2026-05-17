import { Input } from "@/components";
import Link from "next/link";
import styles from "./BusinessForm.module.scss";
import { useState } from "react";
import { getBase64 } from "@/utils";
import {
  FILE_CONFIG,
  FORM_LABELS,
  FORM_FIELDS,
} from "@/constants/businessForm";

export default function BusinessFormStage3({
  formData,
  onInputChange,
  onInputBlur,
  errors,
}) {
  const [logoFile, setLogoFile] = useState(null);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(
            "El archivo es demasiado grande. El tamaño máximo es 5MB."
          );
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            "Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF)."
          );
        }

        setLogoFile(file);

        // Convert file to base64
        const base64 = await getBase64(file);
        onInputChange("logotipo", base64);
      } catch (error) {
        console.error("Error processing logo file:", error);
        // Reset file input
        e.target.value = "";
        setLogoFile(null);
        setErrors({ logotipo: error.message });
      }
    }
  };

  const handleCheckboxChange = (e) => {
    onInputChange("representanteAutorizado", e.target.checked);
  };

  return (
    <>
      <div className={styles.formFieldsContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.formField}>
            <Input
              id="linkedinUrl"
              label="Red social ej: LinkedIn"
              value={formData.linkedinUrl}
              onChange={(e) => onInputChange("linkedinUrl", e.target.value)}
              onBlurCapture={() => onInputBlur && onInputBlur("linkedinUrl")}
              placeholder="Elegí tu URL"
              error={errors.linkedinUrl}
            />
          </div>

          <div className={styles.formField}>
            <Input
              id="sitioWeb"
              label="Sitio Web"
              value={formData.sitioWeb}
              onChange={(e) => onInputChange("sitioWeb", e.target.value)}
              onBlurCapture={() => onInputBlur && onInputBlur("sitioWeb")}
              placeholder="https://www.misitio.com"
              error={errors.sitioWeb}
            />
          </div>

          <div className={styles.formField}>
            <Input
              id="cantidadEmpleados"
              label={`${
                formData.accountType === "industrial"
                  ? "Cantidad de empresas radicadas"
                  : "Cantidad de empleados"
              }`}
              type="number"
              min="0"
              value={formData.cantidadEmpleados}
              onChange={(e) =>
                onInputChange("cantidadEmpleados", e.target.value)
              }
              onBlurCapture={() =>
                onInputBlur && onInputBlur("cantidadEmpleados")
              }
              placeholder="150 personas"
              error={errors.cantidadEmpleados}
            />
          </div>

          <div className={`${styles.formField} ${styles.desktopOnly}`}>
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
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formField}>
            <label className={styles.label}>Logotipo</label>
            <div className={styles.logoUpload}>
              <input
                type="file"
                id="logotipo"
                accept={FILE_CONFIG.LOGOTIPO.accept}
                onChange={handleLogoChange}
                className={styles.fileInput}
                error={errors.logotipo}
              />
              {logoFile ? (
                <div className={styles.fileLabel}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{logoFile?.name}</span>
                  </div>
                </div>
              ) : (
                <label htmlFor="logotipo" className={styles.fileLabel}>
                  <div className={styles.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 16L12 8M12 8L15 11M12 8L9 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>Seleccionar archivo</span>
                </label>
              )}
              <p className={styles.fieldInfo}>
                {FILE_CONFIG.LOGOTIPO.description}
              </p>
            </div>
          </div>

          <div className={styles.formField}>
            <Input
              id="descripcion"
              label="Breve descripción"
              value={formData.descripcion}
              onChange={(e) => onInputChange("descripcion", e.target.value)}
              onBlurCapture={() => onInputBlur && onInputBlur("descripcion")}
              placeholder="Ejemplo: Somos una fintech de alcance nacional que nació para brindarte oportunidades. Llegamos para demostrar que lo que creías inalcanzable, ahora es para vos."
              as="textarea"
              maxLength={2600}
              rows="4"
            />
            <p className={styles.fieldInfo}>{FORM_LABELS.DESCRIPCION_INFO}</p>
          </div>
          <div className={styles.formField}>
            <label className={styles.checkboxLabel}>
              <input
                id="representanteAutorizado"
                type="checkbox"
                checked={formData.representanteAutorizado || false}
                onChange={handleCheckboxChange}
                className={styles.checkbox}
                required
              />
              <span className={styles.checkboxText}>
                {FORM_LABELS.REPRESENTANTE_AUTORIZADO_TEXT}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className={`${styles.formField} ${styles.mobileOnly}`}>
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
