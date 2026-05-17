"use client";

import { useEffect } from "react";
import styles from "@/styles/pages/not-found.module.scss";
import layoutStyles from "@/styles/layout/layout.module.scss";
import { FooterMobile, NavbarMobile, NavbarDesktop, Providers } from "@/components";
import JoinNotificationRoom from "@/components/socket/JoinNotificationRoom";
import FloatChat from "@/components/ui/FloatChat";
import ErrorView from "@/components/ui/Error/Error";

/**
 * @param {{ error: Error & { digest?: string }; reset: () => void }} props
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (

      <main className={styles.main}>
        <ErrorView error={error} reset={reset} />
      </main>
  );
}

