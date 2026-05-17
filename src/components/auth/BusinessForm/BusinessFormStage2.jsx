import { Input, SectorSelector } from "@/components";
import styles from "./BusinessForm.module.scss";
import { FORM_LABELS } from "@/constants/businessForm";
import { INTEREST_SECTORS } from "@/constants/sectors";

export default function BusinessFormStage2({
  formData,
  onInputChange,
  errors,
}) {
  const handleSectorSelect = (sector) => {
    const currentSectores = formData.sectoresInteres || [];
    const newSectores = currentSectores.includes(sector)
      ? currentSectores.filter((s) => s !== sector)
      : [...currentSectores, sector];
    onInputChange("sectoresInteres", newSectores);
  };

  return (
    <>
      <div className={styles.formFieldsContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.formField}>
            <Input
              id="rubroIndustria"
              label="Rubro/Industria*"
              value={formData.rubroIndustria}
              onChange={(e) => onInputChange("rubroIndustria", e.target.value)}
              placeholder="Metalúrgica"
              required
              error={errors.rubroIndustria}
              tabIndex={1}
            />
          </div>

          <div className={styles.formField}>
            <Input
              id="localidad"
              label="Localidad*"
              value={formData.localidad}
              onChange={(e) => onInputChange("localidad", e.target.value)}
              placeholder="Berazategui"
              required
              error={errors.localidad}
              tabIndex={3}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formField}>
            <Input
              id="direccion"
              label="Dirección*"
              value={formData.direccion}
              onChange={(e) => onInputChange("direccion", e.target.value)}
              placeholder="55 #458"
              required
              error={errors.direccion}
              tabIndex={2}
            />
          </div>
        </div>
      </div>

      <div className={styles.formField}>
        <label className={styles.sectorsLabel}>
          {FORM_LABELS.SECTORS_LABEL}*
        </label>
        <SectorSelector
          sectors={INTEREST_SECTORS}
          selected={formData.sectoresInteres || []}
          onSelect={handleSectorSelect}
          required
        />
        {errors?.sectoresInteres && (
          <span
            style={{ color: "#dc2626", fontSize: 12, fontFamily: "Roboto" }}
          >
            {errors.sectoresInteres}
          </span>
        )}
      </div>
    </>
  );
}
