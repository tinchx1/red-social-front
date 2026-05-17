import { Skeleton } from "@/components/ui";
import styles from "./PrivatePageSkeleton.module.scss";

export default function PrivatePageSkeleton() {
  return (
    <div className={styles.container + " container-padding"}>
      <div className={`${styles.leftSidebar} ${styles.hideOnMobile}`}>
        {/* User Profile Skeleton - matches UserProfile component */}
        <div className={`${styles.userProfile} ${styles.hideOnMobile}`}>
          <div className={styles.userCard}>
            <div className={styles.userHeader}>
              <Skeleton width="100%" height="80px" />
              <div className={styles.profileContainer}>
                <Skeleton variant="circular" width="100px" height="100px" />
              </div>
            </div>
            <div className={styles.userInfo}>
              <Skeleton width="120px" height="16px" />
              <Skeleton width="80px" height="14px" />
              <div className={styles.contacts}>
                <Skeleton width="60px" height="14px" />
                <Skeleton width="20px" height="14px" />
              </div>
            </div>
          </div>
        </div>

        {/* Left Ads Skeleton - matches AdsList component */}
        <div className={styles.leftAds}>
          <div className={styles.adCard}>
            <Skeleton width="257px" height="257px" />
          </div>
          <div className={styles.adCard}>
            <Skeleton width="257px" height="257px" />
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Feed Header Skeleton - hidden on mobile */}
        <div className={`${styles.feedHeader} ${styles.hideOnMobile}`}>
          <div className={styles.userPrompt}>
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton width="200px" height="40px" />
          </div>

        </div>

        {/* Posts Container Skeleton */}
        <div className={styles.postsContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              {/* Post Card Skeleton */}
              <div className={styles.postCard}>
                <div className={styles.postHeader}>
                  <Skeleton variant="circular" width="48px" height="48px" />
                  <div className={styles.postHeaderInfo}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="80px" height="14px" />
                  </div>
                </div>
                <div className={styles.postContent}>
                  <Skeleton width="100%" height="16px" />
                  <Skeleton width="80%" height="16px" />
                  <Skeleton width="60%" height="16px" />
                </div>
                <div className={styles.postImage}>
                  <Skeleton width="100%" height="300px" />
                </div>
                <div className={styles.postActions}>
                  <Skeleton width="60px" height="32px" />
                  <Skeleton width="80px" height="32px" />
                  <Skeleton width="60px" height="32px" />
                </div>
              </div>

              {/* Ad between posts (every 2 posts) - matches Feed.jsx logic */}
              {(index + 1) % 2 === 0 && index < 2 && (
                <div className={styles.hideOnMobile}>
                  <div className={styles.adImageContainer}>
                    <Skeleton
                      width="100%"
                      height="auto"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.rightSidebar} ${styles.showDesktop}`}>
        {/* Right sidebar ads skeleton */}
        <div className={styles.rightAds}>
          <div className={styles.rightAdCard}>
            <Skeleton width="257px" height="514px" />
          </div>
        </div>

        {/* ButtonAds skeleton */}
        <div className={styles.buttonAds}>
          <Skeleton width="257px" height="40px" />
        </div>
      </div>

      {/* Tablet Ads List - matches adsListTablet from inicio page */}
      <div className={styles.adsListTablet}>
        <div className={styles.adCard}>
          <Skeleton width="169px" height="318px" />
        </div>
        <div className={styles.adCard}>
          <Skeleton width="173px" height="156px" />
        </div>
        <div className={styles.adCard}>
          <Skeleton width="173px" height="156px" />
        </div>
      </div>
    </div>
  );
}
