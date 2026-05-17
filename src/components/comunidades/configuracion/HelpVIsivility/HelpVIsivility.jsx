"use client";
import React from "react";
import styles from "./HelpVIsivility.module.scss";

/**
 * Help component for visibility settings
 */
export default function HelpVIsivility({ isPrivate }) {
  return (
    <div className={styles.helpText}>
      <span>¿Qué significa?</span>
      <p> {isPrivate ? "Sólo los miembros de tu comunidad podrán ver el contenido compartido" : "Cualquier usuario de la plataforma podrá ver el contenido compartido"}</p>
    </div>
  );
}