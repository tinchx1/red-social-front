"use client";
import { useState } from "react";
import { Toggle } from "@/components/ui";
import { updateNotificationPreferences } from "@/actions/notifications";
import { getMyProfile } from "@/actions";
import styles from "./NotificationSettingsClient.module.scss";

/**
 * @param {{ initialNotifications: Object }} props
 */
export default function NotificationSettingsClient({ initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(newNotifications);

    // Save to API
    try {
      setSaving(true);
      const userId = (await getMyProfile()).id;
      await updateNotificationPreferences({
        userId,
        preferences: newNotifications,
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Revert on error
      setNotifications(notifications);
    } finally {
      setSaving(false);
    }
  };

  const notificationSettings = [
    {
      key: "newComment",
      label: "Nuevo comentario en tu publicación",
    },
    {
      key: "newMessages",
      label: "Nuevos mensajes",
    },
    {
      key: "newLike",
      label: "Nuevo Me gusta",
    },
    {
      key: "newSharedContent",
      label: "Nuevo contenido compartido",
    },
    // {
    //   key: "adPaymentStatus",
    //   label: "Estado del Pago de anuncios",
    // },
    // {
    //   key: "adPublication",
    //   label: "Publicación de anuncio",
    // },
    // {
    //   key: "newTagMention",
    //   label: "Nueva etiqueta/mención en comentario",
    // },
    {
      key: "newContactRequest",
      label: "Nueva solicitud de contacto",
    },
  ];

  return (
    <div className={styles.settingsList}>
      {notificationSettings.map((setting) => (
        <div key={setting.key} className={styles.settingItem}>
          <span className={styles.settingLabel}>{setting.label}</span>
          <Toggle
            checked={notifications[setting.key]}
            onChange={() => handleToggle(setting.key)}
            disabled={saving || setting.key === "adPaymentStatus" || setting.key === "adPublication" || setting.key === "newTagMention" }
          />
        </div>
      ))}
    </div>
  );
}
