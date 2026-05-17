"use client";
import Link from "next/link";
import style from "./RouteComunity.module.scss";
import UsersIcon from "@/assets/users.svg";
import SearchIcon from "@/assets/search.svg";
import UserPlus from "@/assets/userPlus.svg";
import SettingLineIcon from "@/assets/setting_line.svg";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui";
import { CreateCommunity } from "@/components/comunidades/connections/createCommunity/CreateCommunity";
import { useRouter } from "next/navigation";
import { canCreateCommunity, COMMUNITY_CREATION_LIMITS } from "@/constants";
import StarIcon from "@/assets/star.svg";

export const RouteComunity = memo(
  ({ data, userRole, isFreePlan, planKey = "free" }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [openCreate, setOpenCreate] = useState(false);
    const [expandedItems, setExpandedItems] = useState({});
    const router = useRouter();
    const communitiesCreated = data?.myCommunities?.administrating || 0;

    const toggleSubOptions = useCallback((index, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setExpandedItems((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    }, []);

    const handleMainItemClick = useCallback(
      (el, index, e) => {
        if (!el.subOptions) return;
        e.preventDefault();
        // Always expand/collapse submenu on click
        toggleSubOptions(index);
        // Navigate to default tab only if we're not already on the gestion route or tab is missing
        const defaultParam = el.subOptions?.[0]?.param;
        const currentTab = searchParams.get("tab");
        const isOnBase = pathname.startsWith(el.baseRoute || "");
        if (el.baseRoute && defaultParam && (!isOnBase || !currentTab)) {
          router.push(`${el.baseRoute}?tab=${defaultParam}`);
        }
      },
      [toggleSubOptions, searchParams, pathname, router]
    );

    const Routes = useMemo(() => {
      const baseRoutes = [
        {
          desktop: [
            {
              label: "Comunidades donde participo",
              route: "/comunidades/mis-comunidades",
              active: pathname.startsWith("/comunidades/mis-comunidades"),
              count: data?.myCommunities?.participating || 0,
            },
            {
              label: "Invitaciones",
              route: "/comunidades/invitaciones",
              active: pathname.startsWith("/comunidades/invitaciones"),
              count: data?.userPendingActions?.total || 0,
            },
            {
              label: "Buscar Comunidad",
              route: "/comunidades/buscar-comunidad",
              active: pathname === "/comunidades/buscar-comunidad",
            },
          ],
          mobile: [
            {
              label: "Comunidades",
              route: "/comunidades/mis-comunidades",
              active: pathname.startsWith("/comunidades/mis-comunidades"),
            },
            {
              label: "Invitaciones",
              route: "/comunidades/invitaciones",
              active: pathname.startsWith("/comunidades/invitaciones"),
            },
            {
              label: "Recomendadas",
              route: "/comunidades/buscar-comunidad",
              active: pathname === "/comunidades/buscar-comunidad",
            },
          ],
        },
      ];

      const routes = [...baseRoutes];

      // Agregar opción de Gestión para usuarios empresa/parque_industrial (anteúltimo)
      if (
        userRole === "empresa" ||
        userRole === "parque_industrial" ||
        (userRole === "persona" && !isFreePlan) ||
        communitiesCreated > 0
      ) {
        routes[0].desktop.splice(-1, 0, {
          label: "Mis comunidades",
          baseRoute: "/comunidades/gestion",
          subOptions: [
            {
              label: "Comunidades que gestiono",
              param: "comunidades",
              count: data?.myCommunities?.administrating || 0,
            },
            {
              label: "Invitaciones de gestión",
              param: "invitaciones",
              count: data?.adminPendingActions?.total || 0,
            },
          ],
          active: pathname.startsWith("/comunidades/gestion"),
        });

        // Agregar también en mobile (al final)
        routes[0].mobile.push({
          label: "Gestión",
          route: "/comunidades/gestion?tab=comunidades",
          active: pathname.startsWith("/comunidades/gestion"),
          isIcon: true,
        });
      }

      return routes;
    }, [pathname, userRole, data]);

    // Auto-expand "Gestión" when on its route so sub-options are visible
    useEffect(() => {
      const desktop = Routes[0]?.desktop || [];
      const gestionIndex = desktop.findIndex(
        (item) => item.baseRoute === "/comunidades/gestion"
      );
      if (gestionIndex !== -1 && pathname.startsWith("/comunidades/gestion")) {
        setExpandedItems((prev) => ({ ...prev, [gestionIndex]: true }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const buildUrl = useCallback((baseRoute, param) => {
      const params = new URLSearchParams();
      params.set("tab", param);
      return `${baseRoute}?${params.toString()}`;
    }, []);

    const isSubOptionActive = useCallback(
      (baseRoute, param) => {
        const currentTab = searchParams.get("tab");
        return pathname === baseRoute && currentTab === param;
      },
      [searchParams, pathname]
    );

    // Verificar si puede crear comunidad según plan y rol
    const normalizedPlanKey = planKey?.toLowerCase() || "free";
    const normalizedUserRole = userRole?.toLowerCase() || "persona";
    const canCreate = canCreateCommunity(
      normalizedPlanKey,
      normalizedUserRole,
      communitiesCreated
    );

    // Verificar si debe mostrar botón de upgrade
    // Se muestra cuando no puede crear Y (tiene comunidades creadas O es empresa/parque)
    const shouldShowUpgrade = !canCreate;
    // Obtener el límite actual del plan
    const currentLimit =
      COMMUNITY_CREATION_LIMITS[normalizedPlanKey]?.[normalizedUserRole] ?? 0;
    const limitText =
      currentLimit === null
        ? "Ilimitado"
        : currentLimit === 1
        ? "1 comunidad"
        : `${currentLimit} comunidades`;

    const shouldShowLimit = currentLimit > 0;
    return (
      <div className={style.container}>
        {/* Versión Desktop */}
        <div className={style.containerRoutes}>
          <div className={style.titulo}>
            <p>Comunidades</p>
            <UsersIcon
              className={style.icon}
              preserveAspectRatio="xMidYMid meet"
            />
          </div>

          <div className={style.routesContainer}>
            {Routes[0].desktop.map((el, index) => (
              <div key={index} className={style.menuItem}>
                {el.subOptions ? (
                  <div
                    className={`${style.menuHeader} ${
                      el.active ? style.active : ""
                    }`}
                    onClick={(e) => handleMainItemClick(el, index, e)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={style.routeContent}>
                      <span className={style.label}>{el.label}</span>
                      <span className={style.counter}>
                        <span className={style.count}>
                          {el.subOptions.reduce(
                            (total, sub) => total + (sub.count || 0),
                            0
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={el.route}
                    className={`${style.menuHeader} ${
                      el.active ? style.active : ""
                    }`}
                  >
                    <div className={style.routeContent}>
                      <span className={style.label}>{el.label}</span>
                      <span className={style.counter}>
                        {el.count !== undefined ? (
                          <span className={style.count}>{el.count}</span>
                        ) : (
                          <SearchIcon className={style.iconSearch} />
                        )}
                      </span>
                    </div>
                  </Link>
                )}

                {el.subOptions && expandedItems[index] && (
                  <div className={style.subOptions}>
                    {el.subOptions.map((subOption, subIndex) => (
                      <Link
                        href={buildUrl(el.baseRoute, subOption.param)}
                        key={subIndex}
                        className={`${style.subLink} ${
                          isSubOptionActive(el.baseRoute, subOption.param)
                            ? style.subActive
                            : ""
                        }`}
                      >
                        <span className={style.subLabel}>
                          {subOption.label}
                        </span>
                        {subOption.count !== undefined && (
                          <span className={style.subCount}>
                            {subOption.count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {canCreate && (
          <div className={style.create} onClick={() => setOpenCreate(true)}>
            <p>Crear comunidad</p>
            <UserPlus />
          </div>
        )}

        {shouldShowUpgrade && (
          <div className={style.upgradeContainerDesktop}>
            {shouldShowLimit && (
              <span className={style.upgradeLimitTextDesktop}>
                Límite {limitText}
              </span>
            )}
            <Link href="/planes" className={style.upgradeButton}>
              <div className={style.upgradeContent}>
                <p className={style.upgradeText}>
                  Sube de plan para crear más comunidades
                </p>
                <StarIcon className={style.upgradeIcon} />
              </div>
            </Link>
          </div>
        )}

        {/* Versión Mobile */}
        <div className={style.containerRoutesMobile}>
          <div className={style.tituloMobile}>
            <p>COMUNIDADES</p>
            {canCreate && (
              <Button
                onClick={() => setOpenCreate(true)}
                className={style.createMobileButton}
              >
                <UserPlus
                  className={style.iconMobile}
                  preserveAspectRatio="xMidYMid meet"
                />
              </Button>
            )}
            {shouldShowUpgrade && (
              <div className={style.upgradeContainerMobile}>
                <span className={style.upgradeLimitText}>
                  Límite: {limitText}
                </span>
                <Link href="/planes" className={style.upgradeButtonMobile}>
                  <span className={style.upgradeTextMobile}>Mejorar plan</span>
                </Link>
              </div>
            )}
          </div>

          <div className={style.routesContainerMobile}>
            {Routes[0].mobile.map((el, index) => (
              <Link
                href={el.route}
                key={index}
                className={`${style.linkMobile} ${
                  el.active ? style.activeMobile : ""
                }`}
              >
                <div className={style.routeMobile}>
                  {/* {el.isIcon ? (
                  <SettingLineIcon className={style.settingIcon} preserveAspectRatio="xMidYMid meet" />
                ) : ( */}
                  <span className={style.labelMobile}>{el.label}</span>
                  {/* )} */}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <CreateCommunity
          isOpen={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      </div>
    );
  }
);

RouteComunity.displayName = "RouteComunity";
