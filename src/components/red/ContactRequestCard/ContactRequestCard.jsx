"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ContactRequestCard.module.scss";
import { Button } from "@/components/ui";
import ContactModal from "../ContactModal/ContactModal";
import { useRouter } from "next/navigation";
import AcceptIcon from "@/assets/Done_ring_round.svg";
import RejectIcon from "@/assets/close_ring.svg";

/**
 * @param {{
 *   id: string;
 *   userId: string;
 *   name: string;
 *   role: string;
 *   avatar?: string;
 *   bannerImage?: string;
 *   bannerUrl?: string;
 *   description?: string;
 *   phone?: string;
 *   email?: string;
 *   data1?: string;
 *   data2?: string;
 *   message?: string;
 *   onAccept: (id: string) => void;
 *   onReject: (id: string) => void;
 * }} props
 */
export default function ContactRequestCard({
  id,
  userId,
  name,
  role,
  avatar,
  bannerImage,
  bannerUrl,
  description = "Emmelie is a traditional book-worm and has always been from a young age. She is a housekeeper mom with two kids and she has a lot of time to read and relax.\n\nEmmelie tends to casually browse books in a bookstore but she usually has a hard time finding the right one and spends a lot of time browsing.",
  phone = "+54 9 221 123 45 85",
  email = "contacto1@apia.com.ar",
  data1 = "ejemplodato1",
  data2 = "ejemplootrodato",
  message,
  onAccept,
  onReject,
}) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const router = useRouter();
  const finalBanner = bannerUrl || bannerImage;
  const handleAccept = () => {
    onAccept(id);
    router.refresh();
  };

  const handleReject = () => {
    onReject(id);
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const contactData = {
    id,
    name,
    company: role,
    avatar: avatar || "/images/profile.svg",
    description,
    phone,
    email,
    data1,
    data2,
  };

  return (
    <div>
      <p className={styles.requestText}>
        <Link href={`/perfil/${userId}`}>
          <span className={styles.nameRequestText}>{name}</span>
        </Link>{" "}
        te envió una solicitud
      </p>
      <div className={styles.cardRow}>
        <div className={styles.requestCard}>
          {/* Desktop Layout - Banner with centered profile picture */}
          <div className={styles.desktopLayout}>
            <div className={styles.bannerContainer}>
              {finalBanner ? (
                <img
                  src={finalBanner}
                  alt="Banner"
                  className={styles.bannerImage}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className={styles.defaultBanner} />
              )}

              <div className={styles.profilePictureContainer}>
                <Link href={`/perfil/${userId}`}>
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      className={styles.profilePicture}
                      width={47}
                      height={47}
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
                <Link href={`/perfil/${userId}`}>
                  <h3 className={styles.name}>{name}</h3>
                </Link>
                <p className={styles.role}>{role}</p>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Keep existing horizontal layout */}
          <div className={styles.mobileLayout}>
            {/* Profile Picture */}
            <div className={styles.profileSection}>
              <Link href={`/perfil/${userId}`}>
                <Image
                  src={avatar || "/images/profile.svg"}
                  alt={name}
                  className={styles.profilePicture}
                  width={56}
                  height={56}
                  priority
                />
              </Link>
            </div>

            {/* Contact Info */}
            <div className={styles.contactInfoContainer}>
              <div className={styles.contactInfo}>
                <Link href={`/perfil/${userId}`}>
                  <h3 className={styles.name}>{name}</h3>
                </Link>
                <p className={styles.role}>{role}</p>
                <p className={styles.requestText}>te envió una solicitud</p>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Button
                  onClick={handleReject}
                  variant="light-blue"
                  rounded="small"
                >
                  Rechazar
                </Button>
                <Button onClick={handleAccept} rounded="small">
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Outside desktop actions */}
        <div className={styles.desktopActionsOutside}>
          <button onClick={handleAccept} className={styles.acceptButton}>
            <AcceptIcon />
          </button>
          <button onClick={handleReject} className={styles.acceptButton}>
            <RejectIcon width={20} height={20} />
          </button>
        </div>

        {isContactModalOpen && (
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            contact={contactData}
          />
        )}
      </div>
    </div>
  );
}
