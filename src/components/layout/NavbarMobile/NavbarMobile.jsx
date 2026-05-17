"use client";
import styles from "./NavbarMobile.module.scss";
import Image from "next/image";
import LogoIcon from "@/public/images/apia-logo.png";
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import { ProfileModal, NotificationBell, BadgePlan } from "@/components";
import { useRouter, usePathname } from "next/navigation";
import InputMobile from "@/components/search/inputMobile/inputMobile";
import RecommendationSearch from "@/components/search/RecommendationSearch/RecommendationSearch";
import RecentSearches from "@/components/search/RecentSearches/RecentSearches";
import { usePlan, useSearch } from "@/contexts";
import { useEffect, useState } from "react";
const NavbarMobile = ({ isSuperAdmin }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenSearchMobile } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const { planKey, planName } = usePlan();
  // Register the mobile search opening function with the context
  useEffect(() => {
    setOpenSearchMobile(() => {
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
  }, [isSearchOpen, setOpenSearchMobile]);

  useEffect(() => {
    // Cerrar búsqueda cuando se navega a otra ruta
    setIsSearchOpen(false);
    setSearchInputValue("");
  }, [pathname]);

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
        <div>
          <div className={styles.leftSection}>
            <div
              className={styles.borderRight}
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
            {planKey !== "free" && (
              <div className={styles.mobile}>
                <BadgePlan label={planName} />
              </div>
            )}
            <div className={styles.searchContainer}>
              <InputMobile
                placeholder="Buscar empresa o comunidad"
                onSearch={handleSearchSubmit}
                onInputChange={handleSearchInputChange}
                onInputClick={handleSearchInputClick}
                onClose={() => setIsSearchOpen(false)}
                value={searchInputValue}
              />
            </div>
          </div>
        </div>
        <div className={styles.rightSection}>
          {planKey !== "free" && (
            <div className={styles.tablet}>
              <BadgePlan label={planName} />
            </div>
          )}
          <NotificationBell color="white" width={24} height={24} />
          <ProfileModal />
          <HamburgerMenu isSuperAdmin={isSuperAdmin} />
        </div>

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
      </nav>
    </>
  );
};

export default NavbarMobile;
