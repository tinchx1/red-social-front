"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ContactStatusButton.module.scss";
import { Button, Modal, Spinner } from "@/components/ui";
import WarningIcon from "@/assets/leave.svg";
import { useCommunityMembership } from "@/contexts";

/**
 * Community membership status button
 *
 * @param {{
 *  communityId: string;
 *  onStatusChange?: (status: string) => void;
 *  initialStatus?: string;
 * }} props
 */
export default function ContactStatusButton({
  communityId,
  onStatusChange,
  initialStatus,
  clickable = false,
}) {
  const router = useRouter();
  const {
    memberships,
    loading: loadingMap,
    getStatus,
    requestMembership,
    leave: leaveCommunityContext,
    refresh,
  } = useCommunityMembership();

  const status = memberships[communityId] || initialStatus || "none";
  const loading = loadingMap[communityId] || false;
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);

  useEffect(() => {
    // Si no tenemos el estado en el contexto, cargarlo
    if (!memberships[communityId] && !initialStatus) {
      getStatus(communityId);
    }
  }, [communityId, memberships, initialStatus, getStatus]);

  const handleLeaveCommunity = async () => {
    const result = await leaveCommunityContext(communityId);
    if (result.success) {
      onStatusChange?.("none");
      setShowLeaveModal(false);
      router.refresh();
      await refresh(communityId);
    }
  };

  const renderContent = () => {
    if (clickable) {
      return (
        <Button
          variant="primary"
          onClick={() => router.push(`/comunidades/${communityId}`)}
          rounded="medium"
        >
          Ver comunidad
        </Button>
      );
    }
    if (status === "approved") {
      return (
        <Button
          variant="light-blue"
          onClick={() => setShowLeaveModal(true)}
          disabled={loading}
          rounded="medium"
        >
          {loading ? (
            <>
              Procesando <Spinner color="white" size="small" />
            </>
          ) : (
            "Abandonar"
          )}
        </Button>
      );
    }
    if (status === "pending") {
      return <span className={styles.pillNeutral}>Solicitud pendiente</span>;
    }
    if (status === "rejected" || status === "none") {
      return (
        <Button
          variant="primary"
          onClick={async () => {
            const result = await requestMembership(communityId);
            if (result.success) {
              onStatusChange?.("pending");
              router.refresh();
              await refresh(communityId);
            }
          }}
          disabled={loading}
          rounded="medium"
        >
          {loading ? (
            <>
              Enviando <Spinner color="white" size="small" />
            </>
          ) : (
            "Solicitar unirse"
          )}
        </Button>
      );
    }
    return null;
  };

  // Do not render anything if no community id
  if (!communityId) return null;

  return (
    <>
      <div className={styles.container}>{renderContent()}</div>

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        showCloseButton={false}
        closeOnOverlayClick={false}
      >
        <div className={styles.modalIconWrapper}>
          <WarningIcon />
        </div>
        <p className={styles.modalText}>
          ¿Estás seguro que quieres abandonar esta comunidad?
        </p>

        <div className={styles.modalButtons}>
          <Button
            variant="primary"
            onClick={handleLeaveCommunity}
            disabled={loading}
            rounded="medium"
          >
            {loading ? (
              <>
                Procesando <Spinner color="white" size="small" />
              </>
            ) : (
              "Abandonar"
            )}
          </Button>

          <Button
            variant="light-blue"
            onClick={() => setShowLeaveModal(false)}
            disabled={loading}
            rounded="medium"
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  );
}
