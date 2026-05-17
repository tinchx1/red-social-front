"use client";
import { createContext, useContext, useRef } from "react";

const FooterMenuContext = createContext();

export const FooterMenuProvider = ({ children }) => {
  const closeFooterMenuRef = useRef(null);

  const closeFooterMenu = () => {
    if (closeFooterMenuRef.current) {
      closeFooterMenuRef.current();
    }
  };

  const setCloseFooterMenu = (callback) => {
    closeFooterMenuRef.current = callback;
  };

  return (
    <FooterMenuContext.Provider
      value={{
        closeFooterMenu,
        setCloseFooterMenu,
      }}
    >
      {children}
    </FooterMenuContext.Provider>
  );
};

export const useFooterMenu = () => {
  const context = useContext(FooterMenuContext);
  if (!context) {
    throw new Error("useFooterMenu must be used within a FooterMenuProvider");
  }
  return context;
};

