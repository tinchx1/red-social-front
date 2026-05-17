import styles from './UserProfile.module.scss'
import { getMyProfile, getProfileStats } from '@/actions'
import Link from 'next/link'

const UserProfile = async ({style = {}, showInMobile = false, showContacts = false }) => {
  const user = await getMyProfile()
  const stats = await getProfileStats()
  return (
    <div className={`${styles.userCard} ${showInMobile ? styles.showInMobile : ''}`} style={style}>
      <div className={styles.userHeader}>
        {user?.bannerUrl ? (
          <img
            src={user.bannerUrl}
            alt="Cover"
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.plainBanner}></div>
        )}
        <div className={styles.profileContainer}>
          <Link href={`/perfil/${user?.id}`} className={styles.profileLink}>
            <img
              src={user?.avatarUrl || '/images/profile.svg'}
              alt="Profile"
              className={styles.profileImage}
            />
          </Link>
        </div>
      </div>

      <div className={styles.userInfo}>
        <h3 className={`${styles.userName} u-wrap-anywhere`}>
          <Link href={`/perfil/${user?.id}`} className={styles.nameLink}>
            {user?.roleKey === 'persona'
              ? `${user?.firstName} ${user?.lastName ?? ''}`.trim() || 'Usuario'
              : user?.firstName || user?.name || 'Usuario'
            }
          </Link>
        </h3>
        <p className={styles.userSubtitle}>
          {user?.roleKey === 'persona' ? "Persona" : user?.roleKey === 'empresa' ? "Empresa" : user?.roleKey === 'parque_industrial' ? "Parque Industrial" : "Administrador"}
        </p>
        {showContacts && (
          <div className={styles.contacts}>
              <span className={styles.contactsLabel}>Contactos</span> 
              <span className={styles.contactsValue}>{stats.contacts.totalContacts}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile