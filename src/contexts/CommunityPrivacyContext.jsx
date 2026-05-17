"use client";
import { createContext, useContext, useState, useCallback } from "react";

const CommunityPrivacyContext = createContext(undefined);

/**
 * Provides reactive community privacy state.
 * @param {{ isPrivate: boolean; children: React.ReactNode }} props
 */
export function CommunityPrivacyProvider({ isPrivate: initialIsPrivate, children }) {
  const [isPrivate, setIsPrivateState] = useState(initialIsPrivate);

  const setIsPrivate = useCallback((value) => {
    setIsPrivateState(value);
  }, []);

  return (
    <CommunityPrivacyContext.Provider value={{ isPrivate, setIsPrivate }}>
      {children}
    </CommunityPrivacyContext.Provider>
  );
}

/**
 * Returns { isPrivate, setIsPrivate }.
 * Safe to call outside provider — returns { isPrivate: false } as fallback.
 */
export function useCommunityPrivacy() {
  const context = useContext(CommunityPrivacyContext);
  if (context === undefined) {
    return { isPrivate: false, setIsPrivate: () => { } };
  }
  return context;
}
