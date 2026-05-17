"use client"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./FloatChat.scss";

import FloatChatContent from "./FloatChatContent";

const FloatChat = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [isOnMensajePage, setIsOnMensajePage] = useState(false);
    const pathname = usePathname();

    // Dectecta el ancho de página para saber si es desktop o no
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 1200);
        }

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dectecta si esta en la página Mensajes o no
    useEffect(() => {
        if (pathname === "/mensajes") {
            setIsOnMensajePage(true);
        } else {
            setIsOnMensajePage(false);
        }
    }, [pathname]);

    if (!isDesktop || isOnMensajePage) return null;

    return <FloatChatContent />;
}

export default FloatChat;