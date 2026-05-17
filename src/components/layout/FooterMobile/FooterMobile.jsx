"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./FooterMobile.module.scss";
import { usePathname, useParams } from "next/navigation";
import HomeIcon from "@/assets/home.svg";
import MessageIcon from "@/assets/message.svg";
import CommunityIcon from "@/assets/community.svg";
import SearchIcon from "@/assets/search.svg";
import ChatPlusIcon from "@/assets/chat-plus.svg";
import ManagementIcon from "@/assets/gestiones.svg";
import PostForm from "@/components/feed/PostForm/PostForm";
import AdForm from "@/components/ads/AdForm/AdForm";
import InputMobile from "@/components/search/inputMobile/inputMobile";
import RecommendationSearch from "@/components/search/RecommendationSearch/RecommendationSearch";
import RecentSearches from "@/components/search/RecentSearches/RecentSearches";
import { createPost } from "@/actions";
import { usePosts } from "@/contexts/PostsContext";
import Link from "next/link";
import { useSearch, useFooterMenu } from "@/contexts";
import ArrowRightIcon from "@/assets/arrow-right.svg";
import { useProfile } from "@/contexts/ProfileContext";

const FOOTER_ITEMS = [
  {
    id: "inicio",
    icon: HomeIcon,
    label: "Inicio",
  },
  {
    id: "mensajes",
    icon: MessageIcon,
    label: "Mensajes",
  },
  {
    id: "comunidades",
    icon: CommunityIcon,
    label: "Comunidad",
  },
];

const FOOTER_ITEMS_ADMIN = [
  {
    id: "inicio",
    icon: HomeIcon,
    label: "Inicio",
  },
  {
    id: "mensajes",
    icon: MessageIcon,
    label: "Mensajes",
  },
  {
    id: "gestion",
    icon: ManagementIcon,
    label: "Gestión",
  },
];

const FooterMobile = ({ isSuperAdmin }) => {
  const pathname = usePathname();
  const params = useParams();
  const communityId = params.communityId;
  const { profile: user } = useProfile();
  const {
    addPost,
    isPostFormOpen,
    setIsPostFormOpen,
    communityMembershipStatus,
  } = usePosts();
  const { setOpenSearchModal } = useSearch();
  const { setCloseFooterMenu } = useFooterMenu();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const floatingMenuRef = useRef(null);

  // Register the search modal opening function with the context
  useEffect(() => {
    setOpenSearchModal(() => {
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
  }, [isSearchOpen, setOpenSearchModal]);

  // Register the close footer menu function with the context
  useEffect(() => {
    setCloseFooterMenu(() => {
      setIsMenuOpen(false);
    });
  }, [setCloseFooterMenu]);

  // Close floating menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        floatingMenuRef.current &&
        !floatingMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const isActive = (itemId) => {
    if (itemId === "inicio") {
      return pathname === "/inicio";
    }
    if (itemId === "comunidades") {
      return !!communityId || pathname.includes("/comunidades"); // Activo si hay un ID de comunidad
    }
    return pathname.includes(`/${itemId}`);
  };

  const isCommunityPage = !!communityId;
  const isJoined =
    communityMembershipStatus?.status === "approved" ||
    communityMembershipStatus?.status === "creator";

  const showFab = pathname === "/inicio" || (isCommunityPage && isJoined && communityMembershipStatus?.canPost);

  const handleCreatePost = async (postData) => {
    try {
      const result = await createPost(postData);
      if (result?.blocked) {
        throw new Error("You are blocked from this community");
      }
      if (result?.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }
      const newPost = result?.data || result;
      addPost(newPost);
      setIsPostFormOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error?.redirectTo) {
        window.location.href = error.redirectTo;
        return;
      }
      throw error;
    }
  };

  const handlePostClick = () => {
    setIsPostFormOpen(true);
    setIsMenuOpen(false);
  };

  const handleFloatingButtonClick = () => {
    // Si estamos en una página de comunidad, abrir directamente el formulario de posts
    if (isCommunityPage) {
      setIsPostFormOpen(true);
    } else {
      // En otras páginas, mostrar el menú
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleAdClick = () => {
    setIsAdFormOpen(true);
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    const next = !isSearchOpen;
    setIsSearchOpen(next);
    setIsMenuOpen(false);
    // RecentSearches refreshes on open
  };

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
    } catch { }

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
  };

  // removal handled inside RecentSearches

  return (
    <>
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <ArrowRightIcon
            className={styles.arrowRightIcon}
            preserveAspectRatio="xMidYMid meet"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className={styles.searchContainer}>
            <InputMobile
              placeholder="Buscar empresa o comunidad"
              onSearch={handleSearchSubmit}
              onInputChange={handleSearchInputChange}
              onClose={() => setIsSearchOpen(false)}
              value={searchInputValue}
            />
          </div>
        </div>
      )}
      {isSearchOpen && !searchInputValue && (
        <RecentSearches
          isOpen={true}
          placement="bottom"
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleSearchSubmit}
          title="Últimas búsquedas"
        />
      )}
      {isSearchOpen && searchInputValue && (
        <RecommendationSearch
          isOpen={true}
          placement="bottom"
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleSearchSubmit}
          searchQuery={searchInputValue}
          title="Resultados de búsqueda"
        />
      )}

      <footer className={styles.footer}>
        {isSuperAdmin ?? user?.roleKey === "super_admin"
          ? FOOTER_ITEMS_ADMIN.map((item) => {
            const IconComponent = item.icon;
            const isItemActive = isActive(item.id);
            if (item.id === "gestion" || item.id === "mensajes") {
              return (
                <Link
                  href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/${item.id}`}
                  key={item.id}
                  className={`${styles.navItem} ${isItemActive ? styles.navItemActive : ""
                    }`}
                  onClick={handleLinkClick}
                >
                  <IconComponent className={styles.icon} />
                  <span className={styles.label}>{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                href={`/${item.id}`}
                key={item.id}
                className={`${styles.navItem} ${isItemActive ? styles.navItemActive : ""
                  }`}
                onClick={handleLinkClick}
              >
                <IconComponent className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })
          : FOOTER_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isItemActive = isActive(item.id);
            return (
              <Link
                href={`/${item.id}`}
                key={item.id}
                className={`${styles.navItem} ${isItemActive ? styles.navItemActive : ""
                  }`}
                onClick={handleLinkClick}
              >
                <IconComponent className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        <div className={`${styles.navItem}`} onClick={handleSearchClick}>
          <SearchIcon className={styles.icon} />
          <span className={styles.label}>Buscar</span>
        </div>{" "}
        {/* Floating Add Button */}
        <div className={styles.floatingButtonContainer} ref={floatingMenuRef}>
          {isMenuOpen && (
            <div className={styles.floatingMenu}>
              <button className={styles.menuOption} onClick={handlePostClick}>
                Crear Publicación
              </button>
              <button className={styles.menuOption} onClick={handleAdClick}>
                Crear Anuncio
              </button>
            </div>
          )}
          {showFab && !isSearchOpen && (
            <>
              <button
                className={styles.floatingButton}
                onClick={handleFloatingButtonClick}
              >
                <ChatPlusIcon className={styles.floatingIcon} />
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Modals - Solo mostrar PostForm si NO estamos en una página de comunidad */}
      {!isCommunityPage && (
        <PostForm
          isOpen={isPostFormOpen}
          onClose={() => setIsPostFormOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      <AdForm isOpen={isAdFormOpen} onClose={() => setIsAdFormOpen(false)} />
    </>
  );
};

export default FooterMobile;
