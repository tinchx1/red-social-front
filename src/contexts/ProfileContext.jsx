"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { isAccountBlockedError } from "@/actions/profile/profile";

/**
 * Contexto para compartir datos del perfil de usuario entre componentes
 * Evita llamadas duplicadas a la API al centralizar el estado del perfil
 */
const ProfileContext = createContext();

/**
 * Hook para acceder al contexto del perfil
 * @returns {{ profile: any, stats: any, isLoading: boolean, error: any, refreshProfile: () => Promise<void> }}
 */
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

/**
 * Provider para el contexto del perfil
 * @param {{
 *   children: React.ReactNode;
 *   initialProfile?: any;
 *   initialStats?: any;
 * }} props
 */
export const ProfileProvider = ({
  children,
  initialProfile = null,
  initialStats = null,
}) => {
  const [profile, setProfile] = useState(initialProfile);
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  /**
   * Función para refrescar los datos del perfil desde la API
   */
  const refreshProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { getMyProfile, getProfileStats } = await import(
        "@/actions/profile/profile"
      );

      const [profileData, statsData] = await Promise.all([
        getMyProfile(),
        getProfileStats(),
      ]);

      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      // Si la cuenta está suspendida, hacer logout
      if (await isAccountBlockedError(err)) {
        console.log("Account blocked, logging out...");
        await logout();
        return;
      }

      setError(err);
      console.error("Error refreshing profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales si no están disponibles
  useEffect(() => {
    if (!profile && !isLoading) {
      refreshProfile();
    }
  }, [profile, isLoading]);

  const value = {
    profile,
    stats,
    isLoading,
    error,
    refreshProfile,
    // Setters para actualizar desde otros componentes
    setProfile,
    setStats,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
