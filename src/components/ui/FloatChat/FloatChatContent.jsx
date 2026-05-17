"use client";

import { useEffect, useState, useRef, createRef } from "react";
import Link from "next/link";

import AvatarChat from "@/components/ui/AvatarChat";
import MessageChatBubble from "@/components/ui/MessageChatBubble";
import { getBase64 } from "@/utils";
import formatCustomDate from "@/utils/formatCustomDate";
import getFileUrlInfo from "@/utils/getFileUrlInfo";

import {
  getChatRooms,
  getChatMessages,
  sendMessage,
  updateMessageStatus,
  getChatRoomById,
} from "@/actions/chat";
import { useSocket } from "@/contexts/SocketContext";
import { useSocketRoom } from "@/hooks";
import { useToast, useMessageNotification, usePlan } from "@/contexts";

import ArrowButtonIcon from "@/assets/arrow-bottom-icon.svg";
import RemoveMinusIcon from "@/assets/remove-minus-icon.svg";
import CloseChatIcon from "@/assets/close-chat-icon.svg";
import AttachFileIcon from "@/assets/attach-file-icon.svg";
import MessageSimpleIcon from "@/assets/message-simple.svg";
import { useOpenChats } from "@/contexts/OpenChatsContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useProfile } from "@/contexts/ProfileContext";

const FloatChatContent = () => {
  const { profile: user } = useProfile();
  const { planKey } = usePlan();
  const socket = useSocket();
  const { showError } = useToast();
  const { clearNewMessage } = useMessageNotification();
  const router = useRouter();
  const {
    addOpenChat,
    removeOpenChat,
    setOpenChatIds,
    isChatOpen,
    minimizeChat,
    expandChat,
    isChatMinimized,
  } = useOpenChats();

  const isFreePlan = planKey === "free";

  const [onlineUsersId, setOnlineUsersId] = useState([]);

  const [isOpenRoomsDropdown, setIsOpenRoomsDropdown] = useState(false);
  const [wasFirstLoading, setWasFirstLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [chatTotalRooms, setChatTotalRooms] = useState(0);
  const [roleGroupsOption, setRoleGroupsOption] = useState("super_admin");
  const [currentPageRooms, setCurrentPageRooms] = useState(1);
  const pageSizeRooms = 15;
  const roomListRef = useRef();

  const [chatsSelected, setChatsSelected] = useState([]);

  const [chatsIdOpenedDropdown, setChatsIdOpenedDropdown] = useState([]);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [paginationByChat, setPaginationByChat] = useState({});
  const [scrollRefs, setScrollRefs] = useState({});
  const pageSizeMessages = 15;
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [replyMsgByChat, setReplyMsgByChat] = useState({});

  const messagesBubbleBottomRef = useRef({});
  const scrollHeightsMessagesRef = useRef({});

  const [messagesInput, setMessagesInput] = useState({});
  const fileInputsRef = useRef({});
  const [filesByChat, setFilesByChat] = useState({});

  const [isSubmittingByChat, setIsSubmittingByChat] = useState({});

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
          updatedRooms = [...prev, ...rows];
        }

        return updatedRooms;
      });

      setChatTotalRooms(count);
      setTotalUnreadMessages(totalUnreadMessages);

      if (!wasFirstLoading) {
        setWasFirstLoading(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Obtener los chat rooms del usuario
  useEffect(() => {
    if (user) {
      getRooms();
    }
  }, [user, currentPageRooms]);

  const resetChatRoomsPagination = () => {
    if (currentPageRooms === 1) {
      getRooms();
    } else {
      setCurrentPageRooms(1);
    }
  };

  // Obtener chat rooms dependiendo el rol seleccionado
  useEffect(() => {
    if (wasFirstLoading) {
      resetChatRoomsPagination();
    }
  }, [roleGroupsOption]);

  // Scroll infinity del paginado de los chat rooms
  useEffect(() => {
    const container = roomListRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;

      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        chatRooms.length < chatTotalRooms
      ) {
        setCurrentPageRooms((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatRooms.length, chatTotalRooms]);

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

    const handleUpdateRooms = async ({ roomId }) => {
      if (!roomId) return;

      try {
        const res = await getChatRoomById(roomId, user.id);

        setChatRooms((prev) => {
          if (!res.chat) return prev;

          if (res.chat.withUser?.role !== roleGroupsOption) {
            return prev;
          }

          const filtered = prev.filter((room) => room.id !== res.chat.id);

          return [res.chat, ...filtered];
        });

        if (typeof res.totalUnreadMessages === "number") {
          setTotalUnreadMessages(res.totalUnreadMessages);
        }
      } catch (error) {
        resetChatRoomsPagination();
      }
    };

    socket.on("userOnlineStatus", handleUserOnlineStatus);
    socket.on("onlineUsersList", handleOnlineUsersList);
    socket.on("updateUserRooms", handleUpdateRooms);

    return () => {
      socket.off("userOnlineStatus", handleUserOnlineStatus);
      socket.off("onlineUsersList", handleOnlineUsersList);
      socket.off("updateUserRooms", handleUpdateRooms);
    };
  }, [socket, user, currentPageRooms, roleGroupsOption]);

  const handleChangeRoleGroupOption = (role) => {
    setRoleGroupsOption(role);
    // Si es free plan y cambia a soporte, limpiar el estado completamente
    if (isFreePlan && role === "super_admin") {
      setChatRooms([]);
      setCurrentPageRooms(1);
    }
  };

  const handleSelectChat = (chat) => {
    if (chatsSelected.length === 3) {
      showError("Solo puedes tener hasta 3 chats abiertos en simultaneo");
      return;
    }

    if (!chatsSelected.find((c) => c.id === chat.id)) {
      setChatsSelected((prev) => [{ ...chat, unreadMessages: 0 }, ...prev]);
    }

    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === chat.id ? { ...room, unreadMessages: 0 } : room
      )
    );

    setTotalUnreadMessages((prev) => Math.max(0, prev - chat.unreadMessages));
    // Quitar la notificación de mensajes cuando se abre un chat
    clearNewMessage();

    if (!messagesByChat[chat.id]) getMessages(chat.id, 1);
    setChatsIdOpenedDropdown((prev) => [...prev, chat.id]);
    addOpenChat(chat.id);
  };

  const handleCloseOpenChatDropwdown = (chatId) => {
    if (chatsIdOpenedDropdown.includes(chatId)) {
      setChatsIdOpenedDropdown((prev) => prev.filter((c) => c !== chatId));
      minimizeChat(chatId);
    } else {
      setChatsIdOpenedDropdown((prev) => [...prev, chatId]);
      expandChat(chatId);
      // Limpiar notificaciones cuando se expande un chat minimizado
      clearNewMessage();
    }
  };

  const handleCloseChat = (chat) => {
    setChatsSelected((prev) => prev.filter((c) => c.id !== chat.id));

    setChatsIdOpenedDropdown((prev) => prev.filter((id) => id !== chat.id));

    setMessagesByChat((prev) => {
      const updated = { ...prev };
      delete updated[chat.id];
      return updated;
    });

    setPaginationByChat((prev) => {
      const updated = { ...prev };
      delete updated[chat.id];
      return updated;
    });

    setScrollRefs((prev) => {
      const updated = { ...prev };
      delete updated[chat.id];
      return updated;
    });
    removeOpenChat(chat.id);
  };

  // Sync context with current selected chats on changes (source of truth here)
  useEffect(() => {
    const ids = chatsSelected.map((c) => c.id);
    setOpenChatIds(ids);
  }, [chatsSelected, setOpenChatIds]);

  // Sync minimized state with local state
  useEffect(() => {
    chatsSelected.forEach((chat) => {
      const isMinimized = !chatsIdOpenedDropdown.includes(chat.id);
      if (isMinimized && !isChatMinimized(chat.id)) {
        minimizeChat(chat.id);
      } else if (!isMinimized && isChatMinimized(chat.id)) {
        expandChat(chat.id);
      }
    });
  }, [
    chatsIdOpenedDropdown,
    chatsSelected,
    minimizeChat,
    expandChat,
    isChatMinimized,
  ]);

  useSocketRoom(
    socket,
    "joinChat",
    chatsSelected.length > 0 ? chatsSelected.map((c) => c.id) : null,
    "leaveChat"
  );

  // obtener mensajes por chat
  const getMessages = async (chatId, page = 1) => {
    try {
      const res = await getChatMessages(page, pageSizeMessages, chatId);
      const { count, rows } = res;

      setMessagesByChat((prev) => {
        const prevMsgs = prev[chatId] || [];
        const existingMessageIds = new Set(prevMsgs.map((msg) => msg.id));
        const newUniqueMessages = rows.filter(
          (msg) => !existingMessageIds.has(msg.id)
        );
        const updated = page === 1 ? rows : [...newUniqueMessages, ...prevMsgs];

        return { ...prev, [chatId]: updated };
      });

      setPaginationByChat((prev) => ({
        ...prev,
        [chatId]: { total: count, currentPage: page },
      }));

      const filterNotMinesAndRead = rows.filter(
        (msg) => msg.author_id !== user.id && !msg.is_read
      );
      if (filterNotMinesAndRead.length > 0) {
        await updateMessageStatus(chatId, filterNotMinesAndRead[0].author_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // refs dinámicos por chat
  const getRefForChat = (chatId) => {
    if (!scrollRefs[chatId]) {
      setScrollRefs((prev) => ({ ...prev, [chatId]: createRef() }));
    }
    return scrollRefs[chatId];
  };

  // Scroll en la última posición al abrir el chat
  useEffect(() => {
    chatsSelected.forEach((chat) => {
      const ref = scrollRefs[chat.id]?.current;
      if (ref && messagesByChat[chat.id]?.length > 0) {
        const isFirstPage = paginationByChat[chat.id]?.currentPage === 1;
        if (isFirstPage) {
          ref.scrollTop = ref.scrollHeight;
        }
      }
    });
  }, [messagesByChat, chatsSelected, paginationByChat]);

  // Scroll infinity del paginado de los mensajes del chat
  const handleChatScroll = (chatId) => {
    const ref = scrollRefs[chatId]?.current;
    if (!ref) return;

    if (ref.scrollTop === 0) {
      const { total, currentPage } = paginationByChat[chatId] || {};
      const loaded = messagesByChat[chatId]?.length || 0;

      if (loaded < total) {
        scrollHeightsMessagesRef.current[chatId] = ref.scrollHeight;
        getMessages(chatId, currentPage + 1);
      }
    }
  };

  const handleChatSentMessageRestoreScroll = (chatId) => {
    const chatContainerRef = scrollRefs[chatId]?.current;
    const bottomOfChatRef = messagesBubbleBottomRef.current[chatId];

    if (!chatContainerRef || !bottomOfChatRef) {
      return;
    }

    const isUserNearBottom =
      chatContainerRef.scrollHeight -
        chatContainerRef.scrollTop -
        chatContainerRef.clientHeight <
      100;

    const lastMsg = messagesByChat[chatId][messagesByChat[chatId].length - 1];

    if (lastMsg.author_id === user.id || isUserNearBottom) {
      bottomOfChatRef.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Restaurar posición del scroll del chat
  useEffect(() => {
    chatsSelected.forEach((chat) => {
      const ref = scrollRefs[chat.id]?.current;
      if (ref && scrollHeightsMessagesRef.current[chat.id]) {
        const newScrollHeight = ref.scrollHeight;
        const oldScrollHeight = scrollHeightsMessagesRef.current[chat.id];

        ref.scrollTop = newScrollHeight - oldScrollHeight;

        delete scrollHeightsMessagesRef.current[chat.id];
      }
    });
  }, [messagesByChat, chatsSelected]);

  // socket: mensajes en tiempo real
  useEffect(() => {
    if (!socket || !user) return;

    const handleLiveMessage = async (data) => {
      const { chat_id } = data;
      setMessagesByChat((prev) => {
        const prevMsgs = prev[chat_id] || [];
        return { ...prev, [chat_id]: [...prevMsgs, data] };
      });

      // Update chat rooms to show the latest message in preview
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room.id === chat_id) {
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
        });
      });

      if (data.author_id !== user.id) {
        await updateMessageStatus(chat_id, data.author_id);
        socket.emit("messagesRead", { chat_id, author_id: data.author_id });
      }
    };

    const handleMessagesRead = (data) => {
      setMessagesByChat((prev) => {
        const prevMsgs = prev[data.chat_id] || [];
        const updated = prevMsgs.map((msg) =>
          msg.author_id === data.author_id ? { ...msg, is_read: true } : msg
        );
        return { ...prev, [data.chat_id]: updated };
      });
    };

    socket.on("messageLive", handleLiveMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("messageLive", handleLiveMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, user]);

  const handleFileChange = (e, chatId) => {
    const file = e.target.files[0];

    if (file) {
      const mb = 10;
      const maxSize = mb * 1024 * 1024;

      if (file.size > maxSize) {
        showError(`El archivo no puede superar los ${mb} MB`);
        e.target.value = "";
        return;
      }

      setFilesByChat((prev) => ({
        ...prev,
        [chatId]: file,
      }));
    }
  };

  const handleRemoveFileAttached = (chatId) => {
    setFilesByChat((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
  };

  const handleReplyMessage = (chatId, msg) => {
    setReplyMsgByChat((prev) => ({
      ...prev,
      [chatId]: msg,
    }));
  };

  const handleRemoveReplyMessage = (chatId) => {
    setReplyMsgByChat((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
  };

  const onSubmitSendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.append("userId", user.id);

    const chatId = formData.get("chatId");

    setIsSubmittingByChat((prev) => ({ ...prev, [chatId]: true }));

    const file = filesByChat[chatId];
    const replyMessage = replyMsgByChat[chatId];

    if (file) {
      const fileBase64Format = await getBase64(file);
      const fileName = file.name.split(".")[0];
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);

      formData.append("file", fileBase64Format);
      formData.append("fileName", fileName);
      formData.append("weightMb", sizeInMb);
    }

    if (replyMessage) {
      formData.append("replyMsgId", replyMessage.id);
    }

    const formValues = Object.fromEntries(formData);

    try {
      await sendMessage(formValues);

      setReplyMsgByChat((prev) => {
        const copy = { ...prev };
        delete copy[chatId];
        return copy;
      });

      setMessagesInput((prev) => ({
        ...prev,
        [chatId]: "",
      }));

      setFilesByChat((prev) => {
        const copy = { ...prev };
        delete copy[chatId];
        return copy;
      });

      e.target.reset();
      handleChatSentMessageRestoreScroll(chatId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingByChat((prev) => ({ ...prev, [chatId]: false }));
    }
  };

  return (
    <article className="float-chat">
      {/* CHATS TAB */}
      {chatsSelected?.map((chat) => (
        <div
          key={chat.id}
          className={`float-chat-message-tab ${
            chatsIdOpenedDropdown.includes(chat.id) ? "chat-tab-opened" : ""
          }`}
        >
          <div className="chat-message-tab-header">
            {chatsIdOpenedDropdown.includes(chat.id) ? (
              <div className="chat-tab-header-user-action">
                <Link
                  href={`/perfil/${chat.withUser?.id}`}
                  className="tab-header-user-info"
                >
                  <AvatarChat
                    imgUrl={chat.withUser?.avatarUrl}
                    isConnected={onlineUsersId.includes(chat.withUser.id)}
                  />
                  <h4>{chat.withUser.name}</h4>
                </Link>
                <div className="tab-header-actions">
                  <button
                    type="button"
                    className="tab-minimise-chat-button"
                    onClick={() => handleCloseOpenChatDropwdown(chat.id)}
                  >
                    <RemoveMinusIcon />
                  </button>
                  <button
                    type="button"
                    className="tab-close-chat-button"
                    onClick={() => handleCloseChat(chat)}
                  >
                    <CloseChatIcon />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="chat-tab-button"
                onClick={() => handleCloseOpenChatDropwdown(chat.id)}
              >
                <div className="tab-name-indicador">
                  <h4>{chat.withUser.name}</h4>
                  <span
                    className={`user-connection-indicator ${
                      onlineUsersId.includes(chat.withUser.id)
                        ? "user-connected"
                        : ""
                    }`}
                  />
                </div>
                <button
                  type="button"
                  className="tab-close-chat-button"
                  onClick={() => handleCloseChat(chat)}
                >
                  <CloseChatIcon />
                </button>
              </div>
            )}
          </div>

          <div className="chat-message-tab-body">
            <div
              ref={getRefForChat(chat.id)}
              className="messages-chat"
              onScroll={() => handleChatScroll(chat.id)}
            >
              {messagesByChat[chat.id]?.map((msg) => {
                const replyMessage =
                  msg.replyTo?.message !== ""
                    ? msg.replyTo?.message
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
                    onClickReplyBtn={() => handleReplyMessage(chat.id, msg)}
                  />
                );
              })}
              <div
                ref={(el) => (messagesBubbleBottomRef.current[chat.id] = el)}
              />
            </div>

            <form
              className="chat-tab-message-send-form"
              onSubmit={onSubmitSendMessage}
              method="post"
              autoComplete="off"
            >
              <input type="hidden" name="chatId" value={chat.id} />
              <input
                type="hidden"
                name="otherUserId"
                value={chat.withUser.id}
              />

              {filesByChat[chat.id] && (
                <article className="file-attached-to-upload">
                  <p>{filesByChat[chat.id].name}</p>
                  <button
                    type="button"
                    className="file-attached-remove-btn"
                    onClick={() => handleRemoveFileAttached(chat.id)}
                  >
                    <CloseChatIcon />
                  </button>
                </article>
              )}

              {replyMsgByChat[chat.id] && (
                <article className="message-to-reply">
                  <p>
                    {replyMsgByChat[chat.id].message !== ""
                      ? replyMsgByChat[chat.id].message
                      : getFileUrlInfo(replyMsgByChat[chat.id].file.url)
                          .fullFileName}
                  </p>
                  <button
                    type="button"
                    className="message-reply-remove-btn"
                    onClick={() => handleRemoveReplyMessage(chat.id)}
                  >
                    <CloseChatIcon />
                  </button>
                </article>
              )}

              <div className="message-send-input-submit">
                <div className="input-attach-file">
                  <textarea
                    name="message"
                    id="message"
                    placeholder="Escribí algo aquí..."
                    required={!filesByChat[chat.id]}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !isSubmittingByChat[chat.id]
                      ) {
                        e.preventDefault();
                        const form = e.currentTarget.closest(
                          ".chat-tab-message-send-form"
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
                    value={messagesInput[chat.id] || ""}
                    onChange={(e) =>
                      setMessagesInput((prev) => ({
                        ...prev,
                        [chat.id]: e.target.value,
                      }))
                    }
                  ></textarea>
                  <input
                    type="file"
                    ref={(el) => (fileInputsRef.current[chat.id] = el)}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, chat.id)}
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
                    onClick={() => fileInputsRef.current[chat.id]?.click()}
                    disabled={filesByChat[chat.id]}
                  >
                    <AttachFileIcon />
                  </button>
                </div>

                <button
                  type="submit"
                  className="message-send-input-submit-btn"
                  disabled={
                    isSubmittingByChat[chat.id] ||
                    ((messagesInput[chat.id] ?? "").trim() === "" &&
                      !filesByChat[chat.id])
                  }
                >
                  {((messagesInput[chat.id] ?? "").trim() !== "" ||
                    filesByChat[chat.id]) && (
                    <>
                      <div className="loader"></div>
                      <span>Enviar</span>
                    </>
                  )}
                  {(messagesInput[chat.id] ?? "").trim() === "" &&
                    !filesByChat[chat.id] &&
                    "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ))}

      {/* ROOMS */}
      <div
        className={`float-chat-rooms ${
          isOpenRoomsDropdown ? "chat-rooms-opened" : ""
        } ${user?.roleKey === "super_admin" ? "super-admin-chat-rooms" : ""}`}
      >
        <button
          type="button"
          className="float-chat-rooms-header-btn"
          onClick={() => setIsOpenRoomsDropdown(!isOpenRoomsDropdown)}
        >
          <div className="title-unread-indicator">
            <h4>Mensajes</h4>
            {totalUnreadMessages > 0 && <span className="unread-indicator" />}
          </div>
          <ArrowButtonIcon />
        </button>

        <div className="float-chat-rooms-body">
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
            <div className="blocked-rooms-section">
              <MessageSimpleIcon />
              <p>
                Para comunicarte con otras personas, necesitás cambiar de plan
              </p>
              <Button variant="primary" onClick={() => router.push("/planes")}>
                Suscribirme
              </Button>
            </div>
          ) : (
            <div ref={roomListRef} className="apia-chat-rooms-list">
              {chatRooms?.map((chat) => {
                return (
                  <button
                    type="button"
                    key={chat.id}
                    className={`chat-room-button ${
                      chatsSelected.includes(chat) ? "chat-room-open" : ""
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="room-avatar-username">
                      <AvatarChat
                        imgUrl={chat.withUser?.avatarUrl}
                        isConnected={onlineUsersId.includes(chat.withUser.id)}
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
                      {chat.unreadMessages > 0 &&
                        !isChatOpen(String(chat.id)) && (
                          <span className="room-total-unread-message">
                            {chat.unreadMessages}
                          </span>
                        )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default FloatChatContent;
