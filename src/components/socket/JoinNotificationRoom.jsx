"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { useSocket } from "@/contexts/SocketContext";
import { useSocketRoom } from "@/hooks";

const JoinNotificationRoom = () => {
  const { profile: user } = useProfile();
  const socket = useSocket();

  useSocketRoom(
    socket,
    "notificationChannel",
    user
      ? {
          id: user.id,
        }
      : null
  );
};

export default JoinNotificationRoom;
