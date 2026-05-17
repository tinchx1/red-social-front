import { getNotificationPreferences } from "@/actions/notifications";
import { NotificationSettingsClient } from "@/components/notificaciones";
import styles from "@/styles/pages/NotificacionesConfiguracion.module.scss";
import { getMyProfile } from "@/actions";
import { VolverButton, UserProfile } from "@/components";

export default async function NotificacionesConfiguracionPage() {
  let notifications = {
    newComment: true,
    newMessages: true,
    newLike: true,
    newSharedContent: true,
    adPaymentStatus: true,
    adPublication: true,
    newTagMention: true,
    newContactRequest: true,
  };
  let error = null;

  try {
    // TODO: Get userId from auth context or cookies
    const userId = (await getMyProfile()).id; // Replace with actual user ID
    notifications = await getNotificationPreferences({ userId });
  } catch (err) {
    error = "Error al cargar las preferencias";
    console.error("Error loading preferences:", err);
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.leftSidebar + " " + styles.inConfig}>
          <VolverButton variant="light-blue" />
          <div
            className={styles.hideTablet}
            style={{ width: "100%", height: "fit-content" }}
          >
            <UserProfile style={{ width: "100%", height: "fit-content" }} />
          </div>
        </div>
        <div className={styles.mainContent}>
          <h1 className={styles.title + " " + styles.mobileTitle}>
            Notificaciones
          </h1>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSidebar + " " + styles.inConfig}>
        <VolverButton variant="light-blue" />
        <div
          className={styles.hideTablet}
          style={{ width: "100%", height: "fit-content" }}
        >
          <UserProfile style={{ width: "100%", height: "fit-content" }} />
        </div>
      </div>
      <div className={styles.mainContent}>
        <h1 className={styles.title + " " + styles.mobileTitle}>
          Notificaciones
        </h1>
        <NotificationSettingsClient initialNotifications={notifications} />
      </div>
    </div>
  );
}
