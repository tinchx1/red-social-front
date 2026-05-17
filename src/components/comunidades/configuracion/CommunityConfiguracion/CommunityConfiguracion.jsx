"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./CommunityConfiguracion.module.scss";
import { Button, Select, ConfirmModal, Spinner, Toggle } from "@/components/ui";
import { updateCommunity, deleteCommunity } from "@/actions/community";
import { optionSector } from "@/components/comunidades/connections/createCommunity/options";
import { useToast } from "@/contexts/ToastContext";
import AboutCommunityEditable from "@/components/comunidades/profile/AboutCommunityEditable/AboutCommunityEditable";
import CommunityAddUser from "../CommunityAddUser/CommunityAddUser";
import WarningIcon from "@/assets/warning2.svg";
import ImageUpload from "@/assets/file-new.svg";
import { useCreator } from "@/contexts/CreatorProvider";
import { canAddUsersToCommuni } from "../../../../constants/communityPermissions";
import { useProfile } from "@/contexts/ProfileContext";
import { canCreatePrivateCommunity } from "@/constants/communityLimits";
import HelpVIsivility from "../HelpVIsivility/HelpVIsivility";

/**
 * Community configuration component
 * @param {{
 *   community: { id: string; name: string; sector?: string; bio?: string; avatarUrl?: string; bannerUrl?: string; visibility?: string };
 *   isOwner?: boolean;
 * }} props
 */
const buildInitialFormState = (communityData) => ({
  name: communityData?.name || "",
  sector: communityData?.sector || "",
  avatarPhoto: null,
  bannerPhoto: null,
  visibility: communityData?.visibility || "private",
});

export default function CommunityConfiguracion({ community, isOwner = false }) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { profile } = useProfile();
  const canShowPrivacyToggle = canCreatePrivateCommunity(profile);
  const [formData, setFormData] = useState(() =>
    buildInitialFormState(community)
  );

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(
    community?.visibility === "private"
  );

  useEffect(() => {
    if (community) {
      setFormData(buildInitialFormState(community));
      setAvatarPreview(null);
      setBannerPreview(null);
      setIsPrivate(community?.visibility === "private");
    }
  }, [community]);

  useEffect(() => {
    checkForChanges();
  }, [isPrivate]);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const checkForChanges = (newFormData = formData) => {
    const nameChanged = newFormData.name !== (community?.name || "");
    const sectorChanged = newFormData.sector !== (community?.sector || "");
    const avatarChanged = newFormData.avatarPhoto instanceof File;
    const bannerChanged = newFormData.bannerPhoto instanceof File;
    const visibilityChanged = isPrivate !== (community?.visibility === "private" || community?.visibility === undefined);
    setHasChanges(
      nameChanged || sectorChanged || avatarChanged || bannerChanged || visibilityChanged
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    checkForChanges(newFormData);
  };

  const handleSelectChange = (value) => {
    const newFormData = {
      ...formData,
      sector: value,
    };
    setFormData(newFormData);
    setErrors((prev) => ({ ...prev, sector: undefined }));
    checkForChanges(newFormData);
  };

  const handleToggle = (value) => {
    setIsPrivate(value);
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      showError("Solo se permiten archivos JPG, JPEG y PNG");
      return;
    }

    const newFormData = {
      ...formData,
      [type]: file,
    };
    setFormData(newFormData);

    // Create preview
    const preview = URL.createObjectURL(file);
    if (type === "avatarPhoto") {
      setAvatarPreview(preview);
    } else {
      setBannerPreview(preview);
    }

    checkForChanges(newFormData);
  };

  const handleRemoveImage = (type) => {
    const inputId = type === "avatarPhoto" ? "avatarPhoto" : "bannerPhoto";
    const updatedFormData = {
      ...formData,
      [type]: null,
    };

    if (type === "avatarPhoto") {
      setAvatarPreview(null);
    } else {
      setBannerPreview(null);
    }

    const input = document.getElementById(inputId);
    if (input) input.value = "";

    setFormData(updatedFormData);
    checkForChanges(updatedFormData);
  };

  const handleCancel = () => {
    setFormData(buildInitialFormState(community));
    setAvatarPreview(null);
    setBannerPreview(null);
    setErrors({});
    setHasChanges(false);
    setIsPrivate(community?.visibility === "private" || community?.visibility === undefined);
    const avatarInput = document.getElementById("avatarPhoto");
    const bannerInput = document.getElementById("bannerPhoto");
    if (avatarInput) avatarInput.value = "";
    if (bannerInput) bannerInput.value = "";
  };

  const handleSave = async () => {
    // Validate required fields
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Este campo es obligatorio";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        sector: formData.sector || undefined,
        visibility: isPrivate ? "private" : "public",
      };

      if (formData.avatarPhoto instanceof File) {
        updateData.avatarUrl = await getBase64(formData.avatarPhoto);
      }

      if (formData.bannerPhoto instanceof File) {
        updateData.bannerUrl = await getBase64(formData.bannerPhoto);
      }

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      await updateCommunity(community.id, updateData);

      showSuccess("Cambios guardados exitosamente");
      setHasChanges(false);
      setAvatarPreview(null);
      setBannerPreview(null);
      setFormData((prev) => ({
        ...prev,
        name: formData.name.trim(),
        sector: formData.sector || "",
        avatarPhoto: null,
        bannerPhoto: null,
        visibility: isPrivate ? "private" : "public",
      }));

      router.refresh();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      showError(error.message || "Error al guardar cambios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommunity(community.id);
      showSuccess("Comunidad eliminada exitosamente");
      router.push("/comunidades");
    } catch (error) {
      console.error("Error al eliminar comunidad:", error);
      showError(error.message || "Error al eliminar comunidad");
    }
  };

  if (!community) {
    return null;
  }
  const creator = useCreator();

  const showAddUserSection = canAddUsersToCommuni(creator);
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>CONFIGURACIÓN</h1>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column - Basic Information */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Información básica</h2>

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
              {errors.name && (
                <span className={styles.error}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sector" className={styles.label}>
                Rubro/Ind
              </label>
              <Select
                label=""
                value={formData.sector}
                onChange={handleSelectChange}
                options={optionSector}
                placeholder="Seleccionar sector"
                error={errors.sector}
              />
            </div>

            {canShowPrivacyToggle && (
              <div className={styles.toggleContainer}>
                <div className={styles.toggleContent}>
                  <p className={styles.toggleLabel}>{isPrivate ? "Comunidad privada" : "Comunidad pública"}</p>
                  <Toggle
                    checked={isPrivate}
                    onChange={handleToggle}
                  />
                </div>
                <HelpVIsivility isPrivate={isPrivate} />
              </div>
            )}

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
                  <ImageUpload />
                  Seleccionar archivo
                </label>
              </div>
              {(community.avatarUrl ||
                formData.avatarPhoto ||
                avatarPreview) && (
                  <div className={styles.preview}>
                    <span className={styles.fileName}>
                      {formData.avatarPhoto?.name || "Imagen cargada actualmente"}
                    </span>
                    {formData.avatarPhoto instanceof File && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveImage("avatarPhoto")}
                      >
                        ✕ Eliminar
                      </button>
                    )}
                  </div>
                )}
              <p className={styles.helpText}>
                Se recomienda 300x300 px. Formatos compatibles: JPG, JPEG y PNG.
              </p>
            </div>

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
                  <ImageUpload />
                  Seleccionar archivo
                </label>
              </div>
              {(community.bannerUrl ||
                formData.bannerPhoto ||
                bannerPreview) && (
                  <div className={styles.preview}>
                    <span className={styles.fileName}>
                      {formData.bannerPhoto?.name || "Imagen cargada actualmente"}
                    </span>
                    {formData.bannerPhoto instanceof File && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveImage("bannerPhoto")}
                      >
                        ✕ Eliminar
                      </button>
                    )}
                  </div>
                )}
              <p className={styles.helpText}>
                Se recomienda 300x900 px. Formatos compatibles: JPG, JPEG y PNG.
              </p>
            </div>
          </div>
          <div className={styles.actionButtons}>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading || !hasChanges}
              style={{
                backgroundColor: "#E6E6E6",
                borderColor: "#E6E6E6",
                minWidth: "200px",
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              style={{ minWidth: "200px" }}
            >
              {isLoading ? <>Guardando <Spinner color="white" size="small" /></> : "Guardar cambios"}
            </Button>
          </div>
        </div>

        {/* Right Column - About Community */}
        <div className={styles.rightColumn}>
          <AboutCommunityEditable
            communityId={community.id}
            bio={community.bio || ""}
            isOwner={isOwner}
          />
          <div className={styles.supportBox}>
            <p className={styles.supportText}>
              Si tenés inconvenientes comunicate a{" "}
              <a
                href="mailto:mailsoporte@apia.com.ar"
                className={styles.supportLink}
              >
                mailsoporte@apia.com.ar
              </a>
            </p>
          </div>
          {isOwner === true && <button
            type="button"
            className={styles.deleteButton}
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            Eliminar comunidad
          </button>}
        </div>

        {/* Third Column - Images Preview */}
        {showAddUserSection && <div className={styles.thirdColumn}>
          <CommunityAddUser />
        </div>}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            await handleDelete();
            setShowDeleteModal(false);
          }}
          title={
            <p style={{ margin: "0 auto" }}>
              <span style={{ fontWeight: 400 }}>¿Estás seguro que querés</span>{" "}
              <span style={{ fontWeight: 700 }}>
                eliminar la comunidad "{community.name}"?
              </span>
            </p>
          }
          icon={WarningIcon}
          confirmText="Eliminar comunidad"
          cancelText="Cancelar"
          confirmVariant="secondary"
          iconSize={40}
          iconStyle={{ color: "#E53E3E", width: 64, height: 64 }}
          confirmButtonStyle={{
            backgroundColor: "#E6E6E6",
            color: "#FF383C",
            borderColor: "#E6E6E6",
          }}
        />
      )}

      {/* Action Buttons */}
    </div>
  );
}
