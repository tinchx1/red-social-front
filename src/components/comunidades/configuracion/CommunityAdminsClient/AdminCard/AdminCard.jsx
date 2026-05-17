import React from "react";
import styles from "./AdminCard.module.scss";
import UserRemoveIcon from "@/assets/user-remove.svg";

const formatId = (id) => {
  if (!id) return "#-----";
  const suffix = String(id).slice(-5);
  return `#${suffix}`;
};

const toDisplayAccountType = (key) => {
  const map = {
    persona: "Persona",
    empresa: "Empresa",
    parque_industrial: "Parque Industrial",
  };
  return map[key] || "Persona";
};

const formatPhone = (phone) => {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    const area = cleaned.slice(-10, -7);
    const first = cleaned.slice(-7, -4);
    const last = cleaned.slice(-4);
    return `(${area}) ${first}-${last}`;
  }
  return phone;
};

const formatDate = (dateString) => {
  if (!dateString) return "dd/mm/aaaa";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "dd/mm/aaaa";
  }
};

export default function AdminCard({ admin, onChangeRole }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.id}>ID {formatId(admin.id)}</div>
        <div className={styles.row}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.label}>Nombre y Apellido:</span>
          <span className={styles.value}>
            {admin.firstName} {admin.lastName || ""}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Tipo de cuenta:</span>
          <span className={styles.value}>
            {toDisplayAccountType(admin.key)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Correo:</span>
          <span className={styles.value}>{admin.email || "—"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Contacto:</span>
          <span className={styles.value}>{formatPhone(admin.phone)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Rubro/Industria:</span>
          <span className={styles.value}>{admin.industry || "N/A"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Empresa:</span>
          <span className={styles.value}>{admin.company || "N/A"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Admin desde:</span>
          <span className={styles.value}>
            {formatDate(admin.joinedAt)}
          </span>
        </div>
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.action}
          title="Quitar rol de administrador"
          onClick={onChangeRole}
        >
          <span className={styles.icon}>
            <UserRemoveIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
