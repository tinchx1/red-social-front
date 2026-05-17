"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./RedAside.module.scss";
import UserPlus from "@/assets/user-plus.svg";
import UsersIcon from "@/assets/users.svg";
import StarIcon from "@/assets/star.svg";

/**
 * Aside navigation for Red section
 * Shows active state based on current pathname
 */
/**
 * @param {{ contactsCount?: number; solicitudesCount?: number; isBlocked?: boolean }} props
 */
export default function RedAside({
  contactsCount = 0,
  solicitudesCount = 0,
  isBlocked = false,
}) {
  const pathname = usePathname();
  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const routes = [
    {
      label: "Mis Contactos",
      href: "/red/mis-contactos",
      count: contactsCount,
    },
    {
      label: "Ampliar Red",
      href: "/red/ampliar-red",
      icon: UserPlus,
    },
    {
      label: "Solicitudes",
      href: "/red/solicitudes",
      count: solicitudesCount,
    },
  ];

  const handleLinkClick = (e, href) => {
    if (isBlocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  return (
    <>
      <div className={styles.mobileNav}>
        <Link
          href="/red/mis-contactos"
          className={`${styles.mobileTab} ${
            isActive("/red/mis-contactos") ? styles.mobileTabActive : ""
          } ${isBlocked ? styles.disabled : ""}`}
          onClick={(e) => handleLinkClick(e, "/red/mis-contactos")}
        >
          Mis contactos
        </Link>
        <Link
          href="/red/ampliar-red"
          className={`${styles.mobileTab} ${
            isActive("/red/ampliar-red") ? styles.mobileTabActive : ""
          } ${isBlocked ? styles.disabled : ""}`}
          onClick={(e) => handleLinkClick(e, "/red/ampliar-red")}
        >
          Ampliar red
        </Link>
        <Link
          href="/red/solicitudes"
          className={`${styles.mobileTab} ${
            isActive("/red/solicitudes") ? styles.mobileTabActive : ""
          } ${isBlocked ? styles.disabled : ""}`}
          onClick={(e) => handleLinkClick(e, "/red/solicitudes")}
        >
          Solicitudes
        </Link>
      </div>

      <aside className={styles.aside}>
        <nav>
          <div className={styles.navHeader}>
            <h3 className={styles.navTitle}>Mi Red</h3>
            <UsersIcon
              className={styles.headerIcon}
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
          <ul className={styles.navList}>
            {routes.map((route) => {
              const ActiveIcon = route.icon;
              const active = isActive(route.href);
              return (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className={`${styles.link} ${active ? styles.active : ""} ${
                      isBlocked ? styles.disabled : ""
                    }`}
                    onClick={(e) => handleLinkClick(e, route.href)}
                    aria-disabled={isBlocked}
                  >
                    <div className={styles.route}>
                      <span className={styles.label}>{route.label}</span>
                      <span className={styles.counter}>
                        {typeof route.count === "number" ? (
                          <span className={styles.count}>{route.count}</span>
                        ) : ActiveIcon ? (
                          <ActiveIcon
                            className={styles.iconSearch}
                            preserveAspectRatio="xMidYMid meet"
                          />
                        ) : null}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {isBlocked && (
            <div className={styles.premiumLink}>
              <Link href="/planes" className={styles.premiumLinkContent}>
                <div className={styles.premiumText}>
                  <p className={styles.premiumSubtitle}>
                    Alcanza tus objetivos con Premium
                  </p>
                  <p className={styles.premiumTitle}>Suscribite a comunidad</p>
                </div>
                <StarIcon className={styles.starIcon} width={20} height={20} />
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
