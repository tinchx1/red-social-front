"use client";
import React from "react";
import Image from "next/image";
import styles from "./ProfileMediaHeader.module.scss";

const ProfileMediaHeaderSimple = ({ avatarUrl, bannerUrl }) => {
  const avatar = avatarUrl || "/images/profile.svg";

  return (
    <div className={styles.coverImage}>
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt="Banner"
          className={styles.banner}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className={styles.plainBanner}></div>
      )}
      <div className={styles.avatarContainer}>
        <Image
          src={avatar}
          priority
          alt="Avatar"
          className={styles.avatar}
          sizes="(max-width: 480px) 80px,
           (max-width: 768px) 100px,
           120px"
          fill
        />
      </div>
    </div>
  );
};

export default ProfileMediaHeaderSimple;
