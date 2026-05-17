"use client"
import { createContext, useContext, useState } from "react";
import Toast from "../components/ui/Toast/Toast";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    status: 200,
    textSuccess: "",
    textError: "",
    duration: 3000,
    linkToPost: null,
    linkLabel: "Ver publicación compartida",
  });

  const showToast = (status, textSuccess, textError, duration = 3000, linkToPost = null, linkLabel = "Ver publicación compartida") => {
    setToast({
      show: true,
      status,
      textSuccess,
      textError,
      duration,
      linkToPost,
      linkLabel,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const showSuccess = (message, duration = 3000, linkToPost = null, linkLabel = "Ver publicación compartida") => {
    showToast(200, message, "", duration, linkToPost, linkLabel);
  };

  const showError = (message, duration = 3000) => {
    showToast(404, "", message, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, hideToast }}>
      {children}
      <Toast
        showToast={toast.show}
        setShowToast={hideToast}
        status={toast.status}
        textSuccess={toast.textSuccess}
        textError={toast.textError}
        duration={toast.duration}
        linkToPost={toast.linkToPost}
        linkLabel={toast.linkLabel}
      />
    </ToastContext.Provider>
  );
};
