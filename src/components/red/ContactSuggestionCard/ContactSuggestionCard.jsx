"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ContactSuggestionCard.module.scss";
import { Button } from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import ContactModal from "../ContactModal/ContactModal";
import UserPlusIcon from "@/assets/user-plus.svg";
import PhoneIcon from "@/assets/phone.svg";

/**
 * @param {{
 *   contact: {
 *     id: string;
 *     firstName: string;
 *     lastName?: string;
 *     role: { key: string };
 *     avatarUrl?: string;
 *     bannerUrl?: string;
 *     province?: string;
 *     city?: string;
 *     bio?: string;
 *     phone?: string;
 *     industry?: string;
 *   };
 *   onSendRequest: (id: string, message?: string) => void;
 *   onContact: (id: string) => void;
 * }} props
 */
export default function ContactSuggestionCard({
  contact,
  onSendRequest,
  onContact,
}) {
  // Extract and transform data from contact object
  const {
    id,
    firstName,
    lastName,
    role,
    avatarUrl,
    bannerUrl,
    email,
    province,
    city,
    bio,
    phone,
    industry,
  } = contact;
  // Use bannerUrl or fallback to bannerImage for compatibility
  const bannerImage = bannerUrl || contact.bannerImage;

  const name =
    role.key === "empresa" || role.key === "parque_industrial"
      ? firstName
      : `${firstName} ${lastName ?? ""}`.trim();
  const roleDisplay =
    role.key === "empresa"
      ? "Empresa"
      : role.key === "parque_industrial"
      ? "Parque Industrial"
      : "Persona";
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSendRequest = async () => {
    try {
      await onSendRequest(id);
      showSuccess("Solicitud de contacto enviada exitosamente");
    } catch (error) {
      console.error("Error sending contact request:", error);
      showError("Error al enviar la solicitud de contacto");
    }
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const contactData = {
    ...contact,
    displayName: name,
    avatarUrl: avatarUrl || "/images/profile.svg",
    bannerUrl: bannerImage || null,
    emailVerified: false, // Default since it's not in the API response
    company: role.key === "empresa" ? name : null,
    industrialSectors: null,
    email: email,
  };
  return (
    <div className={styles.suggestionCard}>
      {/* Desktop Layout - Banner with centered profile picture */}
      <div className={styles.desktopLayout}>
        <div className={styles.bannerContainer}>
          {bannerImage ? (
            <>
              <img
                src={bannerImage}
                alt="Banner"
                className={styles.bannerImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </>
          ) : (
            <>
              <div className={styles.defaultBanner} />
            </>
          )}

          <div className={styles.profilePictureContainer}>
            <Link href={`/perfil/${id}`}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  className={styles.profilePicture}
                  width={80}
                  height={80}
                  priority
                />
              ) : (
                <div className={styles.defaultProfilePicture}>
                  <span>{name.charAt(0)}</span>
                </div>
              )}
            </Link>
          </div>
        </div>

        <div className={styles.desktopContent}>
          <div className={styles.contactInfo}>
            <Link href={`/perfil/${id}`}>
              <h3 className={styles.name}>{name}</h3>
            </Link>
            <p className={styles.role}>{roleDisplay}</p>
          </div>

          <div className={styles.desktopActions}>
            <Button
              variant="primary"
              onClick={handleContactClick}
              iconPosition="right"
              icon={<PhoneIcon height={18} width={18} />}
            >
              Contactar
            </Button>

            <Button
              variant="link"
              onClick={handleSendRequest}
              className={styles.requestLink}
              iconPosition="right"
              icon={<UserPlusIcon height={13} width={18} />}
            >
              Enviar Solicitud
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Horizontal with profile picture on left */}
      <div className={styles.mobileLayout}>
        <Link
          href={`/perfil/${id}`}
          className={styles.mobileContactInfoContainer}
        >
          <div className={styles.mobileProfilePicture}>
            <Image
              src={avatarUrl || "/images/profile.svg"}
              alt={name}
              className={styles.profilePicture}
              width={80}
              height={80}
              priority
            />
          </div>
          <div className={styles.mobileContactInfo}>
            <h3 className={styles.mobileName}>{name}</h3>
            <p className={styles.mobileRole}>{roleDisplay}</p>
          </div>
        </Link>

        <div className={styles.mobileContent}>
          <div className={styles.mobileActions}>
            <Button
              variant="light-blue"
              onClick={handleSendRequest}
              iconPosition="right"
              icon={<UserPlusIcon height={14} width={18} />}
            >
              Enviar Solicitud
            </Button>

            <Button
              variant="primary"
              onClick={handleContactClick}
              iconPosition="right"
              icon={<PhoneIcon height={18} width={18} />}
            >
              Contactar
            </Button>
          </div>
        </div>
      </div>

      {isContactModalOpen && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          contact={contactData}
          onSendRequest={onSendRequest}
        />
      )}
    </div>
  );
}
