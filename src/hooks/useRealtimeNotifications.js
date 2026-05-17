import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import useSocketRoom from "./useSocketRoom";
import { useProfile } from "@/contexts/ProfileContext";

/**
 * Subscribes the current user to realtime notifications and invokes the handler on each new event.
 * The hook joins the user-specific notification channel and listens for 'new_notification'.
 *
 * @param {(notification: any) => void} onNotification - Callback invoked with the incoming notification payload
 * @param {boolean} [enabled=true] - Enables or disables the subscription
 */
const useRealtimeNotifications = (onNotification, enabled = true) => {
    const socket = useSocket();
    const { profile: user } = useProfile();

    useSocketRoom(
        socket,
        "notificationChannel",
        enabled && user ? { id: user.id } : null
    );

    useEffect(() => {
        if (!socket || !enabled) return;
        const handleNewNotification = (payload) => {
            if (typeof onNotification === "function") {
                onNotification(payload);
            }
        };

        socket.on("new_notification", handleNewNotification);
        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [socket, enabled, onNotification]);
};

export default useRealtimeNotifications;


