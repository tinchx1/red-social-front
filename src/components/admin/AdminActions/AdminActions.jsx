"use client";
import React, { useState, useCallback, useEffect } from "react";
import styles from "./AdminActions.module.scss";
import CircleWarningIcon from "@/assets/circle-warning.svg";
import StopWarningIcon from "@/assets/stop-warning.svg";
import UserRemoveIcon from "@/assets/user-remove.svg";
import { ConfirmModal, WarningModal, Toast } from "@/components/ui";
import api from "@/lib/api";
import { getBase64 } from "@/utils/fileToBase64";
import { useRouter } from "next/navigation";

/**
 * Admin quick actions for a given user (warning, block/unblock, delete).
 *
 * @param {{
 *  user: { id: number|string, isActive?: boolean } | null,
 *  onAfterAction?: (type: 'warning'|'block'|'unblock'|'delete') => void
 * }} props
 */
const AdminActions = ({ user, onAfterAction }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
  });
  const [warningState, setWarningState] = useState({ isOpen: false });
  const [toastState, setToastState] = useState({
    showToast: false,
    status: 200,
    textSuccess: "",
    textError: "",
  });
  const [blocked, setBlocked] = useState(
    Boolean(user && user.isActive === false)
  );
  const router = useRouter();
  useEffect(() => {
    setBlocked(Boolean(user && user.isActive === false));
  }, [user]);

  const openWarning = () => setWarningState({ isOpen: true });
  const closeWarning = () => setWarningState({ isOpen: false });

  const openConfirm = useCallback(
    (type) => setConfirmState({ isOpen: true, type }),
    []
  );
  const closeConfirm = () => setConfirmState({ isOpen: false, type: null });

  const showSuccess = (text) =>
    setToastState({
      showToast: true,
      status: 200,
      textSuccess: text,
      textError: "",
    });
  const showError = (text) =>
    setToastState({
      showToast: true,
      status: 404,
      textSuccess: "",
      textError: text,
    });

  // Services inlined here to avoid scattering concerns
  const sendWarning = async (userId, warningData, imageFile = null) => {
    if (!userId) throw new Error("userId is required");
    if (!warningData || !warningData.type || !warningData.content)
      throw new Error("warningData with type and content is required");
    const payload = { type: warningData.type, content: warningData.content };
    if (imageFile) payload.img_moderation = await getBase64(imageFile);
    const { data } = await api.post(`/admin/users/${userId}/warning`, payload);
    return data?.data || data;
  };

  const updateUserStatus = async (userId, isActive) => {
    if (!userId && userId !== 0) throw new Error("userId is required");
    const { data } = await api.patch(`/admin/users/${userId}/status`, {
      isActive: Boolean(isActive),
    });
    return data?.data || data;
  };

  const deleteUser = async (userId) => {
    if (!userId && userId !== 0) throw new Error("userId is required");
    const { data } = await api.delete(`/admin/users/${userId}`);
    setTimeout(() => {
      router.push(`${process.env.NEXT_PUBLIC_ADMIN_URL}/gestion/usuarios`);
    }, 3000);
    return data?.data || data;
  };

  const handleConfirm = async () => {
    if (!user?.id) return;
    try {
      if (confirmState.type === "block") {
        const nextIsActive = blocked ? true : false;
        await updateUserStatus(user.id, nextIsActive);
        setBlocked(!blocked);
        showSuccess(blocked ? "Usuario desbloqueado" : "Usuario bloqueado");
        onAfterAction?.(blocked ? "unblock" : "block");
      } else if (confirmState.type === "delete") {
        await deleteUser(user.id);
        showSuccess("Usuario eliminado");
        onAfterAction?.("delete");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Acción fallida";
      showError(message);
    } finally {
      closeConfirm();
    }
  };

  return (
    <div
      className={styles.card}
      role="group"
      aria-label="Acciones de administrador"
    >
      <button className={styles.item} onClick={openWarning} type="button">
        <span className={styles.label}>Enviar advertencia</span>
        <CircleWarningIcon className={styles.icon} />
      </button>
      <button
        className={styles.item}
        onClick={() => openConfirm("block")}
        type="button"
      >
        <span className={styles.label}>
          {blocked ? "Desbloquear usuario" : "Bloquear usuario"}
        </span>
        <StopWarningIcon className={styles.icon} />
      </button>
      <button
        className={`${styles.item} ${styles.danger}`}
        onClick={() => openConfirm("delete")}
        type="button"
      >
        <span className={styles.label}>Eliminar usuario</span>
        <UserRemoveIcon className={styles.icon} />
      </button>

      {confirmState.isOpen && (
        <ConfirmModal
          isOpen
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          title={
            confirmState.type === "delete" ? (
              <p style={{ margin: "0 auto" }}>
                <span style={{ fontWeight: 400 }}>
                  ¿Estás seguro que querés
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  eliminar a este usuario?
                </span>
              </p>
            ) : (
              <p style={{ margin: "0 auto" }}>
                <span style={{ fontWeight: 400, maxWidth: "250px" }}>
                  ¿Estás seguro que querés{" "}
                </span>{" "}
                <span style={{ fontWeight: 700 }}>
                  {blocked ? "desbloquear" : "bloquear"} a este usuario?
                </span>
              </p>
            )
          }
          icon={
            confirmState.type === "delete" ? UserRemoveIcon : StopWarningIcon
          }
          confirmText={
            confirmState.type === "delete"
              ? "Sí, eliminar usuario"
              : `Sí, ${blocked ? "desbloquear" : "bloquear"} usuario`
          }
          cancelText="Cancelar"
          confirmVariant="secondary"
          iconSize={40}
          iconStyle={{ color: "#FF383C" }}
          confirmButtonStyle={{
            backgroundColor: "#E6E6E6",
            color: "#FF383C",
            borderColor: "#E6E6E6",
          }}
        />
      )}

      {warningState.isOpen && (
        <WarningModal
          isOpen={warningState.isOpen}
          onClose={closeWarning}
          onSubmit={async (warningData) => {
            try {
              await sendWarning(user?.id, warningData, warningData.imageFile);
              showSuccess("Advertencia enviada exitosamente");
              onAfterAction?.("warning");
            } catch (error) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Error al enviar advertencia";
              showError(message);
            }
          }}
        />
      )}

      <Toast
        showToast={toastState.showToast}
        setShowToast={(show) =>
          setToastState((prev) => ({ ...prev, showToast: show }))
        }
        status={toastState.status}
        textSuccess={toastState.textSuccess}
        textError={toastState.textError}
        duration={3000}
      />
    </div>
  );
};

export default AdminActions;
