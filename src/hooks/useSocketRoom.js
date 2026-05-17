import { useEffect } from "react";

/**
 * Custom React hook to join a socket.io room and handle automatic rejoining on reconnect,
 * with optional leave event on cleanup.
 *
 * @param {import("socket.io-client").Socket | null} socket - The socket.io client instance.
 * @param {string} eventName - The event name to emit for joining the room (e.g., "joinChat").
 * @param {object | null} payload - The data payload to send when joining the room.
 *                                 If null or undefined, the join event will not be emitted.
 * @param {string} [leaveEventName] - Optional event name to emit when leaving the room on cleanup (e.g., "leaveChat").
 *                                    If omitted, no leave event will be emitted.
 */
const useSocketRoom = (socket, eventName, payload, leaveEventName) => {
    useEffect(() => {
        if (!socket || !payload) return;

        socket.emit(eventName, payload);

        const handleReconnect = () => {
            socket.emit(eventName, payload);
        };

        socket.on("connect", handleReconnect);

        return () => {
            socket.off("connect", handleReconnect);
            if (leaveEventName) {
                socket.emit(leaveEventName, payload);
            }
        };
    }, [socket, eventName, leaveEventName, JSON.stringify(payload)]);
}

export default useSocketRoom;