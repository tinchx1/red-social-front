"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./EditarComunidad.module.scss";

const EditarComunidad = ({ membershipStatus }) => {
  const router = useRouter();
  const params = useParams();
  const communityId = params.communityId;
  const isMember =
    membershipStatus?.status === "approved" ||
    membershipStatus?.status === "creator";
  const isAdmin =
    membershipStatus?.isAdmin === true ||
    membershipStatus?.status === "creator";
  const opciones = [
    ...(isMember
      ? [
          {
            id: "notificaciones",
            label: "Gestiona tus notificaciones",
            onClick: () =>
              router.push(
                `/comunidades/${communityId}/configuracion-notificaciones`
              ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "ajustes",
            label: "Ajustes",
            onClick: () =>
              router.push(
                `/comunidades/${communityId}/administracion/configuracion`
              ),
          },
        ]
      : []),
    {
      id: "ayuda",
      label: "Ayuda",
      onClick: () => router.push("/consultoria"),
    },
  ];

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
      </div>
    </div>
  );
};

export default EditarComunidad;
