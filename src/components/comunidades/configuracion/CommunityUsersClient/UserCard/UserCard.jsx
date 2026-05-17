import React from "react";
import styles from "./UserCard.module.scss";
import StopWarningIcon from "@/assets/stop-warning.svg";
import UserRemoveIcon from "@/assets/user-remove.svg";
import UserRoundCogIcon from "@/assets/user-round-cog.svg";
import StarIcon from "@/assets/star.svg"; import { Toggle } from "@/components/ui";
import EditPencil from "@/assets/edit-pencil-blue.svg";
import { useCreator } from "@/contexts/CreatorProvider";

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

export default function UserCard({
  user,
  onChangeRole,
  onBlock,
  onDelete,
  currentUserId,
  onChangeModerator,
}) {
  const creator = useCreator();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.id}>ID {formatId(user.id)}</div>
        <div className={styles.row}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.label}>Nombre y Apellido:</span>
          <span className={styles.value}>
            {user.firstName} {user.lastName || ""}
            {user.role === "admin" || user.role === "creator" ? (
              <>
                <StarIcon className={styles.starIcon} />
              </>
            ) : null}
            {user.role === "admin" || user.role === "creator" || user.role === "moderator" ? (
              <EditPencil className={styles.starIcon} />
            ) : null}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Tipo de cuenta:</span>
          <span className={styles.value}>{toDisplayAccountType(user.key)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Correo:</span>
          <span className={styles.value}>{user.email || "—"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Contacto:</span>
          <span className={styles.value}>{formatPhone(user.phone)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Rubro/Industria:</span>
          <span className={styles.value}>{user.industry || "N/A"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Empresa:</span>
          <span className={styles.value}>{user.company || "N/A"}</span>
        </div>
      </div>
      {creator?.canModerate && (
        <div className={styles.toggleSection}>
          <span className={styles.toggleLabel}>Puede postear:</span>
          <Toggle
            variant="community"
            checked={user.role === "admin" || user.role === "creator" || user.role === "moderator"}
            disabled={user.role === "creator" || user.role === "admin"}
            onChange={(checked) => {
              if (onChangeModerator) {
                onChangeModerator(user, checked ? "yes" : "no");
              }
            }}
          />
        </div>
      )}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.action}
          title="Cambiar rol"
          onClick={onChangeRole}
          disabled={user.role === "creator"}
        >
          <span className={styles.icon}>
            <UserRoundCogIcon />
          </span>
        </button>
        <div className={styles.divider} />
        <button
          type="button"
          className={`${styles.action} ${user.isActive ? "" : styles.isBlocked
            }`}
          title={user.isActive ? "Bloquear" : "Desbloquear"}
          onClick={onBlock}
          disabled={
            user.role === "creator" ||
            (user.role === "admin" &&
              currentUserId &&
              currentUserId === user.userId) ||
            (currentUserId === user.userId && !user.isActive)
          }
        >
          <span className={styles.icon}>
            <StopWarningIcon />
          </span>
        </button>
        <div className={styles.divider} />
        <button
          type="button"
          className={styles.action}
          title="Eliminar"
          onClick={onDelete}
          disabled={user.role === "creator"}
        >
          <span className={styles.icon}>
            <UserRemoveIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
