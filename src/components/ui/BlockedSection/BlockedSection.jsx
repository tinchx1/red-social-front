"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./BlockedSection.module.scss";
import { Button } from "@/components/ui";

/**
 * @param {{ desc: string; icon: React.ReactNode; wide?: boolean; messages?: boolean }} props
 */
const BlockedSection = React.memo(function BlockedSection({
  desc,
  icon,
  wide = false,
  messages = false,
}) {
  const router = useRouter();

  const handleSubscribe = () => {
    router.push("/planes");
  };

  return (
    <div
      className={`${styles.container} ${wide ? styles.wide : ""} ${
        messages ? styles.messages : ""
      }`}
    >
      <div className={styles.content}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h2 className={styles.title}>Sección bloqueada</h2>
        {desc && <p className={styles.desc}>{desc}</p>}
        <Button
          variant="primary"
          onClick={handleSubscribe}
          style={{ width: "100%", maxWidth: "280px" }}
        >
          Suscribirme
        </Button>
      </div>
    </div>
  );
});

export default BlockedSection;
