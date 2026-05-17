import "@/styles/pages/mensajes.scss";

// Sections
// import NoChatRoomsSection from "./NoChatRoomsSection";
import ChatRoomsMessageSection from "./ChatRoomsMessageSection";

export const metadata = {
  title: "Mensajes - APIA",
  description: "Descripcion mensajes chat Apia",
};

export default function Mensajes() {
  
  return (
    <main className="apia-chats-messages">
      {/* <NoChatRoomsSection /> */}
      <ChatRoomsMessageSection />
    </main>
  );
}