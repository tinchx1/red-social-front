"use client";
import { Button, Modal } from "@/components/ui";
import styles from "./CardCommunity.module.scss";
import Link from "next/link";
import {
  acceptOrRefuseInvite,
  quitCommunity,
  cancelInvitationsendToSomeCommunity,
  cancelInvitationSendToMyCommunity,
} from "@/actions";
import { RefuseAlert } from "../refuseAlert/RefuseAlert";
import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SettingLineIcon from "@/assets/setting_line.svg";
export const CardComunnity = ({
  id,
  title,
  members,
  description,
  photoProfile,
  variant,
  url,
  inviteType,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const HandleAction = async (action) => {
    try {
      if (action === "approved" || action === "reject") {
        await acceptOrRefuseInvite(action, id);
        showSuccess(
          action === "approved"
            ? "Invitación aceptada correctamente"
            : "Invitación rechazada correctamente",
          2000
        );
      }
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      console.error("Error al procesar la acción:", error);
      showError(error.response?.data?.message || "Error al procesar la acción");
    }
  };

  const handleCancelInvitation = async () => {
    try {
      if (inviteType === "user-sent") {
        await cancelInvitationsendToSomeCommunity(id);
        showSuccess("Solicitud cancelada correctamente", 2000);
      } else if (inviteType === "admin-sent") {
        await cancelInvitationSendToMyCommunity(id);
        showSuccess("Invitación cancelada correctamente", 2000);
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

  const handleQuitCommunity = async () => {
    try {
      await quitCommunity(id);
      setOpenModal(false);
      showSuccess("Has abandonado la comunidad", 2000);
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      console.error("Error al abandonar comunidad:", error);
      showError(
        error.response?.data?.message || "Error al abandonar la comunidad"
      );
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setOpenModal(true);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const setFlag = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 1455);
    setFlag();
    window.addEventListener("resize", setFlag);
    return () => window.removeEventListener("resize", setFlag);
  }, []);

  const options = {
    "reject-invitation": {
      description: "¿Estás seguro que quieres rechazar esta invitación?",
      options: [
        { label: "Rechazar", action: () => HandleAction("reject") },
        {
          label: "Cancelar",
          action: () => setOpenModal(false),
          variant: "secondary",
        },
      ],
    },
    "cancel-invitation": {
      description: "¿Estás seguro que quieres cancelar esta invitación?",
      options: [
        { label: "Cancelar invitación", action: handleCancelInvitation },
        {
          label: "Volver",
          action: () => setOpenModal(false),
          variant: "secondary",
        },
      ],
    },
    "quit-community": {
      description: "¿Estás seguro que quieres abandonar esta comunidad?",
      options: [
        { label: "Abandonar", action: handleQuitCommunity },
        {
          label: "Cancelar",
          action: () => setOpenModal(false),
          variant: "secondary",
        },
      ],
    },
  };

  const renderButtons = () => {
    if (inviteType) {
      switch (inviteType) {
        case "user-received":
          return (
            <div className={styles.subContainerButton}>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("reject-invitation")}
              >
                Rechazar
              </Button>
              <Button onClick={() => HandleAction("approved")}>Aceptar</Button>
            </div>
          );

        case "user-sent":
          return (
            <div className={styles.subContainerButton}>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("cancel-invitation")}
              >
                Cancelar
              </Button>
            </div>
          );

        case "admin-received":
          return (
            <div className={styles.subContainerButton}>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("reject-invitation")}
              >
                Rechazar
              </Button>
              <Button onClick={() => HandleAction("approved")}>Aceptar</Button>
            </div>
          );

        case "admin-sent":
          return (
            <div className={styles.subContainerButton}>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("cancel-invitation")}
              >
                Cancelar
              </Button>
            </div>
          );
      }
    }

    switch (variant) {
      case "community-member":
        return (
          <div className={styles.subContainerButton}>
            <Link href={url}>
              <Button style={{ width: "100%" }}>Ver</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => handleOpenModal("quit-community")}
            >
              Abandonar
            </Button>
          </div>
        );

      case "community-admin":
        return (
          <div
            className={styles.subContainerButton}
            style={{
              flexDirection: isMobile ? "row" : "row-reverse",
              alignItems: "center",
              gap: isMobile ? "10px" : "23px",
            }}
          >
            {isMobile ? (
              <Link
                href={url + "/administracion/configuracion"}
                style={{ width: "100%"}}
              >
                <Button
                  style={{ width: "100%", color: "black" }}
                  icon={<SettingLineIcon />}
                  variant="secondary"
                ></Button>
              </Link>
            ) : (
              <Link
                href={url + "/administracion/configuracion"}
                style={{
                  width: "100%",
                  wrap: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  color: "#0c161d",
                }}
              >
                <SettingLineIcon />
                Configuración
              </Link>
            )}
            <Link href={url} style={{ width: "100%" }}>
              <Button style={{ width: "100%" }}>Ver</Button>
            </Link>
          </div>
        );

      case "invitation":
        return (
          <div className={styles.subContainerButton}>
            <Button onClick={() => HandleAction("approved")}>Aceptar</Button>
            <Button
              variant="secondary"
              onClick={() => handleOpenModal("reject-invitation")}
            >
              Rechazar
            </Button>
          </div>
        );

      default:
        return (
          <Link href={url} style={{ width: "100%" }}>
            <Button style={{ width: "100%" }}>Ver</Button>
          </Link>
        );
    }
  };
  return (
    <div className={styles.container}>
      <Link href={url} className={styles.cardLink} style={{ minWidth: "200px"  }}>
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
          <p className={styles.title}>{title}</p>
          {members && <p className={styles.members}>{members} miembros</p>}
          <p className={styles.description}>{description}</p>
        </div>
      </Link>

      <div
        className={styles.Containerbutton}
        style={{
          width: variant === "community-admin" ? "100%" : "",
          maxWidth: variant === "community-admin" && !isMobile ? "300px" : "180px",
        }}
      >
        {renderButtons()}
      </div>

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
