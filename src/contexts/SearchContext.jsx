"use client";
import { createContext, useContext, useRef } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const searchInputRef = useRef(null);
  const openSearchModalRef = useRef(null);
  const openSearchDesktopRef = useRef(null);
  const openSearchMobileRef = useRef(null);

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  const openSearchModal = () => {
    if (openSearchModalRef.current) {
      openSearchModalRef.current();
    }
  };

  const openSearchDesktop = () => {
    if (openSearchDesktopRef.current) {
      openSearchDesktopRef.current();
    }
  };

  const openSearchMobile = () => {
    if (openSearchMobileRef.current) {
      openSearchMobileRef.current();
    }
  };

  const setOpenSearchModal = (callback) => {
    openSearchModalRef.current = callback;
  };

  const setOpenSearchDesktop = (callback) => {
    openSearchDesktopRef.current = callback;
  };

  const setOpenSearchMobile = (callback) => {
    openSearchMobileRef.current = callback;
  };

  return (
    <SearchContext.Provider
      value={{
        searchInputRef,
        focusSearchInput,
        openSearchModal,
        setOpenSearchModal,
        openSearchDesktop,
        setOpenSearchDesktop,
        openSearchMobile,
        setOpenSearchMobile,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
