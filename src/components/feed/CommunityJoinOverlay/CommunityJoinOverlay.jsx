"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LockIcon from "@/assets/lock.svg";
import styles from "./CommunityJoinOverlay.module.scss";
import { useCommunityMembership } from "@/contexts";
import { useToast } from "@/contexts/ToastContext";

const CommunityJoinOverlay = ({
  communityId,
  className = "",
  onClose,
  initialStatus,
  isInCommunityPage = false
}) => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const {
    memberships,
    loading: loadingMap,
    getStatus,
    requestMembership,
    refresh,
  } = useCommunityMembership();

  const status = memberships[communityId] || initialStatus || "none";
  const loading = loadingMap[communityId] || false;
  useEffect(() => {
    // Solo cargar estado si está en la página de comunidad y no tenemos el estado
    if (!isInCommunityPage || memberships[communityId]) return;

    getStatus(communityId);
  }, [communityId, isInCommunityPage, memberships, getStatus]);

  if (!communityId) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Si está en pending, no hacer nada
    if (status === "pending" && isInCommunityPage) return;

    // Si NO está en la página de comunidad, redirigir
    if (!isInCommunityPage) {
      router.push(`/comunidades/${communityId}`);
      return;
    }

    // Si está en la página de comunidad, solicitar membresía
    const result = await requestMembership(communityId);
    if (result.success) {
      showSuccess("Solicitud enviada correctamente");
      router.refresh();
      // Refrescar desde el servidor para sincronizar
      await refresh(communityId);
    } else {
      showError("Error al enviar la solicitud");
    }
  };

  return (
    <div
      className={`${styles.overlay} ${className}`}
      onClick={handleClick}
      style={{ cursor: loading ? 'wait' : 'pointer' }}
    >
      <div className={styles.content}>
        <LockIcon className={styles.lockIcon} />
        <span className={styles.text}>
          {isInCommunityPage && status === "pending" ? "Solicitud pendiente" : "Unite para participar"}
        </span>
      </div>
    </div>
  );
};

export default CommunityJoinOverlay;
