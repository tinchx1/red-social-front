import { Input, Select, PasswordRequirements } from "@/components";
import styles from "./BusinessForm.module.scss";
import { FILE_CONFIG } from "@/constants/businessForm";
import { PROVINCE_OPTIONS } from "@/constants/personForm";

export default function BusinessFormStage1({
  formData,
  onInputChange,
  onFileChange,
  errors,
}) {
  return (
    <>
      <div className={styles.formFieldsContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.formField}>
            <Input
              id="Usuario*"
              label={
                formData.accountType === "industrial"
                  ? "Nombre del parque industrial*"
                  : "Nombre de la empresa*"
              }
              value={formData.nombre}
              onChange={(e) => onInputChange("nombre", e.target.value)}
              placeholder={
                formData.accountType === "industrial"
                  ? "Nombre del parque industrial"
                  : "Delsud"
              }
              required
              error={errors.nombre}
              tabIndex={1}
            />
          </div>

          <div className={styles.formField}>
            <Input
              id="emailEmpresarial"
              label="Correo electrónico empresarial*"
              type="email"
              value={formData.emailEmpresarial}
              onChange={(e) =>
                onInputChange("emailEmpresarial", e.target.value)
              }
              placeholder="micorreo@empresa.com.ar"
              autocomplete="email"
              required
              error={errors.emailEmpresarial}
              tabIndex={3}
            />
          </div>

          {/* Mobile-only phone field after email */}
          <div className={`${styles.formField} ${styles.mobileOnly}`}>
            <Input
              id="telefonoEmpresarial-mobile"
              label="Teléfono empresarial*"
              type="number"
              min="0"
              value={formData.telefonoEmpresarial}
              onChange={(e) =>
                onInputChange("telefonoEmpresarial", e.target.value)
              }
              placeholder="221456782"
              required
              error={errors.telefonoEmpresarial}
              tabIndex={4}
            />
          </div>

          <div className={styles.formField}>
            <Input
              id="Representante*"
              label="Representante*"
              value={formData.representante}
              onChange={(e) => onInputChange("representante", e.target.value)}
              placeholder="Nombre y Apellido"
              required
              error={errors.representante}
              tabIndex={5}
            />
          </div>

          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              id="contraseña"
              label="Contraseña*"
              type="password"
              value={formData.contraseña}
              onChange={(e) => {
                onInputChange("contraseña", e.target.value);
                // Limpiar error de confirmación cuando cambia la contraseña principal
                if (errors.confirmarContraseña) {
                  onInputChange(
                    "confirmarContraseña",
                    formData.confirmarContraseña
                  );
                }
              }}
              placeholder="•••••"
              required
              showPasswordToggle={true}
              error={errors.contraseña}
              tabIndex={7}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formField}>
            <Select
              id="provincia"
              label="Provincia*"
              value={formData.provincia}
              onChange={(value) => onInputChange("provincia", value)}
              options={PROVINCE_OPTIONS}
              placeholder="Seleccionar"
              required
              error={errors.provincia}
            />
          </div>

          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              id="telefonoEmpresarial"
              label="Teléfono empresarial*"
              type="number"
              min="0"
              value={formData.telefonoEmpresarial}
              onChange={(e) =>
                onInputChange("telefonoEmpresarial", e.target.value)
              }
              placeholder="221456782"
              required
              error={errors.telefonoEmpresarial}
              tabIndex={4}
            />
          </div>

          {/* <div className={styles.formField}>
            <Input
              id="estatuto"
              label="Estatuto"
              type="file"
              icon={FILE_CONFIG.ESTATUTO.icon}
              iconPosition="right"
              placeholder={FILE_CONFIG.ESTATUTO.placeholder}
              onChange={onFileChange}
              accept={FILE_CONFIG.ESTATUTO.accept}
              error={errors.estatuto}
              tabIndex={6}
            />
          </div> */}
          <div className={`${styles.formField} ${styles.desktopOnly}`}>
            <Input
              label="Confirmar contraseña*"
              type="password"
              showPasswordToggle={true}
              value={formData.confirmarContraseña}
              onChange={(e) =>
                onInputChange("confirmarContraseña", e.target.value)
              }
              placeholder="•••••"
              required={true}
              error={errors.confirmarContraseña}
              tabIndex={6}
            />
          </div>
        </div>
      </div>

      {/* Mobile-only password section at the bottom */}
      <div className={styles.mobileOnly}>
        <div className={styles.formField}>
          <Input
            id="contraseña mobile"
            label="Contraseña*"
            type="password"
            showPasswordToggle={true}
            value={formData.contraseña}
            onChange={(e) => {
              onInputChange("contraseña", e.target.value);
              // Limpiar error de confirmación cuando cambia la contraseña principal
              if (errors.confirmarContraseña) {
                onInputChange(
                  "confirmarContraseña",
                  formData.confirmarContraseña
                );
              }
            }}
            placeholder="•••••"
            required
            error={errors.contraseña}
            tabIndex={7}
          />
        </div>
        <div className={styles.formField}>
          <Input
            id="confirmarContraseña"
            label="Confirmar contraseña*"
            type="password"
            showPasswordToggle={true}
            value={formData.confirmarContraseña}
            onChange={(e) =>
              onInputChange("confirmarContraseña", e.target.value)
            }
            placeholder="•••••"
            required={true}
            error={errors.confirmarContraseña}
            tabIndex={8}
          />
        </div>
      </div>

      <div className={styles.requirementsRow}>
        <PasswordRequirements password={formData.contraseña} />
      </div>
    </>
  );
}
