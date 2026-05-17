"use client";
import { Input } from "@/components";
import ImageUpload from "@/assets/image-upload.svg";
import { useAdForm } from "@/contexts/AdFormContext";
import styles from "./AdLinkAndFile.module.scss";

export default function AdLinkAndFile({
  selectedFormat,
  onFileChange,
  showImageUpload = true,
}) {
  const {
    adFormData,
    updateAdFormData,
    linkError,
    setLinkError,
    validateClickUrl,
  } = useAdForm();

  const handleLinkChange = (event) => {
    updateAdFormData({ clickUrl: event.target.value });
    if (linkError) {
      setLinkError("");
    }
  };

  const handleLinkBlur = () => {
    validateClickUrl(adFormData.clickUrl);
  };

  const formatWidth = selectedFormat?.width ?? 0;
  const formatHeight = selectedFormat?.height ?? 0;

  return (
    <>
      <Input
        label="*Este será el enlace al que se redirigirá el usuario al hacer clic en el anuncio."
        placeholder="https://miempresa.com"
        type="url"
        value={adFormData.clickUrl}
        onChange={handleLinkChange}
        onBlur={handleLinkBlur}
        error={linkError}
      />
      {showImageUpload && (
        <div className={styles.field}>
          <div className={styles.imageUploadHeader}></div>
          <div className={styles.imageUploadContainer}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={onFileChange}
              className={styles.imageUploadInput}
              id="image-upload-input"
            />
            <label
              htmlFor="image-upload-input"
              className={styles.imageUploadArea}
            >
              <ImageUpload className={styles.imageUploadIcon} color="#101f2a" />
              <p className={styles.imageUploadNote}>
                Subir archivo png, jpg, jpeg, gif.
              </p>
            </label>
          </div>
        </div>
      )}
    </>
  );
}
