"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components";
import styles from "./Error.module.scss";
import Image from "next/image";
import logoRoundedUrl from "@/assets/logo-rounded.svg?url";

/**
 * @param {{ error?: Error & { digest?: string }; reset?: () => void }} props
 */
export default function ErrorView({ error, reset }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.logo}>
        <Image src={logoRoundedUrl} alt="Logo APIA" width={200} height={70} />
      </div>

      <div className={styles.content}>
        <span className={styles.error}>Error</span>
        <span className={styles.code}>500</span>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <p className={styles.cardTitle}>Algo salió mal</p>
            <p className={styles.cardDescription}>
              {"Ocurrió un error inesperado. Por favor, intentá de nuevo."}
            </p>
          </div>
          <div className={styles.actions}>
            {reset && (
              <Button variant="primary" onClick={handleReset}>
                Intentar de nuevo
              </Button>
            )}
            <Button variant="secondary" onClick={handleGoHome}>
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
