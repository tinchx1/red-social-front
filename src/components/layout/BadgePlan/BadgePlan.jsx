"use client";
import React from "react";
import styles from "./BadgePlan.module.scss";
import Link from "next/link";

/**
 * @param {{ label: string; className?: string }} props
 */
export default function BadgePlan({ label, className = "" }) {
  return <Link href="/planes" className={`${styles.badge} ${className}`}><span className={styles.badgeText}>{label}</span></Link>;
}
