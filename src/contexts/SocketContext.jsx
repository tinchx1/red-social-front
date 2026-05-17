"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create context
const SocketContext = createContext();

// Context Provider
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_MICROSERVICE_CHAT_NOTIFICATION_SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            console.log("Connected to socket server", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from socket server");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

// Custom hook to get Socket.io instance
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context.socket;
}