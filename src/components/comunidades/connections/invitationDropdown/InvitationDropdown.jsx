"use client";

import { useState } from "react";
import { CardComunnity } from "../cardComunnity/CardCommunity";
import { CardInvitation } from "../cardInvitation/CardInvitation";
import { CommunityEmpty } from "../communityEmpty/CommunityEmpty";
import styles from "./InvitationDropdown.module.scss";
import ArrowDownIcon from "@/assets/arrow-bottom-icon.svg";

export const InvitationDropdown = ({ title, invitations, count, variant, type, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    if (count === 0) return; 
    setIsOpen(!isOpen);
  };
  
  const formatVariant = (variant) => {
    return variant.charAt(0).toUpperCase() + variant.slice(1);
  };

  return (
    <div className={styles.dropdownContainer}>
      <div
        className={`${styles.dropdownHeader} ${isOpen ? styles.open : ""}`}
        onClick={toggleDropdown}
        aria-disabled={count === 0}
      >
        <div className={styles.headerContent}>
          <span className={styles.title}>{title + " " + "(" + count + ")"}</span>
          {/* <span className={styles.count}>({count})</span> */}
        </div>
        <div className={styles.headerContentRight}>
          {/* <span className={styles.variant}>{formatVariant(variant)}</span> */}
          <span className={`${styles.arrow} ${isOpen ? styles.rotated : ""}`}>
            {count > 0 && <ArrowDownIcon className={styles.arrowIcon} />}
          </span>
        </div>
      </div>

      <div className={`${styles.dropdownContent} ${isOpen ? styles.open : ""}`}>
        {invitations.length > 0 ? (
          invitations.map((el, index) => {
            const isAdminVariant = isAdmin || variant === "administrador";

            let title = "";
            let photoProfile = "";
            let description = "";

            if (type === "request") {
              if (isAdminVariant) {
                // Admin viendo solicitudes recibidas: mostrar quien solicita (autor)
                title = el.author?.displayName || "";
                photoProfile = el.author?.avatarUrl || "";
                description = el.message || "";
              } else {
                // Usuario viendo invitaciones recibidas: mostrar comunidad que invita
                title = el.community?.name || "";
                photoProfile = el.community?.avatarUrl || "";
                description = el.community?.bio || el.message || "";
              }
            } else if (type === "send") {
              if (isAdminVariant) {
                // Admin viendo solicitudes enviadas: mostrar destinatario (user/invitee)
                title = el.user?.displayName || (el.invitee ? `${el.invitee?.firstName || ""} ${el.invitee?.lastName || ""}`.trim() : "");
                photoProfile = el.user?.avatarUrl || el.invitee?.avatarUrl || "";
                description = el.message || "";
              } else {
                // Usuario viendo solicitudes enviadas: mostrar comunidad destino
                title = el.community?.name || "";
                photoProfile = el.community?.avatarUrl || "";
                description = el.community?.bio || el.message || "";
              }
            }

            return (
              <div className={styles.card} key={index}>
                <CardInvitation
                  id={el.id}
                  title={title}
                  description={description}
                  photoProfile={photoProfile}
                  variant={variant}
                  type={type}
                  isAdmin={isAdmin}
                  warningText={el.wasRemoved ? "Usuario eliminado anteriormente" : null}
                />
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMessage}>
            <CommunityEmpty title={"No tienes invitaciones pendientes"} />
          </div>
        )}
      </div>
    </div>
  );
};
