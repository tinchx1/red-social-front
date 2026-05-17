import { Skeleton } from "@/components/ui";
import styles from "./ProfileSkeleton.module.scss";

export default function ProfileSkeleton({ variant = "profile" }) {
  return (
    <div className={styles.profileContainer + " container-padding"}>
      <div className={styles.profileMain}>
        {/* InformacionPerfil skeleton */}
        <div className={styles.infoContainer}>
          {/* ProfileMediaHeader skeleton */}
          <div className={styles.mediaHeader}>
            <Skeleton width="100%" height="200px" />
            <div className={styles.avatarContainer}>
              <Skeleton variant="circular" className={styles.avatarSkeleton} />
            </div>
          </div>

          <div className={styles.content}>
            {/* Action buttons skeleton */}
            <div className={styles.actionButtons}>
              <Skeleton width="20px" height="20px" variant="circular" />
            </div>

            {/* Header with name skeleton */}
            <div className={styles.header}>
              <Skeleton width="200px" height="28px" />
            </div>

            {/* Address section skeleton */}
            <div className={styles.contactInfo}>
              <div className={styles.contactRow}>
                <Skeleton width="100px" height="16px" />
              </div>
            </div>

            {/* Contact information skeleton */}
            <div className={styles.contactInfo}>
              <div className={styles.contactRow}>
                <Skeleton width="80px" height="14px" />
                <Skeleton width="150px" height="14px" />
              </div>
              <div className={styles.contactRow}>
                <Skeleton width="60px" height="14px" />
                <Skeleton width="200px" height="14px" />
              </div>
              <div className={styles.contactRow}>
                <Skeleton width="40px" height="14px" />
                <Skeleton width="180px" height="14px" />
              </div>
              <div className={styles.contactRow}>
                <Skeleton width="70px" height="14px" />
                <Skeleton width="160px" height="14px" />
              </div>
            </div>

            {/* Interests section skeleton */}
            <div className={styles.interests}>
              <div className={styles.interestRow}>
                <Skeleton width="80px" height="14px" />
                <div className={styles.interestTags}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      width="80px"
                      height="24px"
                      borderRadius="12px"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Contacts count skeleton */}
            <div className={styles.contactRow}>
              <Skeleton width="100px" height="14px" />
            </div>
          </div>
        </div>

        {/* Mobile components skeleton */}
        <div className={styles.onlyMobile}>
          <div className={styles.suscribiteCard}>
            <Skeleton width="100%" height="120px" />
          </div>
          <div className={styles.alertaCard}>
            <Skeleton width="100%" height="80px" />
          </div>
        </div>

        {/* ResumenPerfil skeleton */}
        <div className={styles.resumenContainer}>
          <div className={styles.sectionHeader}>
            <Skeleton width="80px" height="20px" />
            <Skeleton width="20px" height="20px" variant="circular" />
          </div>
          <div className={styles.summaryContent}>
            <Skeleton width="100%" height="16px" />
            <Skeleton width="90%" height="16px" />
            <Skeleton width="70%" height="16px" />
          </div>
        </div>

        {/* Publicaciones skeleton */}
        <div className={styles.publicacionesContainer}>
          <div className={styles.publicacionesHeader}>
            <Skeleton width="120px" height="24px" />
          </div>
          <div className={styles.postsList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <Skeleton variant="circular" width="40px" height="40px" />
                  <div className={styles.postUserInfo}>
                    <Skeleton width="120px" height="16px" />
                    <Skeleton width="80px" height="12px" />
                  </div>
                </div>
                <div className={styles.postContent}>
                  <Skeleton width="100%" height="16px" />
                  <Skeleton width="85%" height="16px" />
                  <Skeleton width="60%" height="16px" />
                </div>
                <div className={styles.postActions}>
                  <Skeleton width="60px" height="32px" />
                  <Skeleton width="60px" height="32px" />
                  <Skeleton width="60px" height="32px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className={styles.profileSidebar}>
        <div className={styles.suscribiteCard}>
          <Skeleton width="100%" height="120px" />
        </div>
        <div className={styles.editarCard}>
          <Skeleton width="100%" height="60px" />
        </div>
        <div className={styles.alertaCard}>
          <Skeleton width="100%" height="80px" />
        </div>
      </div>
    </div>
  );
}
