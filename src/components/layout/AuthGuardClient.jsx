"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuardClient() {
  const router = useRouter();
  const isVerifyingRef = useRef(false);
  const lastCheckRef = useRef(0);
  const timeoutRef = useRef(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      // Evitar llamadas simultáneas
      if (isVerifyingRef.current) return;

      // Evitar verificar muy frecuentemente (mínimo 5 segundos entre verificaciones)
      const now = Date.now();
      if (now - lastCheckRef.current < 5000) return;

      isVerifyingRef.current = true;
      lastCheckRef.current = now;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );
        if (res.ok) {
          router.replace("/inicio");
        } else if (res.status === 403) {
          // Usuario bloqueado - redirigir a home
          router.replace("/");
        }
      } catch (_) {
        // ignore other errors
      } finally {
        isVerifyingRef.current = false;
      }
    };

    // Solo verificar una vez al montar
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      verifyAndRedirect();
    }

    // handle bfcache restores (back/forward) - solo cuando se restaura desde cache
    const onPageShow = (e) => {
      if (e.persisted) {
        // Delay pequeño para bfcache y verificar que no sea muy reciente
        const now = Date.now();
        if (now - lastCheckRef.current < 5000) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          verifyAndRedirect();
        }, 100);
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return null;
}
