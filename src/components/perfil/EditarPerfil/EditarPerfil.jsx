"use client";
import React, { useState } from "react";
import styles from "./EditarPerfil.module.scss";
import { LogoutModal } from "@/components";
import { useRouter } from "next/navigation";

const EditarPerfil = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const opciones = [
    {
      id: "ajustes",
      label: "Ajustes",
      onClick: () => router.push("/configuracion"),
    },
    {
      id: "anuncios",
      label: "Anuncios",
      onClick: () => router.push("/anuncios"),
    },
    {
      id: "ayuda",
      label: "Ayuda",
      onClick: () => router.push("/consultoria"),
    },
  ];

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className={styles.editarContainer}>
      <div className={styles.opcionesList}>
        {opciones.map((opcion, idx) => (
          <React.Fragment key={opcion.id}>
            <div className={styles.opcionItem} onClick={opcion.onClick}>
              <span className={styles.opcionLabel}>{opcion.label}</span>
            </div>
            {idx < opciones.length - 1 && <div className={styles.divider} />}
          </React.Fragment>
        ))}
        <div className={styles.divider} />
        <div
          className={`${styles.opcionItem} ${styles.cerrarSesion}`}
          onClick={openLogoutModal}
        >
          <span className={styles.opcionLabel}>Cerrar Sesión</span>
        </div>
      </div>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </div>
  );
};

export default EditarPerfil;
