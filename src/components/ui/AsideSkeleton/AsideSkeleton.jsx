import { Skeleton } from '@/components/ui';
import styles from './AsideSkeleton.module.scss';

export default function AsideSkeleton({ 
  variant = 'red', // 'red', 'communities'
  className = '' 
}) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'red':
        return (
          <div className={styles.redAside + ' container-padding'}>
            <div className={styles.redAsideHeader}>
              <div className={styles.redAsideTitle}>
                <Skeleton width="80px" height="20px" />
                <Skeleton variant="circular" width="30px" height="30px" />
              </div>
            </div>
            <div className={styles.redAsideNav}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={styles.redAsideNavItem}>
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="20px" height="20px" variant="circular" />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'communities':
        return (
          <div className={styles.communitiesAside + ' container-padding'}>
            <div className={styles.communitiesAsideHeader}>
              <div className={styles.communitiesAsideTitle}>
                <Skeleton width="120px" height="20px" />
                <Skeleton variant="circular" width="30px" height="30px" />
              </div>
            </div>
            <div className={styles.communitiesAsideNav}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.communitiesAsideNavItem}>
                  <Skeleton width="140px" height="16px" />
                  <Skeleton width="20px" height="20px" variant="circular" />
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div className={styles.defaultAside}><Skeleton width="100%" height="200px" /></div>;
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {renderSkeleton()}
    </div>
  );
}
