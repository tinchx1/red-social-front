import styles from "./UserProfile.module.scss";
import Link from "next/link";

const CommunityUserProfile = ({
  bannerUrl,
  avatarUrl,
  community,
  style = {},
  showInMobile = false,
  showContacts = false,
}) => {
  return (
    <div
      className={`${styles.userCard} ${
        showInMobile ? styles.showInMobile : ""
      }`}
      style={style}
    >
      <div className={styles.userHeader}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="Cover" className={styles.coverImage} />
        ) : (
          <div className={styles.plainBanner}></div>
        )}
        <div className={styles.profileContainer}>
          <Link
            href={`/perfil/${community?.id}`}
            className={styles.profileLink}
          >
            <img
              src={avatarUrl || "/images/profile.svg"}
              alt="Profile"
              className={styles.profileImage}
            />
          </Link>
        </div>
      </div>

      <div className={styles.userInfo}>
        <h3 className={`${styles.userName} u-wrap-anywhere`}>
          <Link href={`/perfil/${community?.id}`} className={styles.nameLink}>
            {community?.name || "Comunidad"}
          </Link>
        </h3>
        <p className={styles.userSubtitle}>Comunidad</p>
        {showContacts &&
          (community?.memberCount || community?.participantsCount) && (
            <div className={styles.contacts}>
              <span className={styles.contactsLabel}>Miembros</span>
              <span className={styles.contactsValue}>
                {community.memberCount || community.participantsCount}
              </span>
            </div>
          )}
      </div>
    </div>
  );
};

export default CommunityUserProfile;
