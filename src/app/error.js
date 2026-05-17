"use client";

import { useEffect } from "react";
import styles from "@/styles/pages/not-found.module.scss";
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

