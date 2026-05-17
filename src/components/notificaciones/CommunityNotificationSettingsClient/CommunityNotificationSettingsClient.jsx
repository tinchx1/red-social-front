"use client";
import { useState } from "react";
import { Toggle } from "@/components/ui";
import { updateCommunityNotificationPreferences } from "@/actions/notifications";
import { getMyProfile } from "@/actions";
import styles from "./CommunityNotificationSettingsClient.module.scss";

/**
 * @param {{ initialNotifications: Object, communityId: string }} props
 */
export default function CommunityNotificationSettingsClient({
  initialNotifications,
  communityId,
}) {
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
      await updateCommunityNotificationPreferences({
        userId,
        communityId,
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
      key: "newPublications",
      label: "Nuevas publicaciones",
    },
    {
      key: "newComments",
      label: "Nuevos comentarios",
    },
    {
      key: "newLikes",
      label: "Nuevos Me Gusta",
    },
    // {
    //   key: "newTag",
    //   label: "Nueva etiqueta",
    // },
    {
      key: "newSharedContent",
      label: "Nuevo contenido compartido",
    },
    {
      key: "newMember",
      label: "Nuevo miembro de la comunidad",
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
            disabled={
              saving ||
              setting.key === "newTag" ||
              setting.key === "newSharedContent"
            }
          />
        </div>
      ))}
    </div>
  );
}
