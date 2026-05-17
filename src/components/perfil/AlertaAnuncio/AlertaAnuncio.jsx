import React from "react";
import Image from "next/image";
import styles from "./AlertaAnuncio.module.scss";
import warningIcon from "@/assets/warning.svg?url";

const AlertaAnuncio = () => {
  return false ? (
    <div className={styles.alertContainer}>
      <Image src={warningIcon} alt="Warning" width={25} height={25} />
      <p className={styles.message}>Tenés un anuncio pendiente de aprobación</p>
    </div>
  ) : null;
};

export default AlertaAnuncio;


