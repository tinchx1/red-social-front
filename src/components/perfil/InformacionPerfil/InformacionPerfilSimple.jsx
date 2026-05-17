"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./InformacionPerfil.module.scss";
import ProfileMediaHeaderSimple from "@/components/perfil/ProfileMediaHeader/ProfileMediaHeaderSimple";
import ContactStatusButton from "@/components/perfil/ContactStatusButton/ContactStatusButton";
import insigniaPark from "@/assets/insigniaVerificado.svg?url";
import insigniaCompany from "@/assets/insignia-company.svg?url";
import { usePlan } from "@/contexts";
import { useProfile } from "@/contexts/ProfileContext";

const InformacionPerfilSimple = ({
  profile,
  contactStatus,
  userId,
  clickable = false,
}) => {
  const router = useRouter();
  const { profile: user } = useProfile();
  const { planKey } = usePlan();
  const firstName = profile.firstName || profile.name?.split(" ")[0] || "";
  const lastName =
    profile.lastName || profile.name?.split(" ").slice(1).join(" ") || "";
  const displayName = profile.roleKey === "persona"
    ? `${firstName} ${lastName}`.trim()
    : firstName || profile.name || "";
  const phone = profile.phone || "";
  const websiteUrl =
    profile.profile?.websiteUrl || profile.websiteUrl || profile.website || "";
  const linkedinUrl =
    profile.profile?.linkedinUrl ||
    profile.linkedinUrl ||
    profile.linkedin ||
    "";
  const selectedInterests = Array.isArray(profile.industrialSectors)
    ? profile.industrialSectors
    : [];
  const addressParts = [
    profile.address || profile.street || "",
    profile.city || profile.town || "",
    profile.province || profile.state || "",
  ].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  const handleClick = () => {
    if (clickable && userId) {
      router.push(`/perfil/${userId}`);
    }
  };
  const content = (
    <div className={styles.infoContainer}>
      <ProfileMediaHeaderSimple
        avatarUrl={profile.avatar}
        bannerUrl={profile.banner}
      />

      <div className={styles.content} style={{ paddingTop: "60px" }}>
        <div className={styles.header}>
          <h1>
            {displayName}
            {profile.roleKey !== "persona" && (
              <>
                {"\u00A0"}
                <span className={styles.verifiedBadge}>
                  <Image
                    src={
                      profile.roleKey === "parque_industrial"
                        ? insigniaPark
                        : insigniaCompany
                    }
                    alt="Verificado"
                    width={20}
                    height={20}
                  />
                </span>
              </>
            )}
          </h1>
        </div>

        {/* {planKey === "full" && ( */}
          <>
            {fullAddress && (
              <div className={styles.contactInfo}>
                <div className={styles.contactRow}>
                  <span className={styles.addressSection}>{fullAddress}</span>
                </div>
              </div>
            )}

            <div className={styles.contactInfo}>
              {phone && (
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Teléfono</span>
                  <span>{phone}</span>
                </div>
              )}
              {profile.email && (
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Correo</span>
                  <span>{profile.email}</span>
                </div>
              )}
              {websiteUrl && (
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Web</span>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {websiteUrl}
                  </a>
                </div>
              )}
              {linkedinUrl && (
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>LinkedIn</span>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkedinUrl}
                  </a>
                </div>
              )}
            </div>

            {selectedInterests.length > 0 && (
              <div className={styles.interests}>
                <div className={styles.interestRow}>
                  <span className={styles.contactLabel}>Intereses</span>
                  <div className={styles.interestTags}>
                    {selectedInterests.map((sector, index) => (
                      <span key={index} className={styles.interestTag}>
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
          <div className={styles.contactValue} style={{ marginTop: "8px" }}>
          <span className={styles.contactsCount}>
            {profile.contactsCount || 0} Contactos
          </span>
          {contactStatus && planKey !== "free" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={styles.contactButton}
            >
              <ContactStatusButton
                contactStatus={contactStatus}
                userId={userId}
                currentUserId={user?.id}
                isSearchContext={clickable}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (clickable) {
    return (
      <div
        onClick={handleClick}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default InformacionPerfilSimple;
