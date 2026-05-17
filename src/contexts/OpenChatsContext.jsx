"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

const OpenChatsContext = createContext(null);

export const OpenChatsProvider = ({ children }) => {
  const [openChatIds, setOpenChatIds] = useState([]);
  const [minimizedChatIds, setMinimizedChatIds] = useState([]);

  const addOpenChat = useCallback((chatId) => {
    if (!chatId) return;
    setOpenChatIds((prev) =>
      prev.includes(chatId) ? prev : [chatId, ...prev]
    );
    // Remover de minimizados si se abre
    setMinimizedChatIds((prev) => prev.filter((id) => id !== chatId));
  }, []);

  const removeOpenChat = useCallback((chatId) => {
    if (!chatId) return;
    setOpenChatIds((prev) => prev.filter((id) => id !== chatId));
  }, []);

  const minimizeChat = useCallback((chatId) => {
    if (!chatId) return;
    setMinimizedChatIds((prev) =>
      prev.includes(chatId) ? prev : [...prev, chatId]
    );
  }, []);

  const expandChat = useCallback((chatId) => {
    if (!chatId) return;
    setMinimizedChatIds((prev) => prev.filter((id) => id !== chatId));
  }, []);

  const isChatOpen = useCallback(
    (chatId) => {
      return openChatIds.includes(chatId) && !minimizedChatIds.includes(chatId);
    },
    [openChatIds, minimizedChatIds]
  );

  const isChatMinimized = useCallback(
    (chatId) => {
      return minimizedChatIds.includes(chatId);
    },
    [minimizedChatIds]
  );

  const value = useMemo(
    () => ({
      openChatIds: openChatIds.filter((id) => !minimizedChatIds.includes(id)),
      setOpenChatIds,
      addOpenChat,
      removeOpenChat,
      minimizeChat,
      expandChat,
      isChatOpen,
      isChatMinimized,
    }),
    [
      openChatIds,
      minimizedChatIds,
      addOpenChat,
      removeOpenChat,
      minimizeChat,
      expandChat,
      isChatOpen,
      isChatMinimized,
    ]
  );

  return (
    <OpenChatsContext.Provider value={value}>
      {children}
    </OpenChatsContext.Provider>
  );
};

export const useOpenChats = () => {
  const ctx = useContext(OpenChatsContext);
  if (!ctx) {
    throw new Error("useOpenChats must be used within an OpenChatsProvider");
  }
  return ctx;
};
