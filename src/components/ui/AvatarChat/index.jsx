import Image from "next/image";
import "./AvatarChat.scss";

/**
 * Renders a chat avatar with an optional connection status indicator.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.imgUrl=""] - The URL of the avatar image. If not provided, a default avatar is shown.
 * @param {boolean} [props.isConnected=false] - Indicates whether the user is connected. 
 *                                              A green indicator is shown if connected, 
 *                                              otherwise a red one.
 *
 * @example
 * // Example usage:
 * <AvatarChat imgUrl="/user.png" isConnected={true} />
 *
 * @returns {JSX.Element} The rendered avatar chat component.
 */
const AvatarChat = ({ imgUrl = "", isConnected = false }) => {
    return (
        <article className="avatar-chat">
            {
                !imgUrl ? <div className="default-avatar-chat" /> : <Image src={imgUrl} alt="Avatar chat" className="image-avatar-chat" width={36} height={36} loading="lazy" decoding="async" />
            }
            <span className={`connection-status-chat ${isConnected ? "status-conected" : "status-desconected"}`} />
        </article>
    );
}

export default AvatarChat;