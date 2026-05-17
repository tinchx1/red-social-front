"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import AvatarChat from "@/components/ui/AvatarChat";
import MessageChatBubble from "@/components/ui/MessageChatBubble";
import FileIcons from "@/components/ui/FileIcons";
import { BlockedSection, Button } from "@/components/ui";
import { getBase64 } from "@/utils";
import getFileUrlInfo from "@/utils/getFileUrlInfo";
import formatCustomDate from "@/utils/formatCustomDate";
import fileWeightFormat from "@/utils/fileWeightFormat";

import MessageIcon from "@/assets/message-icon.svg";
import MessageSimpleIcon from "@/assets/message-simple.svg";
import AttachFileIcon from "@/assets/attach-file-icon.svg";
import CrossIcon from "@/assets/close-chat-icon.svg";
import FileDownloadIcon from "@/assets/file_download.svg";
import ChatBackIcon from "@/assets/chat-back-icon.svg";
import FileChatIcon from "@/assets/file-chat-icon.svg";

import { useAuth } from "@/components/layout/AuthProvider";
import {
  getChatRooms,
  getChatFiles,
  getChatMessages,
  sendMessage,
  updateMessageStatus,
  getChatRoomById,
  getLatestChatMessageSent,
} from "@/actions/chat";
import { useSocket } from "@/contexts/SocketContext";
import { useSocketRoom } from "@/hooks";
import { usePlan, useToast } from "@/contexts";
import { useProfile } from "@/contexts/ProfileContext";

// Componente memoizado para cada chat room individual
const ChatRoomItem = React.memo(
  ({
    chat,
    chatSelected,
    onlineUsersId,
    handleSelectChat,
    formatCustomDate,
  }) => {
    const isSelected = chatSelected?.id === chat.id;

    return (
      <button
        type="button"
        key={chat.id}
        className={`chat-room-button ${isSelected ? "chat-room-open" : ""}`}
        onClick={() => handleSelectChat(chat)}
      >
        <div className="room-avatar-username">
          <AvatarChat
            imgUrl={chat.withUser?.avatarUrl}
            isConnected={onlineUsersId.includes(chat.withUser.id) ?? false}
          />
          <div className="username-last-message">
            <h4>{chat.withUser.name}</h4>
            {(() => {
              const raw = chat.messages[0]?.message;
              const isString = typeof raw === "string";
              const normalized = isString
                ? raw.replace(/^\uFEFF/, "").trimStart()
                : "";
              if (isString && /^<p>\s*<strong>/i.test(normalized)) {
                const plain = normalized
                  .replace(/<[^>]*>/g, " ") // remove all HTML tags
                  .replace(/&nbsp;/g, " ") // decode common nbsp
                  .replace(/\s+/g, " ") // collapse whitespace
                  .trim();
                return <p>{plain}</p>;
              }
              return (
                <p>
                  {isString && raw !== ""
                    ? raw
                    : chat.messages[0]?.file
                    ? "Archivo"
                    : null}
                </p>
              );
            })()}
          </div>
        </div>
        <div className="room-last-time-unread-message">
          <p>
            {chat.messages?.length > 0
              ? formatCustomDate(chat.messages[0]?.created_at)
              : null}
          </p>
          {chat.unreadMessages > 0 && (
            <span className="room-total-unread-message">
              {chat.unreadMessages}
            </span>
          )}
        </div>
      </button>
    );
  }
);

// Componente memoizado para la sección de mensajes
const ChatMessagesSection = React.memo(
  ({
    chatSelected,
    isFreePlan,
    roleGroupsOption,
    chatMessages,
    messageBubbleRef,
    messageBubbleBottomRef,
    onlineUsersId,
    file,
    messageToReplySelected,
    isTextareaOnFocus,
    messageInput,
    isSubmittingMessage,
    onSubmitSendMessage,
    handleRemoveFileAttached,
    setIsTextareaOnFocus,
    setMessageInput,
    normalizeHtmlPreview,
    getFileUrlInfo,
    messageTextareaRef,
    handleOpenFileSelector,
    handleFileChange,
    formatCustomDate,
    setChatSelected,
    setMessageToReplySelected,
    setOpenChatFiles,
    fileInputRef,
    user,
  }) => {
    return (
      <article
        className={`apia-chat-room-messages ${chatSelected ? "show-chat" : ""}`}
      >
        {chatSelected ? (
          <>
            {isFreePlan && roleGroupsOption !== "super_admin" ? (
              <>
                <div
                  style={{
                    opacity: 0.6,
                    filter: "blur(0.8px)",
                  }}
                >
                  <div className="room-messages-bubble">
                    <div className="messages-bubble-header">
                      <div className="bubble-header-user">
                        <button
                          type="button"
                          className="header-back-chat-btn"
                          onClick={() => setChatSelected(null)}
                        >
                          <ChatBackIcon />
                        </button>
                        <Link
                          href={`/perfil/${chatSelected.withUser?.id}`}
                          className="header-user-profile"
                        >
                          <AvatarChat
                            imgUrl={chatSelected.withUser?.avatarUrl}
                            isConnected={
                              onlineUsersId.includes(
                                chatSelected?.withUser?.id || 1
                              ) ?? false
                            }
                          />
                          <h3>{chatSelected.withUser.name}</h3>
                        </Link>
                      </div>

                      <button
                        type="button"
                        className="header-file-chat-btn"
                        onClick={() => setOpenChatFiles(true)}
                      >
                        <FileChatIcon />
                      </button>
                    </div>

                    <div
                      ref={messageBubbleRef}
                      className="messages-bubble-body"
                    >
                      {chatMessages?.map((msg) => {
                        const replyMessageRaw = msg.replyTo?.message;
                        const replyMessage =
                          typeof replyMessageRaw === "string" &&
                          replyMessageRaw !== ""
                            ? normalizeHtmlPreview(replyMessageRaw)
                            : getFileUrlInfo(msg.replyTo?.file?.url)
                                .fullFileName;

                        return (
                          <MessageChatBubble
                            key={msg.id}
                            message={msg?.message}
                            isMine={user?.id === msg.author_id}
                            isRead={msg.is_read}
                            replyMsg={replyMessage}
                            fileUrl={msg.file?.url}
                            fileWeight={msg.file?.weight_mb}
                            sentAt={msg.created_at}
                            onClickReplyBtn={() =>
                              setMessageToReplySelected(msg)
                            }
                          />
                        );
                      })}
                      <div ref={messageBubbleBottomRef} />
                    </div>
                  </div>

                  <form
                    className="room-message-send-form"
                    onSubmit={onSubmitSendMessage}
                    method="post"
                    autoComplete="off"
                  >
                    {file && (
                      <article className="file-attached-to-upload">
                        <p>{file.name}</p>
                        <button
                          type="button"
                          className="file-attached-remove-btn"
                          onClick={handleRemoveFileAttached}
                        >
                          <CrossIcon />
                        </button>
                      </article>
                    )}

                    {messageToReplySelected && (
                      <article className="message-to-reply">
                        <p>
                          {typeof messageToReplySelected.message === "string" &&
                          messageToReplySelected.message !== ""
                            ? normalizeHtmlPreview(
                                messageToReplySelected.message
                              )
                            : getFileUrlInfo(messageToReplySelected.file.url)
                                .fullFileName}
                        </p>
                        <button
                          type="button"
                          className="message-reply-remove-btn"
                          onClick={() => setMessageToReplySelected(null)}
                        >
                          <CrossIcon />
                        </button>
                      </article>
                    )}

                    <div className="message-send-input-submit">
                      <div
                        className={`input-attach-file ${
                          isTextareaOnFocus ? "input-focus" : ""
                        }`}
                      >
                        <textarea
                          ref={messageTextareaRef}
                          name="message"
                          id="message"
                          placeholder="Escribí algo aquí..."
                          required={!file}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.shiftKey &&
                              !isSubmittingMessage
                            ) {
                              e.preventDefault();
                              const form = e.currentTarget.closest(
                                ".room-message-send-form"
                              );
                              if (form && e.target.value.trim() !== "") {
                                form.dispatchEvent(
                                  new Event("submit", {
                                    cancelable: true,
                                    bubbles: true,
                                  })
                                );
                              }
                            }
                          }}
                          onFocus={() => setIsTextareaOnFocus(true)}
                          onBlur={() => setIsTextareaOnFocus(false)}
                          value={messageInput}
                          onInput={(e) => {
                            const el = e.currentTarget;

                            // Check if on mobile
                            const isMobile = window.innerWidth <= 1366;
                            if (isMobile) return;

                            const MAX = 152;
                            // Only reset to auto while below max height; keep fixed at MAX to avoid jump-to-top
                            if (el.scrollHeight <= MAX) {
                              el.style.height = "auto";
                              const next = Math.min(
                                MAX,
                                Math.max(50, el.scrollHeight)
                              );
                              el.style.height = next + "px";
                            } else {
                              el.style.height = MAX + "px";
                            }
                            el.style.overflowY =
                              el.scrollHeight > MAX ? "auto" : "hidden";
                            if (el.scrollHeight > MAX) {
                              el.scrollTop = el.scrollHeight;
                            }
                          }}
                          onChange={(e) => setMessageInput(e.target.value)}
                        ></textarea>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          accept="
                                                .doc,.docx,.odt,
                                                .xls,.xlsx,.csv,.ods,
                                                .pdf,
                                                .png,.jpg,.jpeg,.gif
                                            "
                        />

                        <button
                          type="button"
                          className="attach-file-btn"
                          onClick={handleOpenFileSelector}
                          disabled={file}
                        >
                          <AttachFileIcon />
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="message-send-input-submit-btn"
                        disabled={
                          isSubmittingMessage ||
                          (messageInput.trim() === "" && !file)
                        }
                      >
                        {(messageInput.trim() !== "" || file) && (
                          <>
                            <div className="loader"></div>
                            <span>Enviar</span>
                          </>
                        )}
                        {messageInput.trim() === "" && !file && "Enviar"}
                      </button>
                    </div>
                  </form>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                    pointerEvents: "auto",
                    backgroundColor: "transparent",
                  }}
                >
                  <BlockedSection
                    desc="Para comunicarte con otras personas, necesitás cambiar de plan"
                    icon={<MessageSimpleIcon />}
                    wide={true}
                    messages={true}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="room-messages-bubble">
                  <div className="messages-bubble-header">
                    <div className="bubble-header-user">
                      <button
                        type="button"
                        className="header-back-chat-btn"
                        onClick={() => setChatSelected(null)}
                      >
                        <ChatBackIcon />
                      </button>
                      <Link
                        href={`/perfil/${chatSelected.withUser?.id}`}
                        className="header-user-profile"
                      >
                        <AvatarChat
                          imgUrl={chatSelected.withUser?.avatarUrl}
                          isConnected={
                            onlineUsersId.includes(
                              chatSelected?.withUser?.id || 1
                            ) ?? false
                          }
                        />
                        <h3>{chatSelected.withUser.name}</h3>
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="header-file-chat-btn"
                      onClick={() => setOpenChatFiles(true)}
                    >
                      <FileChatIcon />
                    </button>
                  </div>

                  <div ref={messageBubbleRef} className="messages-bubble-body">
                    {chatMessages?.map((msg) => {
                      const replyMessageRaw = msg.replyTo?.message;
                      const replyMessage =
                        typeof replyMessageRaw === "string" &&
                        replyMessageRaw !== ""
                          ? normalizeHtmlPreview(replyMessageRaw)
                          : getFileUrlInfo(msg.replyTo?.file?.url).fullFileName;

                      return (
                        <MessageChatBubble
                          key={msg.id}
                          message={msg?.message}
                          isMine={user?.id === msg.author_id}
                          isRead={msg.is_read}
                          replyMsg={replyMessage}
                          fileUrl={msg.file?.url}
                          fileWeight={msg.file?.weight_mb}
                          sentAt={msg.created_at}
                          onClickReplyBtn={() => setMessageToReplySelected(msg)}
                        />
                      );
                    })}
                    <div ref={messageBubbleBottomRef} />
                  </div>
                </div>

                <form
                  className="room-message-send-form"
                  onSubmit={onSubmitSendMessage}
                  method="post"
                  autoComplete="off"
                >
                  {file && (
                    <article className="file-attached-to-upload">
                      <p>{file.name}</p>
                      <button
                        type="button"
                        className="file-attached-remove-btn"
                        onClick={handleRemoveFileAttached}
                      >
                        <CrossIcon />
                      </button>
                    </article>
                  )}

                  {messageToReplySelected && (
                    <article className="message-to-reply">
                      <p>
                        {typeof messageToReplySelected.message === "string" &&
                        messageToReplySelected.message !== ""
                          ? normalizeHtmlPreview(messageToReplySelected.message)
                          : getFileUrlInfo(messageToReplySelected.file.url)
                              .fullFileName}
                      </p>
                      <button
                        type="button"
                        className="message-reply-remove-btn"
                        onClick={() => setMessageToReplySelected(null)}
                      >
                        <CrossIcon />
                      </button>
                    </article>
                  )}

                  <div className="message-send-input-submit">
                    <div
                      className={`input-attach-file ${
                        isTextareaOnFocus ? "input-focus" : ""
                      }`}
                    >
                      <textarea
                        ref={messageTextareaRef}
                        name="message"
                        id="message"
                        placeholder="Escribí algo aquí..."
                        required={!file}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            !isSubmittingMessage
                          ) {
                            e.preventDefault();
                            const form = e.currentTarget.closest(
                              ".room-message-send-form"
                            );
                            if (form && e.target.value.trim() !== "") {
                              form.dispatchEvent(
                                new Event("submit", {
                                  cancelable: true,
                                  bubbles: true,
                                })
                              );
                            }
                          }
                        }}
                        onFocus={() => setIsTextareaOnFocus(true)}
                        onBlur={() => setIsTextareaOnFocus(false)}
                        value={messageInput}
                        onInput={(e) => {
                          const el = e.currentTarget;

                          // Check if on mobile
                          const isMobile = window.innerWidth <= 1366;
                          if (isMobile) return;

                          const MAX = 152;
                          // Only reset to auto while below max height; keep fixed at MAX to avoid jump-to-top
                          if (el.scrollHeight <= MAX) {
                            el.style.height = "auto";
                            const next = Math.min(
                              MAX,
                              Math.max(50, el.scrollHeight)
                            );
                            el.style.height = next + "px";
                          } else {
                            el.style.height = MAX + "px";
                          }
                          el.style.overflowY =
                            el.scrollHeight > MAX ? "auto" : "hidden";
                          if (el.scrollHeight > MAX) {
                            el.scrollTop = el.scrollHeight;
                          }
                        }}
                        onChange={(e) => setMessageInput(e.target.value)}
                      ></textarea>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="
                                                .doc,.docx,.odt,
                                                .xls,.xlsx,.csv,.ods,
                                                .pdf,
                                                .png,.jpg,.jpeg,.gif
                                            "
                      />

                      <button
                        type="button"
                        className="attach-file-btn"
                        onClick={handleOpenFileSelector}
                        disabled={file}
                      >
                        <AttachFileIcon />
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="message-send-input-submit-btn"
                      disabled={
                        isSubmittingMessage ||
                        (messageInput.trim() === "" && !file)
                      }
                    >
                      {(messageInput.trim() !== "" || file) && (
                        <>
                          <div className="loader"></div>
                          <span>Enviar</span>
                        </>
                      )}
                      {messageInput.trim() === "" && !file && "Enviar"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="no-chat-room-selected">
            <MessageIcon />
            <h2>Chat no seleccionado</h2>
          </div>
        )}
      </article>
    );
  }
);

const ChatRoomsMessageSection = () => {
  const { profile: user } = useProfile();
  const { planKey } = usePlan();
  const socket = useSocket();
  const { showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFreePlan = planKey === "free";
  const [onlineUsersId, setOnlineUsersId] = useState([]);

  const [checkTheLatestChatMessageSent, setCheckTheLatestChatMessageSent] =
    useState(false);
  const [chatIdToSelect, setChatIdToSelect] = useState();

  const [wasFirstLoading, setWasFirstLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState({}); // Cambiar a objeto por rol
  const [chatTotalRooms, setChatTotalRooms] = useState({}); // Cambiar a objeto por rol
  const [roleGroupsOption, setRoleGroupsOption] = useState("super_admin");
  const [currentPageRooms, setCurrentPageRooms] = useState(1);
  const [shouldLoadLatestChat, setShouldLoadLatestChat] = useState(true);
  const pageSizeRooms = 15;
  const roomListRef = useRef();

  const [chatSelected, setChatSelected] = useState(null);

  const [chatFiles, setChatFiles] = useState([]);
  const [totalChatFiles, setTotalChatFiles] = useState(0);
  const [currentPageFiles, setCurrentPageFiles] = useState(1);
  const pageSizeFiles = 10;
  const filesListRef = useRef();

  const [chatMessages, setChatMessages] = useState([]);
  const [chatTotalMessages, setChatTotalMessages] = useState(0);
  const [currentPageMessages, setCurrentPageMessages] = useState(1);
  const pageSizeMessages = 15;
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [messageToReplySelected, setMessageToReplySelected] = useState(null);

  const messageBubbleRef = useRef();
  const messageBubbleBottomRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const chatStateRef = useRef({ messages: [], total: 0 });
  const prevMsgBuubleScrollHeightRef = useRef(0);
  const isLoadingMoreMessagesRef = useRef(false);
  const hasHandledQueryRef = useRef(false);
  const isMountedRef = useRef(true);

  const [messageInput, setMessageInput] = useState("");
  const [isTextareaOnFocus, setIsTextareaOnFocus] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const messageTextareaRef = useRef(null);

  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const [openChatFiles, setOpenChatFiles] = useState(false);

  const roleGroups = ["super_admin", "parque_industrial", "empresa", "persona"];
  const [searchingForUser, setSearchingForUser] = useState(false);

  // Track component mount state to prevent navigation after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const searchUserInAllGroups = async (userId) => {
    if (searchingForUser) return;

    setSearchingForUser(true);

    for (const role of roleGroups) {
      try {
        const res = await getChatRooms(1, pageSizeRooms, user.id, role);
        const { rows } = res;

        const targetChat = rows.find((chat) => chat.withUser.id === userId);
        if (targetChat) {
          setRoleGroupsOption(role);
          setChatSelected(targetChat);
          setSearchingForUser(false);
          return;
        }
      } catch (error) {
        console.error(`Error searching in role ${role}:`, error);
      }
    }

    setSearchingForUser(false);
  };

  const getRooms = async () => {
    try {
      const res = await getChatRooms(
        currentPageRooms,
        pageSizeRooms,
        user.id,
        roleGroupsOption
      );
      const { count, rows, totalUnreadMessages } = res;
      setChatRooms((prev) => {
        let updatedRooms;

        if (currentPageRooms === 1) {
          updatedRooms = rows;
        } else {
          updatedRooms = [...(prev[roleGroupsOption] || []), ...rows];
        }

        return {
          ...prev,
          [roleGroupsOption]: updatedRooms,
        };
      });

      setChatTotalRooms((prev) => ({
        ...prev,
        [roleGroupsOption]: count,
      }));
      setTotalUnreadMessages(totalUnreadMessages);

      if (chatIdToSelect) {
        // First try to find in current page results
        let chat = rows.find((chat) => chat.id === chatIdToSelect);

        // If not found in current results, search in all loaded rooms
        if (!chat) {
          for (const role in chatRooms) {
            const roleRooms = chatRooms[role] || [];
            chat = roleRooms.find((room) => room.id === chatIdToSelect);
            if (chat) break;
          }
        }

        setChatSelected(chat);
        setChatIdToSelect(null);
        if (chat && isMountedRef.current && window.innerWidth > 1366) {
          try {
            const params = new URLSearchParams(
              Array.from(searchParams.entries())
            );
            params.set("userId", String(chat.withUser.id));
            router.replace(`${pathname}?${params.toString()}`);
          } catch {}
        }
      }

      if (!wasFirstLoading) {
        setWasFirstLoading(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getLatestChat = async () => {
    try {
      const res = await getLatestChatMessageSent(user.id);
      const { chatId, role } = res;

      setChatIdToSelect(chatId);

      if (role !== roleGroupsOption) {
        setRoleGroupsOption(role);
      }

      if (!checkTheLatestChatMessageSent) {
        setCheckTheLatestChatMessageSent(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Obtener los chat rooms del usuario
  useEffect(() => {
    if (user) {
      const userIdParam = searchParams.get("userId");

      // Si el usuario es free, ir directo al tab admin sin abrir ningún chat
      if (isFreePlan && shouldLoadLatestChat) {
        setShouldLoadLatestChat(false);
        setCheckTheLatestChatMessageSent(true);
        setRoleGroupsOption("super_admin");
        return;
      }

      if (checkTheLatestChatMessageSent || userIdParam) {
        getRooms();
      } else {
        getLatestChat();
      }
    }
  }, [
    user,
    currentPageRooms,
    checkTheLatestChatMessageSent,
    isFreePlan,
    shouldLoadLatestChat,
    roleGroupsOption,
  ]);

  // Abrir chat automáticamente si hay userId en query params
  const pathname = usePathname();
  useEffect(() => {
    const userId = searchParams.get("userId");

    if (!userId) return;
    if (hasHandledQueryRef.current) return;
    if (searchingForUser || !wasFirstLoading) return;

    // Si hay un chat ya seleccionado, no hacer nada (evita interferir con el back button)
    if (chatSelected !== null) return;

    hasHandledQueryRef.current = true;
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(window.history.state, "", pathname);
      } catch {}
    }

    // Si el usuario es free, no abrir ningún chat y forzar al tab admin
    if (isFreePlan) {
      setRoleGroupsOption("super_admin");
      return;
    }

    // Primero buscar en la lista actual
    const currentRooms = chatRooms[roleGroupsOption] || [];
    const targetChat = currentRooms.find((chat) => chat.withUser.id === userId);

    if (targetChat) {
      setChatSelected(targetChat);
      // Reflejar chat activo en la URL
    } else {
      // Si no se encuentra, buscar en todos los grupos de roles
      searchUserInAllGroups(userId);
    }
  }, [
    chatRooms,
    searchParams,
    searchingForUser,
    wasFirstLoading,
    pathname,
    isFreePlan,
    roleGroupsOption,
  ]);

  const resetChatRoomsPagination = () => {
    if (currentPageRooms === 1) {
      getRooms();
    } else {
      setCurrentPageRooms(1);
    }
  };

  // Obtener chat rooms dependiendo el rol seleccionado
  useEffect(() => {
    if (user && (wasFirstLoading || checkTheLatestChatMessageSent)) {
      resetChatRoomsPagination();
    }
  }, [roleGroupsOption, user, wasFirstLoading, checkTheLatestChatMessageSent]);

  // Scroll infinity del paginado de los chat rooms
  useEffect(() => {
    const container = roomListRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;

      const currentRooms = chatRooms[roleGroupsOption] || [];
      const currentTotal = chatTotalRooms[roleGroupsOption] || 0;

      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        currentRooms.length < currentTotal
      ) {
        setCurrentPageRooms((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [roleGroupsOption, chatRooms, chatTotalRooms]);

  // Handler para actualizar rooms desde socket
  const handleUpdateRooms = useCallback(
    async ({ roomId }) => {
      if (!roomId) return;

      try {
        const res = await getChatRoomById(roomId, user.id);

        setChatRooms((prev) => {
          if (!res.chat) return prev;

          if (res.chat.withUser?.role !== roleGroupsOption) {
            return prev;
          }

          const currentRooms = prev[roleGroupsOption] || [];
          const filtered = currentRooms.filter(
            (room) => room.id !== res.chat.id
          );

          return {
            ...prev,
            [roleGroupsOption]: [res.chat, ...filtered],
          };
        });

        if (typeof res.totalUnreadMessages === "number") {
          setTotalUnreadMessages(res.totalUnreadMessages);
        }
      } catch (error) {
        resetChatRoomsPagination();
      }
    },
    [roleGroupsOption, user]
  );

  // Socket para obtener los usuarios conectados y actualizar en tiempo real el orden de los chat rooms
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("getOnlineUsers");

    const handleUserOnlineStatus = ({ userId, isOnline }) => {
      setOnlineUsersId((prev) =>
        isOnline
          ? [...new Set([...prev, userId])]
          : prev.filter((id) => id !== userId)
      );
    };

    const handleOnlineUsersList = (users) => {
      setOnlineUsersId(users);
    };

    socket.on("userOnlineStatus", handleUserOnlineStatus);
    socket.on("onlineUsersList", handleOnlineUsersList);
    socket.on("updateUserRooms", handleUpdateRooms);

    return () => {
      socket.off("userOnlineStatus", handleUserOnlineStatus);
      socket.off("onlineUsersList", handleOnlineUsersList);
      socket.off("updateUserRooms", handleUpdateRooms);
    };
  }, [socket, user, currentPageRooms, roleGroupsOption, handleUpdateRooms]);

  const handleChangeRoleGroupOption = useCallback((role) => {
    setRoleGroupsOption(role);
  }, []);

  const handleSelectChat = useCallback(
    (chat) => {
      // Si el usuario es free y no es el chat de admin, no permitir abrir
      if (isFreePlan && roleGroupsOption !== "super_admin") {
        return;
      }

      setChatSelected(chat);

      setChatRooms((prev) => ({
        ...prev,
        [roleGroupsOption]: (prev[roleGroupsOption] || []).map((room) =>
          room.id === chat.id ? { ...room, unreadMessages: 0 } : room
        ),
      }));

      setTotalUnreadMessages((prev) => Math.max(0, prev - chat.unreadMessages));
    },
    [roleGroupsOption, isFreePlan]
  );

  const handleSetChatSelected = useCallback((chat) => {
    setChatSelected(chat);
  }, []);

  const handleSetMessageToReplySelected = useCallback((msg) => {
    setMessageToReplySelected(msg);
  }, []);

  useSocketRoom(
    socket,
    "joinChat",
    chatSelected ? chatSelected.id : null,
    "leaveChat"
  );

  const getFiles = async () => {
    try {
      const res = await getChatFiles(
        currentPageFiles,
        pageSizeFiles,
        chatSelected.id
      );

      const { count, rows } = res;

      setChatFiles(rows);
      setTotalChatFiles(count);
    } catch (error) {
      console.error(error);
    }
  };

  const resetChatFilesPagination = () => {
    if (currentPageFiles === 1) {
      getFiles();
    } else {
      setCurrentPageFiles(1);
    }
  };

  // Scroll infinity del paginado del historial de archivos del chat selecionado
  useEffect(() => {
    const container = filesListRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;

      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        chatFiles.length < totalChatFiles
      ) {
        setCurrentPageFiles((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatSelected, currentPageFiles, totalChatFiles]);

  const getMessages = async () => {
    try {
      const res = await getChatMessages(
        currentPageMessages,
        pageSizeMessages,
        chatSelected.id
      );

      const { count, rows } = res;

      setChatMessages((prev) => {
        let updatedMessages;

        if (currentPageMessages === 1) {
          updatedMessages = rows;
        } else {
          const allMessages = [...rows, ...prev];
          const uniqueMessages = Array.from(
            new Map(allMessages.map((msg) => [msg.id, msg])).values()
          );
          updatedMessages = uniqueMessages;
        }

        return updatedMessages;
      });

      setChatTotalMessages(count);

      const filterNotMinesAndRead = rows.filter(
        (msg) => msg.author_id !== user.id && !msg.is_read
      );
      if (filterNotMinesAndRead.length > 0) {
        await updateMessageStatus(
          chatSelected.id,
          filterNotMinesAndRead[0].author_id
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetChatMessagesPagination = () => {
    setCurrentPageMessages(1);
    getMessages();
  };

  // Load messages when chat is selected
  useEffect(() => {
    if (chatSelected) {
      getMessages();
    }
  }, [chatSelected]);

  // Actualizar los mensajes y el count de mensajes para el páginado con socket
  useEffect(() => {
    chatStateRef.current = { messages: chatMessages, total: chatTotalMessages };
  }, [chatMessages, chatTotalMessages]);

  const messageScrollPagination = () => {
    const { messages, total } = chatStateRef.current;

    if (messages.length < total) {
      setCurrentPageMessages((prev) => prev + 1);
    }
  };

  const handleMessagesScroll = () => {
    const container = messageBubbleRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && !isLoadingMoreMessagesRef.current) {
      prevMsgBuubleScrollHeightRef.current = container.scrollHeight;
      isLoadingMoreMessagesRef.current = true;
      messageScrollPagination();
    }
  };

  // Resetar los chatFiles, el chatMessage y el scroll del container de los mensajes al abrir un nuevo chat
  // Paginado de los mensajes
  useEffect(() => {
    if (chatSelected) {
      resetChatFilesPagination();
      resetChatMessagesPagination();
      setMessageInput("");
      setFile(null);
      setMessageToReplySelected(null);
    }

    const containerMsg = messageBubbleRef.current;
    if (!containerMsg) return;

    containerMsg.addEventListener("scroll", handleMessagesScroll);
    return () =>
      containerMsg.removeEventListener("scroll", handleMessagesScroll);
  }, [chatSelected]);

  // Obtener mensajes antiguos (paginación infinita)
  useEffect(() => {
    if (chatSelected && currentPageMessages > 1) {
      getMessages();
    }
  }, [currentPageMessages]);

  // Se usa cuando se abra un chat nuevo
  useEffect(() => {
    const containerMsg = messageBubbleRef.current;
    if (!containerMsg) return;

    if (chatMessages.length > 0 && currentPageMessages === 1) {
      containerMsg.scrollTop = containerMsg.scrollHeight;
    }
  }, [chatMessages, currentPageMessages]);

  // Restaura el scroll despues del paginado de los mensajes
  useEffect(() => {
    const containerMsg = messageBubbleRef.current;
    if (!containerMsg) return;

    if (isLoadingMoreMessagesRef.current) {
      const newScrollHeight = containerMsg.scrollHeight;
      containerMsg.scrollTop =
        newScrollHeight - prevMsgBuubleScrollHeightRef.current;
      isLoadingMoreMessagesRef.current = false;
    }
  }, [chatMessages]);

  // Si el ultimo mensaje enviado es del usuario que lo envio, a este se lo scrolea para abajo
  useEffect(() => {
    if (!chatSelected) return;
    if (chatMessages.length === 0) return;

    const lastMsg = chatMessages[chatMessages.length - 1];

    if (lastMessageIdRef.current === lastMsg.id) return;
    lastMessageIdRef.current = lastMsg.id;

    const containerMsg = messageBubbleRef.current;
    if (!containerMsg) return;

    const nearBottom =
      containerMsg.scrollHeight -
        containerMsg.scrollTop -
        containerMsg.clientHeight <
      100;

    if (lastMsg.author_id === user.id || nearBottom) {
      messageBubbleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatSelected, currentPageMessages]);

  // Socket al estar en un chat para recibir los mensajes y actualizar los estados de los mensajes en tiempo real
  useEffect(() => {
    if (!socket || !chatSelected) return;

    const handleLiveMessage = async (data) => {
      setChatMessages((prev) => [...prev, data]);

      // Update chat rooms to show the latest message in preview
      setChatRooms((prev) => {
        const currentRooms = prev[roleGroupsOption] || [];
        return {
          ...prev,
          [roleGroupsOption]: currentRooms.map((room) => {
            if (room.id === data.chat_id) {
              return {
                ...room,
                messages: [data], // Update with the latest message
                unreadMessages:
                  data.author_id !== user.id
                    ? room.unreadMessages + 1
                    : room.unreadMessages,
              };
            }
            return room;
          }),
        };
      });

      if (data.author_id !== user.id) {
        await updateMessageStatus(chatSelected.id, data.author_id);

        socket.emit("messagesRead", {
          chat_id: chatSelected.id,
          author_id: data.author_id,
        });
      }

      if (data.file) {
        setChatFiles((prev) => [data.file, ...prev]);
      }
    };

    const handleMessagesRead = (data) => {
      if (data.chat_id === chatSelected.id) {
        setChatMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.author_id === data.author_id) {
              return { ...msg, is_read: true };
            }
            return msg;
          })
        );
      }
    };

    socket.on("messageLive", handleLiveMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("messageLive", handleLiveMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, chatSelected]);

  const handleOpenFileSelector = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const mb = 10;
      const maxSize = mb * 1024 * 1024;

      if (file.size > maxSize) {
        showError(`El archivo no puede superar los ${mb} MB`);
        fileInputRef.current.value = "";
        return;
      }

      setFile(file);
    }
  };

  const handleRemoveFileAttached = () => {
    setFile(null);
    fileInputRef.current.value = "";
  };

  // Normaliza contenido HTML pegado desde editores (ej: inicia con <p><strong>)
  const normalizeHtmlPreview = (raw) => {
    const isString = typeof raw === "string";
    const normalized = isString ? raw.replace(/^\uFEFF/, "").trimStart() : "";
    if (isString && /^<p>\s*<strong>/i.test(normalized)) {
      return normalized
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return raw;
  };

  const onSubmitSendMessage = async (e) => {
    e.preventDefault();
    setIsSubmittingMessage(true);

    const formData = new FormData(e.currentTarget);
    formData.append("chatId", chatSelected.id);
    formData.append("userId", user.id);
    formData.append("otherUserId", chatSelected.withUser.id);

    if (file) {
      const fileBase64Format = await getBase64(file);
      const fileName = file.name.split(".")[0];
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);

      formData.append("file", fileBase64Format);
      formData.append("fileName", fileName);
      formData.append("weightMb", sizeInMb);
    }

    if (messageToReplySelected) {
      formData.append("replyMsgId", messageToReplySelected.id);
    }

    const formValues = Object.fromEntries(formData);

    try {
      await sendMessage(formValues);

      setMessageToReplySelected(null);
      setMessageInput("");
      setFile(null);
      e.target.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Auto-resize textarea whenever content changes programmatically
  useEffect(() => {
    const el = messageTextareaRef.current;
    if (!el) return;

    // Check if on mobile
    const isMobile = window.innerWidth <= 1366;
    if (isMobile) return;

    const MAX = 152;
    // Only reset to auto if we're below max, otherwise keep fixed to avoid layout jumps
    if (el.scrollHeight <= MAX) {
      el.style.height = "auto";
      const next = Math.min(MAX, Math.max(50, el.scrollHeight));
      el.style.height = next + "px";
    } else {
      el.style.height = MAX + "px";
    }
    el.style.overflowY = el.scrollHeight > MAX ? "auto" : "hidden";
    // Prevent scroll chaining when capped
    if (el.scrollHeight > MAX) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messageInput]);

  // Memoizar la lista de chat rooms para evitar re-renders innecesarios
  const chatRoomsMemoized = useMemo(() => {
    const currentRooms = chatRooms[roleGroupsOption] || [];
    return currentRooms.map((chat) => (
      <ChatRoomItem
        key={chat.id}
        chat={chat}
        chatSelected={chatSelected}
        onlineUsersId={onlineUsersId}
        handleSelectChat={handleSelectChat}
        formatCustomDate={formatCustomDate}
      />
    ));
  }, [
    chatRooms,
    roleGroupsOption,
    chatSelected,
    onlineUsersId,
    handleSelectChat,
  ]);

  return (
    <section className="apia-chat-rooms-messages-section container-padding">
      <div className="apia-chat-title-header">
        <h1>Mensajes</h1>
        {totalUnreadMessages > 0 && (
          <div className="apia-chat-title-unread-messages">
            {totalUnreadMessages}
          </div>
        )}
      </div>

      <div className="apia-chat-rooms-messages-files-holder">
        {/* CHAT ROOMS */}
        <article className="apia-chat-rooms">
          <div className="role-groups-tab-buttons">
            <button
              type="button"
              className={`role-group-tab-button ${
                roleGroupsOption === "super_admin" ? "role-group-active" : ""
              }`}
              onClick={() => handleChangeRoleGroupOption("super_admin")}
            >
              Soporte
            </button>
            <hr className="tab-buttons-vertical-divider" />
            <button
              type="button"
              className={`role-group-tab-button ${
                roleGroupsOption === "parque_industrial"
                  ? "role-group-active"
                  : ""
              }`}
              onClick={() => handleChangeRoleGroupOption("parque_industrial")}
            >
              Parques
            </button>
            <hr className="tab-buttons-vertical-divider" />
            <button
              type="button"
              className={`role-group-tab-button ${
                roleGroupsOption === "empresa" ? "role-group-active" : ""
              }`}
              onClick={() => handleChangeRoleGroupOption("empresa")}
            >
              Empresas
            </button>
            <hr className="tab-buttons-vertical-divider" />
            <button
              type="button"
              className={`role-group-tab-button ${
                roleGroupsOption === "persona" ? "role-group-active" : ""
              }`}
              onClick={() => handleChangeRoleGroupOption("persona")}
            >
              Personas
            </button>
          </div>

          {isFreePlan && roleGroupsOption !== "super_admin" ? (
            <div className="apia-chat-rooms-list">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  padding: "32px 16px",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <MessageSimpleIcon className="blocked-rooms-section-icon" />
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                  Para comunicarte con otras personas, necesitás cambiar de plan
                </p>
                <Button
                  variant="primary"
                  onClick={() => router.push("/planes")}
                >
                  Suscribirme
                </Button>
              </div>
            </div>
          ) : (
            <div ref={roomListRef} className="apia-chat-rooms-list">
              {chatRoomsMemoized}
            </div>
          )}
        </article>

        {/* MESSAGES BUBBLE */}
        <ChatMessagesSection
          chatSelected={chatSelected}
          isFreePlan={isFreePlan}
          roleGroupsOption={roleGroupsOption}
          chatMessages={chatMessages}
          messageBubbleRef={messageBubbleRef}
          messageBubbleBottomRef={messageBubbleBottomRef}
          onlineUsersId={onlineUsersId}
          file={file}
          messageToReplySelected={messageToReplySelected}
          isTextareaOnFocus={isTextareaOnFocus}
          messageInput={messageInput}
          isSubmittingMessage={isSubmittingMessage}
          onSubmitSendMessage={onSubmitSendMessage}
          handleRemoveFileAttached={handleRemoveFileAttached}
          setIsTextareaOnFocus={setIsTextareaOnFocus}
          setMessageInput={setMessageInput}
          normalizeHtmlPreview={normalizeHtmlPreview}
          getFileUrlInfo={getFileUrlInfo}
          messageTextareaRef={messageTextareaRef}
          handleOpenFileSelector={handleOpenFileSelector}
          handleFileChange={handleFileChange}
          formatCustomDate={formatCustomDate}
          setChatSelected={handleSetChatSelected}
          setMessageToReplySelected={handleSetMessageToReplySelected}
          setOpenChatFiles={setOpenChatFiles}
          fileInputRef={fileInputRef}
          user={user}
        />

        {/* CHAT FILES */}
        {chatSelected && (
          <article
            className={`apia-chat-room-files ${
              openChatFiles ? "show-chat-files" : ""
            }`}
          >
            <div className="chat-files-header">
              <button
                type="button"
                className="header-back-files-btn"
                onClick={() => setOpenChatFiles(false)}
              >
                <ChatBackIcon />
              </button>
              <h2>Historial de archivos</h2>
            </div>

            <div ref={filesListRef} className="chat-files-list">
              {chatFiles?.map((file) => {
                const fileUrlInfo = getFileUrlInfo(file.url);

                return (
                  <a
                    href={file.url}
                    key={file.id}
                    className="chat-file"
                    title={fileUrlInfo.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="file-info">
                      <FileIcons fileExtension={fileUrlInfo.extension} />
                      <div className="file-name-weight">
                        <p>{fileUrlInfo.name}</p>
                        <h6>{fileWeightFormat(file.weight_mb)}</h6>
                      </div>
                    </div>
                    <FileDownloadIcon />
                  </a>
                );
              })}
              {chatFiles.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", marginTop: "20px" }}>
                  <p>No hay archivos en este chat</p>
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default ChatRoomsMessageSection;
