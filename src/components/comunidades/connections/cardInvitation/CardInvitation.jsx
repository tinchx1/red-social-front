"use client";
import { Button, Modal, WarningLabel } from "@/components/ui";
import styles from "./CardInvitation.module.scss";
import { RefuseAlert } from "../refuseAlert/RefuseAlert";
import { useState } from "react";
import Image from "next/image";
import {
  acceptOrRefuseInvite,
  cancelInvitationSendToMyCommunity,
  cancelInvitationsendToSomeCommunity,
  cancelInvitationSendFromMyCommunity,
  acceptInvitation,
  rejectInvitation,
} from "@/actions";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

export const CardInvitation = ({
  id,
  title,
  description,
  photoProfile,
  variant,
  type,
  isAdmin = false,
  warningText,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const HandleAction = async (action) => {
    try {
      // For usuario tab recibidas, use the new endpoints
      if (variant === "usuario" && type === "request" && !isAdmin) {
        if (action === "approved") {
          await acceptInvitation(id);
          showSuccess("Invitación aceptada correctamente", 2000);
        } else if (action === "rejected") {
          await rejectInvitation(id);
          showSuccess("Invitación rechazada correctamente", 2000);
        }
      } else {
        // For admin or other cases, use the existing endpoint
        if (action === "approved" || action === "rejected") {
          await acceptOrRefuseInvite(action, id);
          showSuccess(
            action === "approved"
              ? "Solicitud aceptada correctamente"
              : "Solicitud rechazada correctamente",
            2000
          );
        }
      }
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      console.error("Error al procesar la acción:", error);
      showError(error.response?.data?.message || "Error al procesar la acción");
    }
  };

  const handleCancelInvitation = async () => {
    try {
      if (isAdmin && type === "send") {
        await cancelInvitationSendFromMyCommunity(id);
        showSuccess("Invitación cancelada correctamente", 2000);
      } else if (!isAdmin && type === "send") {
        await cancelInvitationsendToSomeCommunity(id);
        showSuccess("Solicitud cancelada correctamente", 2000);
      }
      setOpenModal(false);
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      console.error("Error al cancelar invitación:", error);
      showError(
        error.response?.data?.message || "Error al cancelar la invitación"
      );
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setOpenModal(true);
  };

  const options = {
    "reject-invitation": {
      description: "¿Estás seguro que quieres rechazar esta invitación?",
      options: [
        { label: "Rechazar", action: () => HandleAction("rejected") },
        {
          label: "Cancelar",
          action: () => setOpenModal(false),
          variant: "secondary",
        },
      ],
    },
    "cancel-invitation": {
      description:
        "¿Estás seguro que quieres cancelar el envío de esta invitación?",
      options: [
        { label: "Cancelar invitación", action: handleCancelInvitation },
        {
          label: "Volver",
          action: () => setOpenModal(false),
          variant: "secondary",
        },
      ],
    },
  };

  const getTitleText = () => {
    if (isAdmin && type === "request") {
      return `${title} solicitó unirse a tu comunidad!`;
    } else if (!isAdmin && type === "request") {
      return `${title} te ha invitado a su comunidad!`;
    } else if (type === "send") {
      return isAdmin
        ? `Invitación enviada a ${title}`
        : `Solicitud enviada a ${title}`;
    }
    return `${title}`;
  };

  const renderButtons = () => {
    if (type === "send") {
      return (
        <div className={styles.subContainerButton}>
          <Button
            variant="secondary"
            onClick={() => handleOpenModal("cancel-invitation")}
            style={{ width: "100%" }}
          >
            Cancelar
          </Button>
        </div>
      );
    }

    if (type === "request") {
      return (
        <div className={styles.subContainerButton}>
          <Button
            variant="secondary"
            style={{ width: "100%" }}
            onClick={() => handleOpenModal("reject-invitation")}
          >
            Rechazar
          </Button>
          <Button
            style={{ width: "100%" }}
            onClick={() => HandleAction("approved")}
          >
            Aceptar
          </Button>
        </div>
      );
    }

    return null;
  };
  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        <Image
          width={50}
          height={50}
          src={photoProfile || "/images/profile.svg"}
          alt="Profile"
          className={styles.profileImage}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.title}>{getTitleText()}</p>
        <p className={styles.description}>{description}</p>
      {warningText && <WarningLabel text={warningText} />}
      </div>

      <div className={styles.Containerbutton}>{renderButtons()}</div>

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        size="large"
      >
        <RefuseAlert
          description={options[modalType]?.description}
          options={options[modalType]?.options}
        />
      </Modal>
    </div>
  );
};
