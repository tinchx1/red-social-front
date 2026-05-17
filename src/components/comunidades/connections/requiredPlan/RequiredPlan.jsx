"use client";
import { Button } from "@/components/ui";
import styles from "./RequiredPlan.module.scss";
import CommunityIcon from "/src/assets/community.svg";
import { useRouter } from "next/navigation";

export const RequiredPlan = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <CommunityIcon className={styles.icon} preserveAspectRatio="xMidYMid meet" />
      <p className={styles.title}>Requieres de un plan para crear una comunidad</p>
      <p className={styles.description}>
        Con la suscripción que elijas podrás crear nuevas comunidades que te ayuden a alcanzar tus
        objetivos.
      </p>
      <Button style={{ width: "60%" }} onClick={() => router.push("/planes")}>
        Ver planes
      </Button>
    </div>
  );
};
