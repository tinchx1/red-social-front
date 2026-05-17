import React from "react";
import styles from "./ResumenPerfil.module.scss";

const ResumenPerfilSimple = ({ summary, style }) => {
  return (
    summary && (
      <div className={styles.infoContainer} style={style}>
        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <h2>Resumen</h2>
          </div>
          <p className={styles.summaryText}>
            {summary?.trim() ? summary : "Todavía no agregaste un resumen."}
          </p>
        </div>
      </div>
    )
  );
};

export default ResumenPerfilSimple;
