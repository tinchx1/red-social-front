"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./ResumenPerfil.module.scss";
import buttonEditar from "@/assets/buttonEditar.svg?url";
import Button from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui";
import { updateProfile } from "@/actions/profile/profile";

const ResumenPerfil = ({ summary }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bio, setBio] = useState(summary || "");

  // Sync bio when summary prop changes (after router.refresh())
  useEffect(() => {
    setBio(summary || "");
  }, [summary]);

  const handleEditToggle = () => setIsEditing((v) => !v);
  const handleCancel = () => {
    setBio(summary || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = (bio || "").trim();
    setIsLoading(true);
    try {
      await updateProfile({ bio: trimmed });
      setIsEditing(false);
      router.refresh();
    } catch (e) {
      // Optional: surface a toast
      // console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.infoContainer}>
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2>Resumen</h2>
          {!isEditing ? (
            <button className={styles.editButton} onClick={handleEditToggle} aria-label="Editar resumen">
              <Image src={buttonEditar} alt="Editar" width={24} height={24} />
            </button>
          ) : null}
        </div>

        {!isEditing ? (
          <p className={styles.summaryText}>{(bio || "").trim() ? bio : "Todavía no agregaste un resumen."}</p>
        ) : (
          <div>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contanos sobre vos o tu organización..."
              rows={5}
              maxLength={2600}
            />
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave} disabled={isLoading} rounded="medium">
                {isLoading ? <>Guardando <Spinner color="white" size="small" /></> : "Guardar cambios"}
              </Button>
              <Button variant="secondary" onClick={handleCancel} className={styles.cancelButton}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumenPerfil;


