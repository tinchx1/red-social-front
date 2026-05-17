"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./ProfileModal.module.scss";
import ProfileIcon from "@/assets/profile.svg";
import { Button, LogoutModal } from "@/components";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";


const ProfileModal = ({ isSuperAdmin, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const modalRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { profile: user } = useProfile();
  const toggleModal = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsOpen(false); // Close profile modal when opening logout modal
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  useEffect(() => {
    // Close on route change
    if (isOpen || isLogoutModalOpen) {
      setIsOpen(false);
      setIsLogoutModalOpen(false);
    }
  }, [pathname]);

  const handleAdsClick = () => {
    router.push("/anuncios");
  };
  const handleConfiguracionClick = () => {
    router.push("/configuracion");
  };

  const handleAyudaClick = () => {
    router.push("/consultoria");
  };
  return (
    <div
      className={
        styles.profileContainer +
        (isSuperAdmin ? " " + styles.superAdminBorder : "")
      }
      ref={modalRef}
    >
      <button
        className={styles.profileButton}
        onClick={toggleModal}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <ProfileIcon
          className={styles.profileIcon}
          preserveAspectRatio="xMidYMid meet"
        />
      </button>

      {isOpen && (
        <>
          <div className={styles.modalOverlay} onClick={closeModal} />
          <div className={styles.modal}>
            <div className={styles.userInfo}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  <img
                    src={user?.avatarUrl || "/images/profile.svg"}
                    alt="Avatar"
                    className={styles.avatarImage}
                  />
                </div>
              </div>
              <div className={styles.userDetails}>
                <h3 className={`${styles.userName} u-wrap-anywhere`}>
                  {user?.roleKey === 'persona'
                    ? `${user?.firstName} ${user?.lastName ?? ""}`.trim() || "Usuario"
                    : user?.firstName || user?.name || "Usuario"
                  }
                </h3>
                <p className={styles.userOrganization}>
                  {user?.profile?.industry || user?.company || ""}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              style={{ width: "100%" }}
              onClick={() => router.push("/perfil")}
            >
              Ver perfil
            </Button>

            <div className={styles.divider} />
            <div className={styles.menuSection}>
              <h4 className={styles.sectionTitle}>Cuenta</h4>
              <div className={styles.menuItems}>
                <button
                  className={styles.menuItem}
                  onClick={handleConfiguracionClick}
                >
                  Ajustes
                </button>
                <button className={styles.menuItem} onClick={handleAdsClick}>
                  Anuncios
                </button>
                <button className={styles.menuItem} onClick={handleAyudaClick}>
                  Ayuda
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            <button className={styles.logoutButton} onClick={openLogoutModal}>
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </div>
  );
};

export default ProfileModal;
