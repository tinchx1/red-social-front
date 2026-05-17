"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./AboutCommunityEditable.module.scss";
import { Button, Spinner } from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import { updateCommunity } from "@/actions/community";
import buttonEditar from "@/assets/buttonEditar.svg?url";

/**
 * Editable "Acerca de esta comunidad" block
 * @param {{ communityId: string, bio?: string, isOwner?: boolean }} props
 */
export default function AboutCommunityEditable({ communityId, bio = "", isOwner = false }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio || "");
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Sync value when bio prop changes (after router.refresh())
  useEffect(() => {
    setValue(bio || "");
  }, [bio]);

  const onCancel = () => {
    setValue(bio || "");
    setEditing(false);
  };

  const onSave = async () => {
    if (!communityId) return;
    try {
      setLoading(true);
      await updateCommunity(communityId, { bio: value });
      showSuccess("Descripción actualizada");
      setEditing(false);
      router.refresh();
    } catch (e) {
      showError("No se pudo actualizar la descripción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.container + " " + (!isOwner ? styles.marginBottom : "")}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Acerca de esta comunidad</h3>
        {isOwner && !editing ? (
          <button
            className={styles.editButton}
            onClick={() => setEditing(true)}
            aria-label="Editar descripción de comunidad"
          >
            <Image src={buttonEditar} alt="Editar" width={24} height={24} />
          </button>
        ) : null}
      </div>
      {!editing && (
        <>
          <p className={styles.text}>{value || "Sin descripción"}</p>
        </>
      )}
      {editing && (
        <div className={styles.editWrap}>
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe una descripción para la comunidad"
            rows={5}
            maxLength={500}
          />
          <div className={styles.actionsRow}>
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={loading}>
              {loading ? <>Guardando <Spinner color="white" size="small" /></> : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}


