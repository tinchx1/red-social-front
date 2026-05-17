"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions";

const ActiveUserGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();
  const hasCheckedRef = useRef(false);

  const checkUserStatus = useCallback(async () => {
    // Evitar verificaciones múltiples
    if (hasCheckedRef.current) {
      return;
    }
    hasCheckedRef.current = true;

    try {
      // Verificar token - si devuelve 403, usuario está bloqueado
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (verifyResponse.status === 403) {
        // Usuario bloqueado por super admin - redirigir inmediatamente
        // Nota: Esta verificación es backup por si el SSR no detectó la suspensión
        console.log(
          "User blocked by super admin (client-side check), redirecting..."
        );
        router.push("/");
        setIsBlocked(true);
        setIsChecking(false);
        return;
      }

      if (!verifyResponse.ok) {
        setIsBlocked(true);
        setIsChecking(false);
        return;
      }

      // Verificar perfil y estado activo
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/me`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!profileResponse.ok) {
        setIsBlocked(true);
        setIsChecking(false);
        return;
      }

      const profile = await profileResponse.json();
      const isActive = profile.isActive !== false;

      if (!isActive) {
        // Usuario bloqueado - hacer logout y redirigir
        try {
          await logoutAction();
        } catch (error) {
          console.error("Error during logout:", error);
        }
        setIsBlocked(true);
      }

      setIsChecking(false);
    } catch (error) {
      console.error("Error checking user status:", error);
      setIsBlocked(true);
      setIsChecking(false);
    }
  }, [router]);

  const handleRedirect = useCallback(() => {
    if (isBlocked && !isChecking) {
      router.push("/");
    }
  }, [isBlocked, isChecking, router]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  // Efecto separado para manejar la redirección
  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Si está bloqueado, no renderizar nada (se redirigirá)
  if (isBlocked) {
    return null;
  }

  // Si no está bloqueado, renderizar children
  return children;
};

export default ActiveUserGuard;
