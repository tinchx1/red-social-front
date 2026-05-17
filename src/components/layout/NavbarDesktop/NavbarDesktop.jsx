"use client";
import styles from "./NavbarDesktop.module.scss";
import Image from "next/image";
import LogoIcon from "@/public/images/apia-logo.png";
import { MENU_ITEMS, MENU_ITEMS_ADMIN } from "@/constants/menuItems";
import { BadgePlan, Button, ProfileModal } from "@/components";
import ConsultIcon from "@/assets/bulb.svg";
import NewNotificationIcon from "@/assets/new-notificacion.svg";
import MessageNotificationIcon from "@/assets/message-notification.svg";
import { useSocket } from "@/contexts/SocketContext";
import { useSearch, useMessageNotification, usePlan } from "@/contexts";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationState } from "@/hooks/useNotificationState";
import InputDesktop from "@/components/search/inputDesktop/inputDesktop";
import RecommendationSearch from "@/components/search/RecommendationSearch/RecommendationSearch";
import RecentSearches from "@/components/search/RecentSearches/RecentSearches";
import { useOpenChats } from "@/contexts/OpenChatsContext";
import { useProfile } from "@/contexts/ProfileContext";

const NavbarDesktop = ({ isSuperAdmin }) => {
  const pathname = usePathname();
  const router = useRouter();
  const socket = useSocket();
  const { profile: user } = useProfile();
  const { planKey, planName } = usePlan();
  const { openChatIds, isChatOpen } = useOpenChats();
  const { setOpenSearchDesktop } = useSearch();
  const { hasNewMessage, messageIconKey, showNewMessage, clearNewMessage } =
    useMessageNotification();
  const { hasNewNotification, notifIconKey, clearNotification } =
    useNotificationState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [chatNotificationsEnabled, setChatNotificationsEnabled] =
    useState(true);

  // Register the desktop search opening function with the context
  useEffect(() => {
    setOpenSearchDesktop(() => {
      if (!isSearchOpen) {
        setIsSearchOpen(true);
        // Focus and select the input after opening
        setTimeout(() => {
          const input = document.querySelector("[data-search-input]");
          if (input) {
            input.focus();
            input.select();
          }
        }, 100);
      }
    });
  }, [isSearchOpen, setOpenSearchDesktop]);

  // Socket para escuchar nuevos mensajes
  useEffect(() => {
    if (!socket || !user) return;

    const handleLiveMessage = (data) => {
      if (!chatNotificationsEnabled) return;
      // Solo mostrar notificación si el mensaje no es del usuario actual
      if (data.author_id !== user.id && !isChatOpen(String(data.chat_id))) {
        showNewMessage();
      }
    };

    const handleUpdateUserRooms = async (data) => {
      if (!data.roomId) return;

      try {
        // Importar la función getChatRoomById
        const { getChatRoomById } = await import("@/actions/chat");
        const res = await getChatRoomById(data.roomId, user.id);
        // No mostrar notificación si el chat está abierto actualmente
        if (res?.chat?.id && isChatOpen(String(res.chat.id))) return;
        // Solo mostrar notificación si hay no leídos
        if (chatNotificationsEnabled && res.chat?.unreadMessages > 0) {
          showNewMessage();
        }
      } catch (error) {
        // Fallback: mostrar notificación si no podemos verificar el autor
      }
    };

    socket.on("messageLive", handleLiveMessage);
    socket.on("updateUserRooms", handleUpdateUserRooms);

    return () => {
      socket.off("messageLive", handleLiveMessage);
      socket.off("updateUserRooms", handleUpdateUserRooms);
    };
  }, [socket, user, isChatOpen, openChatIds, chatNotificationsEnabled]);

  // Cargar preferencias de notificaciones para habilitar/deshabilitar notificaciones de chat
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.id) return;
        const { getNotificationPreferences } = await import(
          "@/actions/notifications"
        );
        const prefs = await getNotificationPreferences({ userId: user.id });
        if (mounted) setChatNotificationsEnabled(Boolean(prefs?.newMessages));
      } catch {
        if (mounted) setChatNotificationsEnabled(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (pathname?.includes("/mensajes")) {
      clearNewMessage();
    }

    // Cerrar búsqueda cuando se navega a otra ruta
    setIsSearchOpen(false);
    setSearchInputValue("");
  }, [pathname, clearNewMessage]);

  const handleSearchSubmit = (searchValue, recommendation = null) => {
    const value = String(searchValue || "").trim();
    if (!value) {
      setIsSearchOpen(false);
      return;
    }

    // Guardar en historial de búsquedas (label + url)
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("searchHistory")
          : null;
      const current = raw ? JSON.parse(raw) : [];
      const url = recommendation
        ? `/buscar?keyword=${encodeURIComponent(
            value
          )}&type=${encodeURIComponent(
            recommendation.type
          )}&ref=${encodeURIComponent(recommendation.id)}`
        : `/buscar?keyword=${encodeURIComponent(value)}`;
      const entry = { label: value, url };
      const normalized = Array.isArray(current)
        ? current
            .map((it) => {
              if (typeof it === "string") {
                return {
                  label: it,
                  url: `/buscar?keyword=${encodeURIComponent(it)}`,
                };
              }
              if (it && typeof it === "object" && it.label && it.url) return it;
              return null;
            })
            .filter(Boolean)
        : [];
      const withoutDup = normalized.filter((it) => it.url !== entry.url);
      const updated = [entry, ...withoutDup].slice(0, 10);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("searchHistory", JSON.stringify(updated));
      }
    } catch {}

    setIsSearchOpen(false);
    setSearchInputValue("");

    // Aquí puedes manejar la navegación o lógica específica según el tipo de recomendación
    if (recommendation) {
      // Navegar según el tipo: company, community, group, etc.
      switch (recommendation.type) {
        case "company":
          // Navegar a perfil de empresa
          break;
        case "community":
          // Navegar a comunidad
          break;
        case "group":
          // Navegar a grupo
          break;
        default:
          // Búsqueda general
          break;
      }
    }

    // trigger actual search here if needed
  };

  const handleSearchInputChange = (value) => {
    setSearchInputValue(value);
    if (value.trim()) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchInputClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClick = () => {
    const next = !isSearchOpen;
    setIsSearchOpen(next);
    // RecentSearches refreshes on open
  };
  const isActive = (itemId) => {
    if (itemId === "inicio") {
      return pathname === "/inicio";
    }
    return pathname.includes(`/${itemId}`);
  };
  // Block scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);
  return (
    <>
      {/* Search Overlay */}
      {isSearchOpen && (
        <div
          className={styles.searchOverlay}
          onClick={() => setIsSearchOpen(false)}
        ></div>
      )}

      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <div
            className={styles.logoContainer}
            onClick={() => router.push("/inicio")}
          >
            <Image
              src={LogoIcon}
              alt="Logo"
              width={129}
              height={50}
              priority
              fetchPriority="high"
            />
          </div>
        </div>

        <div className={styles.centerSection}>
          {isSuperAdmin ?? user?.roleKey === "super_admin" ? (
            <div className={styles.menuItems}>
              {MENU_ITEMS_ADMIN.map((item) => {
                let IconComponent = item.icon;
                let iconKey = undefined;

                if (item.id === "notificaciones" && hasNewNotification) {
                  IconComponent = NewNotificationIcon;
                  iconKey = `notif-${notifIconKey}`;
                } else if (
                  item.id === "mensajes" &&
                  hasNewMessage &&
                  chatNotificationsEnabled
                ) {
                  IconComponent = MessageNotificationIcon;
                  iconKey = `msg-${messageIconKey}`;
                }

                const iconClassName =
                  IconComponent === ConsultIcon
                    ? `${styles.menuIcon} ${styles.bulbIcon}`
                    : `${styles.menuIcon} ${
                        (item.id === "notificaciones" && hasNewNotification) ||
                        (item.id === "mensajes" &&
                          hasNewMessage &&
                          chatNotificationsEnabled)
                          ? styles.wiggle
                          : ""
                      }`;
                const isItemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "gestion" || item.id === "mensajes") {
                        router.replace(
                          `${process.env.NEXT_PUBLIC_ADMIN_URL}/${item.id}`
                        );
                      } else {
                        if (item.id === "notificaciones") clearNotification();
                        router.push(`/${item.id}`);
                      }
                      if (item.id === "mensajes") clearNewMessage();
                    }}
                    className={`${styles.menuItem} ${
                      isItemActive ? styles.menuItemActive : ""
                    }`}
                  >
                    <IconComponent
                      key={iconKey}
                      className={iconClassName}
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <span className={styles.menuLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.menuItems}>
              {MENU_ITEMS.map((item) => {
                let IconComponent = item.icon;
                let iconKey = undefined;

                if (item.id === "notificaciones" && hasNewNotification) {
                  IconComponent = NewNotificationIcon;
                  iconKey = `notif-${notifIconKey}`;
                } else if (
                  item.id === "mensajes" &&
                  hasNewMessage &&
                  chatNotificationsEnabled
                ) {
                  IconComponent = MessageNotificationIcon;
                  iconKey = `msg-${messageIconKey}`;
                }

                const iconClassName =
                  IconComponent === ConsultIcon
                    ? `${styles.menuIcon} ${styles.bulbIcon}`
                    : `${styles.menuIcon} ${
                        (item.id === "notificaciones" && hasNewNotification) ||
                        (item.id === "mensajes" &&
                          hasNewMessage &&
                          chatNotificationsEnabled)
                          ? styles.wiggle
                          : ""
                      }`;
                const isItemActive = isActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "notificaciones") clearNotification();
                      if (item.id === "mensajes") clearNewMessage();
                      router.push(`/${item.id}`);
                    }}
                    className={`${styles.menuItem} ${
                      isItemActive ? styles.menuItemActive : ""
                    }`}
                  >
                    <IconComponent
                      key={iconKey}
                      className={iconClassName}
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <span className={styles.menuLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.rightSection}>
          <InputDesktop
            placeholder="Buscar empresa o comunidad"
            onSearch={handleSearchSubmit}
            onInputChange={handleSearchInputChange}
            onInputClick={handleSearchInputClick}
            onClose={() => setIsSearchOpen(false)}
            value={searchInputValue}
          />
          {(!isSuperAdmin ?? user?.roleKey === "super_admin") && (
            <div className={styles.buttonContainer}>
              {planKey === "free" ? (
                <Button
                  variant="primary"
                  rounded="small"
                  onClick={() => router.push("/planes")}
                >
                  Suscribite
                </Button>
              ) : (
                <BadgePlan label={planName} />
              )}
            </div>
          )}
          <ProfileModal isSuperAdmin={isSuperAdmin} disabled={isSearchOpen} />

          {isSearchOpen && !searchInputValue && (
            <RecentSearches
              isOpen={true}
              placement="absolute"
              onClose={() => setIsSearchOpen(false)}
              onSelect={handleSearchSubmit}
              title="Últimas búsquedas"
            />
          )}
          {isSearchOpen && searchInputValue && (
            <RecommendationSearch
              isOpen={true}
              placement="absolute"
              onClose={() => setIsSearchOpen(false)}
              onSelect={handleSearchSubmit}
              searchQuery={searchInputValue}
              title="Resultados de búsqueda"
            />
          )}
        </div>
      </nav>
    </>
  );
};

export default NavbarDesktop;
