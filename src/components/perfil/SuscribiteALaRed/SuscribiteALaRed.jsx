import React from "react";
import styles from "./SuscribiteALaRed.module.scss";
import StarIcon from "@/assets/star.svg";
import Link from "next/link";

const SuscribiteALaRed = () => {
  return (
    <Link href="/planes" className={styles.card} role="button" tabIndex={0}>
      <div className={styles.texts}>
        <span className={styles.subtitle}>
          Mejorá tu networking con Premium
        </span>
        <h3 className={styles.title}>Suscribite a la red</h3>
      </div>
      <div className={styles.icon} aria-hidden>
        <StarIcon width={25} height={25} />
      </div>
    </Link>
  );
};

export default SuscribiteALaRed;
