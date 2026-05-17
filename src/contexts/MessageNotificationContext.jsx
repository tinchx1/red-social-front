"use client";
import { createContext, useContext, useState } from "react";

const MessageNotificationContext = createContext();

export const useMessageNotification = () => {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error(
      "useMessageNotification must be used within a MessageNotificationProvider"
    );
  }
  return context;
};

export const MessageNotificationProvider = ({ children }) => {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messageIconKey, setMessageIconKey] = useState(0);

  const showNewMessage = () => {
    setHasNewMessage(true);
    setMessageIconKey((k) => k + 1); // remount icon to retrigger CSS animation
  };

  const clearNewMessage = () => {
    setHasNewMessage(false);
  };

  const value = {
    hasNewMessage,
    messageIconKey,
    showNewMessage,
    clearNewMessage,
  };

  return (
    <MessageNotificationContext.Provider value={value}>
      {children}
    </MessageNotificationContext.Provider>
  );
};
