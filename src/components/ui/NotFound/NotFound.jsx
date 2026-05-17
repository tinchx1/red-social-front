"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components";
import styles from "./NotFound.module.scss";
import Image from "next/image";
import logoRoundedUrl from "@/assets/logo-rounded.svg?url";

export default function NotFoundView() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.logo}>
        <Image src={logoRoundedUrl} alt="Logo APIA" width={200} height={70} />
      </div>

      <div className={styles.content}>
        <span className={styles.error}>Error</span>
        <span className={styles.code}>404</span>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <p className={styles.cardTitle}>Página no encontrada</p>
            <p className={styles.cardDescription}>
              Algo salió mal, volvé a intentarlo.
            </p>
          </div>
          <Button variant="primary" onClick={handleGoHome}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    </section>
  );
}
