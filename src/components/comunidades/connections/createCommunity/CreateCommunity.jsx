"use client";
import { useState, useEffect } from "react";
import styles from "./CreateCommunity.module.scss";
import { Button, Select, Modal, Spinner, Toggle, Tooltip } from "@/components/ui";
import { CreateCommunities } from "@/actions";
import { optionSector } from "./options";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import { canCreatePrivateCommunity } from "@/constants/communityLimits";
import HelpVIsivility from "../../configuracion/HelpVIsivility/HelpVIsivility";
import WarningIcon from "@/assets/warning-blue.svg?react";
/**
 * @param {{ onClose?: () => void; isOpen?: boolean }} props
 */
export const CreateCommunity = ({ onClose, isOpen = true }) => {
  const router = useRouter();
  const { profile } = useProfile();

  // Constante para determinar si el usuario puede crear comunidades privadas
  // Solo empresas/parques con plan distinto de 'free' pueden hacerlo
  const CAN_CREATE_PRIVATE_COMMUNITY = canCreatePrivateCommunity(profile);

  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    about: "",
    avatarPhoto: " ",
    bannerPhoto: " ",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Solo privado por defecto si el usuario puede crear comunidades privadas
  const [isPrivate, setIsPrivate] = useState(CAN_CREATE_PRIVATE_COMMUNITY);
  const [isDesktop, setIsDesktop] = useState(false);
  const { showSuccess, showError } = useToast();

  // Detectar si es desktop (>1024px)
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > 1366);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      sector: value,
    }));
    setErrors((prev) => ({ ...prev, sector: undefined }));
  };

  const handleToggle = (value) => {
    setIsPrivate(value);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [type]: file,
    }));
    // No preview nor blob URL; only keep file for submit and show file.name
  };

  // Función para eliminar la imagen precargada
  const handleRemoveImage = (type) => {
    if (type === "avatarPhoto") {
      setFormData((prev) => ({
        ...prev,
        avatarPhoto: " ",
      }));
      setProfilePreview(null);
      // Resetear el input de archivo
      document.getElementById("avatarPhoto").value = "";
    } else if (type === "bannerPhoto") {
      setFormData((prev) => ({
        ...prev,
        bannerPhoto: " ",
      }));
      setCoverPreview(null);
      // Resetear el input de archivo
      document.getElementById("bannerPhoto").value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Este campo es obligatorio";
    if (!formData.sector) newErrors.sector = "Este campo es obligatorio";
    if (formData.about && formData.about.length > 500)
      newErrors.about = "Máximo 500 caracteres";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      let avatarBase64 = null;
      let bannerBase64 = null;

      // Solo procesar si es un archivo (no un espacio vacío)
      if (formData.avatarPhoto instanceof File) {
        avatarBase64 = await getBase64(formData.avatarPhoto);
      }

      if (formData.bannerPhoto instanceof File) {
        bannerBase64 = await getBase64(formData.bannerPhoto);
      }

      const submitData = {
        name: formData.name,
        sector: formData.sector,
        bio: formData.about,
        avatarUrl: avatarBase64,
        bannerUrl: bannerBase64,
        visibility: isPrivate ? "private" : "public",
      };

      await CreateCommunities(submitData);

      setFormData({
        name: "",
        sector: "",
        about: "",
        avatarPhoto: " ",
        bannerPhoto: " ",
      });
      setProfilePreview(null);
      setCoverPreview(null);
      setErrors({});

      showSuccess("Comunidad creada exitosamente!", 2000);
      if (typeof onClose === "function") {
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      console.error("Error al crear comunidad:", error);
      showError(error.response?.data?.message || "Error al crear comunidad");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="NUEVA COMUNIDAD"
      size="large"
      closeOnOverlayClick={true}
      showCloseButton={true}
      titleStyle={{ color: "#1A1A1A", fontSize: "22px", fontWeight: "700", fontFamily: "Epilogue" }}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre de la comunidad*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.name ? styles.inputError : ""
              }`}
            placeholder="Parque Industrial Olavarría"
            maxLength={50}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sector" className={styles.label}>
            Sector*
          </label>
          <Select
            label=""
            value={formData.sector}
            onChange={handleSelectChange}
            options={optionSector}
            placeholder="Seleccionar sector"
            required
            error={errors.sector}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Foto de perfil</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="avatarPhoto"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileChange(e, "avatarPhoto")}
              className={styles.fileInput}
            />
            <label htmlFor="avatarPhoto" className={styles.fileLabel}>
              Seleccionar archivo
            </label>
          </div>
          {formData.avatarPhoto instanceof File && (
            <div className={styles.preview}>
              <span
                className={styles.fileName}
                title={formData.avatarPhoto.name}
              >
                {formData.avatarPhoto.name}
              </span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveImage("avatarPhoto")}
              >
                ✕ Eliminar
              </button>
            </div>
          )}
          <p className={styles.helpText}>
            Se recomienda 300x300 px. Formatos compatibles: JPG, JPEG y PNG.
          </p>
        </div>
        {CAN_CREATE_PRIVATE_COMMUNITY && (
          <div className={styles.toggleContainer}>
            <div className={styles.toggleContent}>
              <div className={styles.toggleContentContainer}>

                <p className={styles.toggleLabel}>{isPrivate ? "¿Querés crear una comunidad privada?" : "¿Querés crear una comunidad pública?"}</p>
                {isDesktop && (
                  <>
                    <Tooltip
                      content={<HelpVIsivility isPrivate={isPrivate} />}
                      position="bottom"
                      tooltipClassName={styles.customTooltip}
                      noBackground={true}
                    >
                      <WarningIcon className={styles.helpIcon} color="#0288C2" width={18} height={16}/>
                    </Tooltip>
                  </>
                )}
              </div>
              <Toggle
                checked={isPrivate}
                onChange={handleToggle}
              />
            </div>
            {!isDesktop && (
              <HelpVIsivility isPrivate={isPrivate} />
            )}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Foto de portada</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
                      id="bannerPhoto"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileChange(e, "bannerPhoto")}
                      className={styles.fileInput}
            />
                      <label htmlFor="bannerPhoto" className={styles.fileLabel}>
                        Seleccionar archivo
                      </label>
                    </div>
                    {formData.bannerPhoto instanceof File && (
                      <div className={styles.preview}>
                        <span
                          className={styles.fileName}
                          title={formData.bannerPhoto.name}
                        >
                          {formData.bannerPhoto.name}
                        </span>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemoveImage("bannerPhoto")}
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    )}
                    <p className={styles.helpText}>
                      Se recomienda 300x900 px. Formatos compatibles: JPG, JPEG y PNG.
                    </p>
                  </div>

                <div className={styles.formGroup}>
                  <label htmlFor="about" className={styles.label}>
                    Acerca de la comunidad
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    className={`${styles.textarea} ${errors.about ? styles.inputError : ""
                      }`}
                    placeholder="Describe la comunidad"
                    rows="5"
                    maxLength={500}
                  />
                  {errors.about && <span className={styles.error}>{errors.about}</span>}
                </div>

                <div className={styles.buttonContainer}>
                  <Button type="submit" disabled={isLoading}>
                    {!isLoading ? "Crear comunidad" : <>Creando comunidad <Spinner color="white" size="small" /></>}
                  </Button>
                </div>
              </form>
            </Modal>
            );
};
