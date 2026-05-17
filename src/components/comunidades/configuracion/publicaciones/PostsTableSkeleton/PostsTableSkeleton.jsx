"use client";
import React from "react";
import { Skeleton } from "@/components/ui";
import styles from "./PostsTableSkeleton.module.scss";

export default function PostsTableSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Skeleton width="150px" height="44px" className={styles.title} />
        <div className={styles.filtersRow}>
          <Skeleton width="140px" height="40px" className={styles.input} />
          <Skeleton width="140px" height="40px" className={styles.input} />
          <Skeleton width="180px" height="40px" className={styles.select} />
          <Skeleton
            width="300px"
            height="40px"
            className={styles.searchInput}
          />
          <Skeleton width="120px" height="24px" className={styles.button} />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} width="120px" height="24px" />
            ))}
          </div>
          <div className={styles.tableBody}>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div key={rowIndex} className={styles.tableRow}>
                <Skeleton width="60px" height="20px" />
                <Skeleton width="97px" height="21px" />
                <Skeleton width="140px" height="16px" />
                <Skeleton width="180px" height="16px" />
                <Skeleton width="120px" height="16px" />
                <Skeleton width="120px" height="16px" />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="80px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className={styles.mobileList}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <Skeleton width="97px" height="21px" />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.row}>
                <Skeleton width="60px" height="18px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="120px" height="16px" />
                <Skeleton width="80px" height="16px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="100px" height="16px" />
                <Skeleton width="180px" height="16px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="120px" height="16px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="120px" height="16px" />
                <Skeleton width="100px" height="16px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="100px" height="16px" />
                <Skeleton width="120px" height="16px" />
              </div>
              <div className={styles.row}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="100px" height="16px" />
              </div>
            </div>
            <div className={styles.cardFooter}>
              <Skeleton width="100%" height="32px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

