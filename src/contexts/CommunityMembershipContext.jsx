"use client";
import { createContext, useContext, useState, useCallback } from "react";
import {
  getCommunityMembershipStatus,
  requestCommunityMembership,
  leaveCommunity,
} from "@/actions/community/communities";

const CommunityMembershipContext = createContext(undefined);

export function CommunityMembershipProvider({ children }) {
  // Map de communityId -> status
  const [memberships, setMemberships] = useState(new Map());
  const [loading, setLoading] = useState(new Map());

  /**
   * Obtener el estado de membresía de una comunidad
   */
  const getStatus = useCallback(
    async (communityId) => {
      if (!communityId) return null;

      // Si ya tenemos el estado en caché, retornarlo
      if (memberships.has(communityId)) {
        return memberships.get(communityId);
      }

      // Si no, cargarlo del servidor
      try {
        const data = await getCommunityMembershipStatus(communityId);
        const status = data?.status || "none";
        setMemberships((prev) => new Map(prev).set(communityId, status));
        return status;
      } catch (error) {
        console.error("Error fetching membership status:", error);
        return "none";
      }
    },
    [memberships]
  );

  /**
   * Solicitar unirse a una comunidad
   */
  const requestMembership = useCallback(async (communityId) => {
    if (!communityId) return;

    setLoading((prev) => new Map(prev).set(communityId, true));
    try {
      await requestCommunityMembership(communityId);
      setMemberships((prev) => new Map(prev).set(communityId, "pending"));
      return { success: true };
    } catch (error) {
      console.error("Error requesting membership:", error);
      return { success: false, error };
    } finally {
      setLoading((prev) => new Map(prev).set(communityId, false));
    }
  }, []);

  /**
   * Abandonar una comunidad
   */
  const leave = useCallback(async (communityId) => {
    if (!communityId) return;

    setLoading((prev) => new Map(prev).set(communityId, true));
    try {
      await leaveCommunity(communityId);
      setMemberships((prev) => new Map(prev).set(communityId, "none"));
      return { success: true };
    } catch (error) {
      console.error("Error leaving community:", error);
      return { success: false, error };
    } finally {
      setLoading((prev) => new Map(prev).set(communityId, false));
    }
  }, []);

  /**
   * Actualizar el estado de una comunidad manualmente
   */
  const updateStatus = useCallback((communityId, status) => {
    if (!communityId) return;
    setMemberships((prev) => new Map(prev).set(communityId, status));
  }, []);

  /**
   * Refrescar el estado desde el servidor
   */
  const refresh = useCallback(async (communityId) => {
    if (!communityId) return;

    try {
      const data = await getCommunityMembershipStatus(communityId);
      const status = data?.status || "none";
      setMemberships((prev) => new Map(prev).set(communityId, status));
      return status;
    } catch (error) {
      console.error("Error refreshing membership status:", error);
      return null;
    }
  }, []);

  /**
   * Limpiar el estado de una comunidad del caché
   */
  const clearStatus = useCallback((communityId) => {
    setMemberships((prev) => {
      const newMap = new Map(prev);
      newMap.delete(communityId);
      return newMap;
    });
  }, []);

  const value = {
    memberships: Object.fromEntries(memberships),
    loading: Object.fromEntries(loading),
    getStatus,
    requestMembership,
    leave,
    updateStatus,
    refresh,
    clearStatus,
  };

  return (
    <CommunityMembershipContext.Provider value={value}>
      {children}
    </CommunityMembershipContext.Provider>
  );
}

export function useCommunityMembership() {
  const context = useContext(CommunityMembershipContext);
  if (context === undefined) {
    throw new Error(
      "useCommunityMembership must be used within a CommunityMembershipProvider"
    );
  }
  return context;
}
