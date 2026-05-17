import React from "react";
import styles from "./ProfileSkeletonSimple.module.scss";

const ProfileSkeletonSimple = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.asideMobile}>
        <div className={styles.backButtonSkeleton}></div>
      </div>
      <div className={styles.perfilMain}>
        {/* Profile Info Skeleton */}
        <div className={styles.infoContainer}>
          {/* Media Header Skeleton */}
          <div className={styles.coverImage}>
            <div className={styles.bannerSkeleton}></div>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarSkeleton}></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.nameSkeleton}></div>
            </div>

            <div className={styles.contactInfo}>
              <div className={styles.contactRow}>
                <div className={styles.contactLabelSkeleton}></div>
                <div className={styles.contactValueSkeleton}></div>
              </div>
              <div className={styles.contactRow}>
                <div className={styles.contactLabelSkeleton}></div>
                <div className={styles.contactValueSkeleton}></div>
              </div>
              <div className={styles.contactRow}>
                <div className={styles.contactLabelSkeleton}></div>
                <div className={styles.contactValueSkeleton}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className={styles.infoContainer}>
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleSkeleton}></div>
            </div>
            <div className={styles.summarySkeleton}>
              <div className={styles.summaryLine}></div>
              <div className={styles.summaryLine}></div>
              <div className={styles.summaryLineShort}></div>
            </div>
          </div>
        </div>

        {/* Posts Skeleton */}
        <div className={styles.infoContainer}>
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleSkeleton}></div>
            </div>
            <div className={styles.postsGrid}>
              {[...Array(3)].map((_, index) => (
                <div key={index} className={styles.postCard}>
                  <div className={styles.postImageSkeleton}></div>
                  <div className={styles.postContent}>
                    <div className={styles.postTitleSkeleton}></div>
                    <div className={styles.postTextSkeleton}></div>
                    <div className={styles.postTextSkeleton}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeletonSimple;
