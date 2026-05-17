import { getMyProfile } from "@/actions";
import { VolverButton } from "@/components";
import { SettingsClient } from "@/components/settings";
import styles from "@/styles/pages/ConfiguracionCuenta.module.scss";

export default async function ConfiguracionPage() {
  let profile = null;
  try {
    profile = await getMyProfile();
  } catch (e) {
    // keep fallback
  }
  return (
    <div className={styles.container}>
      <div className={styles.leftSidebar + " " + styles.inConfig}>
        <VolverButton variant="light-blue" />
      </div>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>AJUSTES DE MI CUENTA</h1>
        <SettingsClient profile={profile} />
      </div>
    </div>
  );
}
