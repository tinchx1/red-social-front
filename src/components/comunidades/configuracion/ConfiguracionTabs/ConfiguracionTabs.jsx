"use client";
import Link from "next/link";
import styles from "./ConfiguracionTabs.module.scss";
import SettingsIcon from "@/assets/setting_line.svg";
import { VolverButton } from "@/components/perfil";
import { useActiveTabKey } from "@/hooks";
import { getConfiguracionTabs, DEFAULT_CONFIGURACION_KEY } from "./constants";

/**
 * @param {{ communityId: string, communityName: string, communityLogo: string }} props
 */
export default function ConfiguracionTabs({
  communityId,
  communityName,
  communityLogo,
}) {
  const basePath = `/comunidades/${communityId}/administracion`;
  const tabs = getConfiguracionTabs(basePath);

  const activeKey = useActiveTabKey({
    basePath,
    tabs,
    defaultKey: DEFAULT_CONFIGURACION_KEY,
  });

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title + " " + styles.hideInDesktop}>
          {activeKey === "configuracion" ? "CONFIGURACIÓN" : activeKey}
        </h1>
        <Link
          href={`${basePath}/configuracion`}
          className={`${styles.mobileTab + " " + styles.hideInDesktop} ${
            styles.mobileTabActive
          }`}
        >
          <SettingsIcon className={styles.settingsIcon} />
        </Link>
      </div>
      <div className={styles.tabsContainer}>
        <div className={styles.titleContainerCommunity}>
          <VolverButton variant="light-blue" />
          <img
            src={communityLogo || "/images/profile.svg"}
            alt={communityName}
            className={styles.communityLogo}
          />
          <h1 className={styles.titleCommunityName}>{communityName}</h1>
        </div>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`${styles.mobileTab} ${
                activeKey === tab.key ? styles.mobileTabActive : ""
              } ${tab.key === "configuracion" ? styles.hideInMobile : ""}`}
            >
              {tab.label === "Configuración" ? <SettingsIcon /> : null}
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
