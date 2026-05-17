import "./MessageChatBubble.scss";

import getFileUrlInfo from "@/utils/getFileUrlInfo";
import FileIcons from "../FileIcons";
import linkify from "@/utils/linkify";
import formatCustomDate from "@/utils/formatCustomDate";
import fileWeightFormat from "@/utils/fileWeightFormat";

import MessageReadIcon from "@/assets/message-read-icon.svg?react";
import MessageUnreadIcon from "@/assets/message-unread-icon.svg?react";
import FileDownloadIcon from "@/assets/file_download.svg?react";
import MessageReplyIcon from "@/assets/message-reply-icon.svg?react";

/**
 * Renders a chat message bubble component.
 *
 * This component displays a chat message with support for:
 * - Text content with automatic link detection.
 * - Optional reply preview.
 * - Optional file attachments (image preview or file icon with name and size).
 * - Read/unread status indicators.
 * - A reply button.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {string} [props.message=""] - The message content (HTML-safe).
 * @param {boolean} [props.isMine=false] - Whether the message was sent by the current user.
 * @param {boolean} [props.isRead=false] - Whether the message has been read by the recipient.
 * @param {string} [props.replyMsg=""] - The reply message preview (HTML-safe).
 * @param {string} [props.fileUrl=""] - The URL of the attached file, if any.
 * @param {number} [props.fileWeight=0] - The size of the attached file in megabytes (MB).
 * @param {Date} [props.sentAt=new Date()] - The timestamp when the message was sent.
 * @param {Function} [props.onClickReplyBtn=() => {}] - Callback triggered when the reply button is clicked.
 *
 * @returns {JSX.Element} The rendered chat bubble element.
 *
 * @example
 * <MessageChatBubble
 *   message="Hello! Check this out: https://example.com"
 *   isMine={true}
 *   isRead={true}
 *   replyMsg="Previous message preview"
 *   fileUrl="https://example.com/image.png"
 *   fileWeight={2.5}
 *   sentAt={new Date()}
 *   onClickReplyBtn={() => console.log("Reply clicked")}
 * />
 */
const MessageChatBubble = ({
  message = "",
  isMine = false,
  isRead = false,
  replyMsg = "",
  fileUrl = "",
  fileWeight = 0,
  sentAt = new Date(),
  onClickReplyBtn = () => {},
}) => {
  const fileUrlInfo = getFileUrlInfo(fileUrl);
  const imageExtensions = ["png", "jpg", "jpeg", "gif"];
  const isSingleLine = message.length < 10 && !replyMsg;
  return (
    <article
      className={`message-chat-bubble ${isMine ? "this-message-is-mine" : ""}`}
    >
      <div
        className={`message-chat-bubble-body ${
          isSingleLine ? "single-line" : "multi-line"
        }`}
      >
        {replyMsg && (
          <article className="message-reply">
            <MessageReplyIcon />
            <p
              className="message-chat-content reply-msg"
              dangerouslySetInnerHTML={{ __html: replyMsg }}
            />
          </article>
        )}

        {fileUrl && (
          <a
            href={fileUrl}
            className="message-file"
            target="_blank"
            rel="noopener noreferrer"
          >
            {imageExtensions.includes(fileUrlInfo.extension) ? (
              <img
                src={fileUrl}
                alt={fileUrlInfo.name}
                width={300}
                height={300}
                loading="lazy"
                decoding="async"
                quality={50}
              />
            ) : (
              <>
                <div className="message-file-icon-name">
                  <FileIcons fileExtension={fileUrlInfo.extension} />
                  <div className="file-name-weight">
                    <p>{fileUrlInfo.name}</p>
                    <h6>{fileWeightFormat(fileWeight)}</h6>
                  </div>
                </div>
                <FileDownloadIcon />
              </>
            )}
          </a>
        )}

        <p
          className="message-chat-content"
          dangerouslySetInnerHTML={{ __html: linkify(message) }}
        />
        <div className="message-chat-read-indicator-time">
          <h6>{formatCustomDate(sentAt, true)}</h6>
          <div className="message-chat-read-indicator">
            {isRead ? <MessageReadIcon /> : <MessageUnreadIcon />}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="message-chat-bubble-reply-btn"
        onClick={onClickReplyBtn}
      >
        <MessageReplyIcon />
      </button>
    </article>
  );
};

export default MessageChatBubble;
