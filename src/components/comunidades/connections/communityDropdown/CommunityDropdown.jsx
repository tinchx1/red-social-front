"use client";

import { useState } from "react";
import styles from "./CommunityDropdown.module.scss";
import { CardComunnity } from "../cardComunnity/CardCommunity";
import ArrowDownIcon from "@/assets/arrow-bottom-icon.svg";

export const CommunityDropdown = ({ title, communities, count, variant = "community-member" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (count === 0) return;
    setIsOpen(!isOpen);
  };

  const formatVariant = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className={styles.dropdownContainer}>
      <div
        className={`${styles.dropdownHeader} ${isOpen ? styles.open : ""}`}
        onClick={toggleDropdown}
        aria-disabled={count === 0}
      >
        <div className={styles.headerContent}>
          <span className={styles.title}>{title + " " + "(" + count + ")"}</span>
          {/* <span className={styles.count}>({count})</span> */} 
        </div>
        <div className={styles.headerContentRight}>
          <span className={`${styles.arrow} ${isOpen ? styles.rotated : ""}`}>
            {count > 0 && <ArrowDownIcon className={styles.arrowIcon} />}
          </span>
        </div>
      </div>
      
      <div className={`${styles.dropdownContent} ${isOpen ? styles.open : ""}`}>
        {communities.length > 0 ? (
          communities.map((community, index) => (
            <CardComunnity
              id={community.community.id}
              title={community.community.name}
              members={community.community.membersCount}
              description={community.community.bio}
              photoProfile={community.community.avatarUrl}
              url={`/comunidades/${community.community.id}`}
              variant={variant}
              key={index}
              className={styles.card}
            />
          ))
        ) : (
          <div className={styles.emptyMessage}>
            {variant === "community-member" 
              ? "No participas en ninguna comunidad" 
              : "No tienes comunidades creadas aún"
            }
          </div>
        )}
      </div>
    </div>
  );
};