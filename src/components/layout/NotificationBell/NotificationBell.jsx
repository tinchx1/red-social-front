"use client";
import { useRouter } from "next/navigation";
import { useNotificationState } from "@/hooks/useNotificationState";
import NotificationIcon from "@/assets/notification.svg";
import NewNotificationIcon from "@/assets/new-notificacion.svg";
import styles from "./NotificationBell.module.scss";

/**
 * @param {{ color?: string; width?: string|number; height?: string|number; className?: string; disabled?: boolean }} props
 */
export default function NotificationBell({
  color = "white",
  width = 24,
  height = 24,
  className = "",
  disabled = false,
}) {
  const router = useRouter();
  const { hasNewNotification, notifIconKey, clearNotification } =
    useNotificationState();

  const handleClick = () => {
    if (disabled) return;
    clearNotification();
    router.push("/notificaciones");
  };

  const IconComponent = hasNewNotification
    ? NewNotificationIcon
    : NotificationIcon;
  const iconKey = hasNewNotification ? `notif-${notifIconKey}` : undefined;

  return (
    <button
      onClick={handleClick}
      className={`${styles.notificationButton} ${className} ${
        disabled ? styles.disabled : ""
      }`}
      disabled={disabled}
      aria-label="Notificaciones"
    >
      <IconComponent
        key={iconKey}
        className={`${styles.icon} ${hasNewNotification ? styles.wiggle : ""}`}
        color={color}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      />
    </button>
  );
}
