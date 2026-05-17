"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import styles from "./ProfileMediaHeader.module.scss";
import buttonEditar from "@/assets/buttonEditar.svg?url";
import { clientApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

const ProfileMediaHeader = ({
  initialAvatarUrl,
  initialBannerUrl,
  editable = true,
  updateAvatarPath = "/profile/me/avatar",
  updateBannerPath = "/profile/me/banner",
}) => {
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { showSuccess, showError } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(
    initialAvatarUrl || "/images/profile.svg"
  );
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl || null);

  const onClickEditAvatar = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        showError("Invalid file type. Use JPEG, JPG, PNG or WEBP.");
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);

      await clientApi.put(updateAvatarPath, { avatarFile: dataUrl });

      setAvatarUrl(dataUrl);
      showSuccess("Imagen de perfil actualizada correctamente");
    } catch (error) {
      const message = "Error al actualizar la imagen de perfil";
      showError(message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onClickEditBanner = () => {
    bannerInputRef.current?.click();
  };

  const onBannerSelected = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        showError("Formato inválido. Usa JPEG, JPG, PNG o WEBP.");
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);

      await clientApi.put(updateBannerPath, { bannerFile: dataUrl });

      setBannerUrl(dataUrl);
      showSuccess("Banner actualizado correctamente");
    } catch (error) {
      const message = "Error al actualizar el banner";
      showError(message);
    } finally {
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };
  return (
    <div className={styles.coverImage}>
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt="Banner"
          className={styles.banner}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className={styles.plainBanner}></div>
      )}
      {editable && (
        <button
          type="button"
          className={styles.bannerEditButton}
          onClick={onClickEditBanner}
          aria-label="Edit banner"
          title="Edit banner"
        >
          <Image src={buttonEditar} alt="Edit" width={18} height={18} />
        </button>
      )}
      {editable && (
        <input
          ref={bannerInputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES.join(",")}
          onChange={onBannerSelected}
          className={styles.hiddenFileInput}
        />
      )}
      <div className={styles.avatarContainer}>
        <Image
          src={avatarUrl}
          alt="Avatar"
          priority
          className={styles.avatar}
          sizes="(max-width: 480px) 80px,
           (max-width: 768px) 100px,
           120px"
          fill
        />
        {editable && (
          <button
            type="button"
            className={styles.avatarEditButton}
            onClick={onClickEditAvatar}
            aria-label="Edit avatar"
            title="Edit avatar"
          >
            <Image src={buttonEditar} alt="Edit" width={18} height={18} />
          </button>
        )}
        {editable && (
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(",")}
            onChange={onFileSelected}
            className={styles.hiddenFileInput}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileMediaHeader;
