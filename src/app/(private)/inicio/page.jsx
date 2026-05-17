import { Feed, AdsList, UserProfile, FooterFeed } from "@/components";
import ButtonAds from "@/components/ads/ButtonAds/ButtonAds";
import styles from "@/styles/pages/Feed.module.scss";
import { getMyProfile } from "@/actions/profile/profile";
import { getCurrentAdsPositions } from "@/actions/ads/getCurrentAdsPositions";
import { AdsListProvider } from "@/contexts/AdsListContext";

export default async function DashboardPage() {
  const [user, initialAds] = await Promise.all([
    getMyProfile(),
    getCurrentAdsPositions(),
  ]);
  return (
    <AdsListProvider initialAds={initialAds}>
      <div className={styles.container + " container-padding"}>
        <div className={styles.leftSidebar}>
          <UserProfile showContacts />
          <AdsList
            positionIndices={[1, 2]}
            initialAds={[initialAds[0], initialAds[1]]}
            width={257}
            height={257}
          />
        </div>
        <div className={styles.mainContent}>
          <Feed user={user} ads={initialAds} />
        </div>
        <div className={styles.rightSidebar}>
          <AdsList
            className={styles.adsList}
            positionIndices={[3]}
            initialAds={[initialAds[2]]}
            width={257}
            height={514}
          />
          <div className={styles.buttonAdsContainer}>
            <ButtonAds style={{ width: "100%" }} rounded="medium" />
          </div>
          <div className={styles.footer}>
            <FooterFeed />
          </div>
        </div>
        <div className={styles.adsListTablet}>
          <AdsList
            className={styles.adsListTablet}
            positionIndices={[3, 1, 2]}
            initialAds={[
              { ...initialAds[2], width: 167, height: 343 },
              { ...initialAds[0], width: 167, height: 167 },
              { ...initialAds[1], width: 167, height: 167 },
            ]}
          />
        </div>
      </div>
    </AdsListProvider>
  );
}
