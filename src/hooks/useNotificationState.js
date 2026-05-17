"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import useRealtimeNotifications from "./useRealtimeNotifications";

/**
 * Hook to manage notification state with realtime updates
 * @returns {{ hasNewNotification: boolean, notifIconKey: number, clearNotification: () => void }}
 */
export function useNotificationState() {
  const pathname = usePathname();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [notifIconKey, setNotifIconKey] = useState(0);

  useRealtimeNotifications(() => {
    setHasNewNotification(true);
    setNotifIconKey((k) => k + 1); // remount icon to retrigger CSS animation
  }, true);

  useEffect(() => {
    if (pathname?.includes("/notificaciones")) {
      setHasNewNotification(false);
    }
  }, [pathname]);

  const clearNotification = () => {
    setHasNewNotification(false);
  };

  return {
    hasNewNotification,
    notifIconKey,
    clearNotification,
  };
}

