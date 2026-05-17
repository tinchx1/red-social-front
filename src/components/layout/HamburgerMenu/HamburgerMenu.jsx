"use client";

import { useState } from "react";
import styles from "./HamburgerMenu.module.scss";
import HamburgerIcon from "@/assets/hamburger.svg";
import CloseIcon from "@/assets/close.svg";
import { MENU_ITEMS, MENU_ITEMS_ADMIN } from "@/constants/menuItems";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFooterMenu } from "@/contexts";
import { useProfile } from "@/contexts/ProfileContext";

const HamburgerMenu = ({ isSuperAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile: user } = useProfile();
  const router = useRouter();
  const { closeFooterMenu } = useFooterMenu();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = () => {
    toggleMenu();
    closeFooterMenu();
  };

  return (
    <>
      <button className={styles.menuButton} onClick={toggleMenu}>
        <HamburgerIcon
          className={styles.hamburgerIcon}
          width="25"
          height="25"
        />
      </button>

      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={toggleMenu}>
          <div
            className={styles.menuContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.closeButtonContainer}>
              <button className={styles.closeButton} onClick={toggleMenu}>
                <CloseIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.menuItems}>
              {isSuperAdmin ?? user?.roleKey === "super_admin"
                ? MENU_ITEMS_ADMIN.map((item) => {
                    const IconComponent = item.icon;
                    if (item.id === "gestion" || item.id === "mensajes") {
                      return (
                        <Link
                          href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/${item.id}`}
                          onClick={handleMenuItemClick}
                          key={item.id}
                          className={styles.menuItem}
                        >
                          <IconComponent className={styles.menuIcon} />
                          <span className={styles.menuLabel}>{item.label}</span>
                        </Link>
                      );
                    } else {
                      return (
                        <Link
                          href={`/${item.id}`}
                          onClick={handleMenuItemClick}
                          key={item.id}
                          className={styles.menuItem}
                        >
                          <IconComponent className={styles.menuIcon} />
                          <span className={styles.menuLabel}>{item.label}</span>
                        </Link>
                      );
                    }
                  })
                : MENU_ITEMS.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        href={`/${item.id}`}
                        onClick={handleMenuItemClick}
                        key={item.id}
                        className={styles.menuItem}
                      >
                        <IconComponent className={styles.menuIcon} />
                        <span className={styles.menuLabel}>{item.label}</span>
                      </Link>
                    );
                  })}
              {user?.roleKey === "free" && (
                <Button
                  variant="primary"
                  rounded="small"
                  style={{
                    marginTop: "20px",
                    maxWidth: "550px",
                    alignSelf: "center",
                    width: "100%",
                  }}
                  onClick={() => {
                    router.push("/planes");
                    handleMenuItemClick();
                  }}
                >
                  Suscribite
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;
