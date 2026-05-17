"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { logoutAction } from "@/actions";
import { PROTECTED_PREFIXES } from "@/constants/middleware";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentPath = () => {
    if (pathname) return pathname;
    if (typeof window !== "undefined") return window.location.pathname;
    return "";
  };

  const isPublicRoute = (path) => {
    const currentPath = path || getCurrentPath();
    return (
      currentPath === "/" ||
      !PROTECTED_PREFIXES.some((prefix) => currentPath.startsWith(prefix))
    );
  };

  const shouldRedirectToLogin = (path) =>
    PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  // Loading solo si el perfil aún se está cargando
  const [loading, setLoading] = useState(false);

  const verifyUser = useCallback(async () => {
    const currentPath = getCurrentPath();
    const isPublic = isPublicRoute(currentPath);

    if (!isPublic) {
      setLoading(true);
    }

    try {
      // Hacer una petición real al servidor para verificar autenticación
      // Esto enviará las cookies HTTP-only automáticamente con credentials: "include"
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (response.ok) {
        // Usuario autenticado
        setUser({ authenticated: true });
        return { authenticated: true };
      }

      // Si no hay cookie, redirigir al login
      setUser(null);
      if (shouldRedirectToLogin(currentPath)) {
        router.replace("/");
      }
      return null;
    } catch (error) {
      setUser(null);
      if (shouldRedirectToLogin(currentPath)) {
        router.replace("/");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = async () => {
    try {
      await logoutAction();
    } finally {
      const currentPath = getCurrentPath();
      setUser(null);
      router.replace("/");
    }
  };

  const handleLogin = useCallback(async (loginResponse) => {
    const normalizedUser = loginResponse?.user || loginResponse || null;
    setUser(normalizedUser);

    // El perfil se refrescará automáticamente por el ProfileContext
    // No necesitamos llamar verifyUser aquí
  }, []);

  // Verificar cuando el perfil cambie o se cargue
  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        verifyUser,
        handleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
