"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import styles from "./ContactModal.module.scss";
import { Button } from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import CloseIcon from "@/assets/close.svg";
import { PROVINCE_OPTIONS } from "@/constants/personForm";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   contact: {
 *     id: string;
 *     firstName: string;
 *     lastName: string | null;
 *     avatarUrl: string;
 *     bannerUrl: string | null;
 *     bio: string | null;
 *     province: string | null;
 *     city: string | null;
 *     industry: string | null;
 *     company: string | null;
 *     industrialSectors: string[] | null;
 *     phone: string;
 *     emailVerified: boolean;
 *     role: { key: string };
 *     displayName: string;
 *   };
 *   onSendRequest?: (id: string, message?: string) => Promise<void> | void;
 * }} props
 */
export default function ContactModal({
  isOpen,
  onClose,
  contact,
  onSendRequest,
}) {
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !contact) {
    return null;
  }

  const handleSendRequest = async () => {
    try {
      if (submitting) return;
      setSubmitting(true);
      if (onSendRequest) {
        await onSendRequest(contact.id, "");
      }
      showSuccess("Solicitud de contacto enviada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error sending contact request:", error);
      showError("Error al enviar la solicitud de contacto");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions to get display values
  const getDisplayName = () => {
    if (contact.displayName) return contact.displayName;
    if (contact.lastName)
      return `${contact.firstName} ${contact.lastName ?? ""}`;
    if (contact.company) return contact.company;
    return contact.firstName;
  };

  const getCompanyInfo = () => {
    if (contact.company) return contact.company;
    if (contact.role?.key === "parque_industrial") return "Parque Industrial";
    return null;
  };

  const getDescription = () => {
    let description = "";
    if (contact.bio) description = contact.bio;
    else if (
      contact.industrialSectors &&
      contact.industrialSectors.length > 0
    ) {
      description = `Sectores: ${contact.industrialSectors.join(", ")}`;
    } else if (contact.industry) description = `Industria: ${contact.industry}`;
    else return "Sin descripción disponible";

    // Limitar a 300 caracteres máximo para evitar desbordamiento
    return description.length > 300
      ? `${description.substring(0, 297)}...`
      : description;
  };

  const formatProvince = (province) => {
    if (!province) return null;
    const found = PROVINCE_OPTIONS.find((opt) => opt.value === province);
    return found ? found.label : province;
  };

  const getLocation = () => {
    const formattedProvince = formatProvince(contact.province);
    if (contact.city && formattedProvince) {
      return `${contact.city}, ${formattedProvince}`;
    }
    if (contact.city) return contact.city;
    if (formattedProvince) return formattedProvince;
    return null;
  };
  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </button>

        <div className={styles.content}>
          <div className={styles.bannerContainer}>
            {contact.bannerUrl ? (
              <Image
                className={styles.banner}
                src={contact.bannerUrl || "/images/banner.svg"}
                alt="Banner"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className={styles.banner}></div>
            )}
          </div>
          <div className={styles.profileHeader}>
            <Link href={`/perfil/${contact.id}`}>
              <div className={styles.avatarContainer}>
                <Image
                  src={contact.avatarUrl || "/images/profile.svg"}
                  alt={getDisplayName()}
                  width={80}
                  height={80}
                  className={styles.avatar}
                />
              </div>
            </Link>
            <div className={styles.profileInfo}>
              <Link href={`/perfil/${contact.id}`}>
                <h2 className={styles.name}>{getDisplayName()}</h2>
              </Link>
              {getCompanyInfo() && (
                <p className={styles.company}>{getCompanyInfo()}</p>
              )}
              {getLocation() && (
                <p className={styles.location}>{getLocation()}</p>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleSendRequest}
              disabled={submitting}
            >
              {submitting ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.leftSection}>
              <h3 className={styles.sectionTitle}>DESCRIPCIÓN Y ROL</h3>
              <div className={styles.description}>
                <p>{getDescription()}</p>
              </div>
            </div>

            <div className={styles.rightSection}>
              <h3 className={styles.sectionTitle}>CONTACTO</h3>
              <div className={styles.contactInfo}>
                {contact.phone && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>TELÉFONO</span>
                    <span className={styles.contactValue}>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>EMAIL</span>
                    <span className={styles.contactValue}>{contact.email}</span>
                  </div>
                )}
                {contact.city && contact.province && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>Dirección</span>
                    <span className={styles.contactValue}>
                      {contact.city}, {formatProvince(contact.province)}
                    </span>
                  </div>
                )}
                {contact.emailVerified && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>
                      EMAIL VERIFICADO
                    </span>
                    <span className={styles.contactValue}>
                      <span className={styles.verified}>✓ Verificado</span>
                    </span>
                  </div>
                )}
                {contact.industry && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>INDUSTRIA</span>
                    <span className={styles.contactValue}>
                      {contact.industry}
                    </span>
                  </div>
                )}
                {contact.industrialSectors &&
                  contact.industrialSectors.length > 0 && (
                    <div className={styles.contactRow}>
                      <span className={styles.contactLabel}>SECTORES</span>
                      <span className={styles.contactValue}>
                        {contact.industrialSectors.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
