"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components";
import MessageIcon from "@/assets/message-icon.svg";

const NoChatRoomsSection = () => {
    const router = useRouter();

    const handleMiRedRedirect = () => {
        router.push("/red");
    }

    return (
        <section className="apia-chats-no-rooms-section">
            <h1>Mensajes</h1>

            <div className="no-rooms-chat-banner">
                <MessageIcon />
                <h2>Aún no tenés mensajes</h2>
                <p>
                    Creá tu red de contactos
                    <br />
                    para comenzar a entablar relaciones
                </p>
                <Button variant="primary" onClick={handleMiRedRedirect}>
                    Ampliar red
                </Button>
            </div>
        </section>
    );
}

export default NoChatRoomsSection;