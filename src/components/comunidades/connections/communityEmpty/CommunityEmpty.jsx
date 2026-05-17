import CommunityIcon from "/src/assets/community.svg";
import styles from "./ComunnityEmpty.module.scss";
import Link from "next/link";
import { Button } from "@/components/ui";

export const CommunityEmpty = ({ title, showButton = true }) => {
  return (
    <div className={styles.container}>
      <CommunityIcon className={styles.icon} preserveAspectRatio="xMidYMid meet" />
      <p className={styles.title}>{title || "Todavía no sos parte de una comunidad"}</p>
      {showButton && (
        <Link href={"/comunidades/buscar-comunidad"} style={{ width: "100%", maxWidth: "300px" }}>
          
          <Button style={{ width: "100%", maxWidth: "300px" }}>Ver recomendaciones</Button>
        </Link>
      )}
    </div>
  );
};
