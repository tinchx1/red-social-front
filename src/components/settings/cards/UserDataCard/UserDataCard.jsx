"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./UserDataCard.module.scss";
import EditIcon from "@/assets/buttonEditar.svg";
import EditUserDataModal from "../../EditUserDataModal/EditUserDataModal";

/**
 * @param {{
 *  name: string;
 *  email: string;
 *  phone?: string;
 *  userData?: any;
 *  onSave?: (data: any) => void;
 * }} props
 */
export default function UserDataCard({ name, email, phone, userData, onSave }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState("personal");
  const handleEditClick = () => {
    setModalDefaultTab("personal");
    setIsModalOpen(true);
  };

  const handleChangePasswordClick = () => {
    setModalDefaultTab("password");
    setIsModalOpen(true);
  };

  return (
    <>
      <section className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Datos del usuario</h2>
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEditClick}
          >
            <EditIcon />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <div className={styles.label}>Nombre</div>
            <div className={styles.value}>{name}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Correo electrónico</div>
            <div className={styles.value}>{email}</div>
          </div>

          {phone ? (
            <div className={styles.field}>
              <div className={styles.label}>Teléfono</div>
              <div className={styles.value}>{phone}</div>
            </div>
          ) : null}

          <button
            type="button"
            className={styles.link}
            onClick={handleChangePasswordClick}
          >
            Cambiar Contraseña
          </button>
        </div>
      </section>

      <EditUserDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalDefaultTab}
        userData={userData}
        onSave={onSave}
      />
    </>
  );
}
