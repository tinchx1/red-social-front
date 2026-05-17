"use client";
import React from "react";
import StatusPill from "../StatusPill/StatusPill";
import styles from "./PostCard.module.scss";

const PostCard = ({ post, onDetailClick }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <StatusPill status={post.approvalStatus} />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.field}>
          <div className={styles.id}>ID #{post.id.slice(-5)}</div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Publicado:</span>
          <span className={styles.value}>
            {post.approvalStatus === "approved" ? "SI" : "NO"}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Nombre y Apellido:</span>
          <span className={styles.value}>
            {post.author.firstName} {post.author.lastName || ""}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Correo:</span>
          <span className={styles.value}>{post.author.email}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Contacto:</span>
          <span className={styles.value}>{post.author.phone || "N/A"}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Rubro:</span>
          <span className={styles.value}>{post.author.industry || "N/A"}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Empresa:</span>
          <span className={styles.value}>{post.author.company || "N/A"}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          className={styles.detailButton}
          onClick={() => onDetailClick(post.id)}
          type="button"
        >
          VER PUBLICACIÓN
        </button>
      </div>
    </div>
  );
};

export default PostCard;
