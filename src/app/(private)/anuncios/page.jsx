import { Suspense } from "react";
import { getMyProfile } from "@/actions/profile/profile";
import { getUserAds } from "@/actions/ads";
import AnunciosClient from "@/components/ads/AdsListClient/AnunciosClient";
import styles from "@/styles/pages/AdsTables.module.scss";
import MercadoPagoRefresh from "@/components/planes/MercadoPagoRefresh/MercadoPagoRefresh";

export default async function AnunciosPage() {
  let initialData = null;
  let clientId = null;
  let profile = null;

  try {
    profile = await getMyProfile();
    clientId = profile?.id;

    if (clientId) {
      const adsResponse = await getUserAds({ clientId, page: 1, limit: 10 });
      initialData = adsResponse;
    }
  } catch (error) {
    console.error("Error loading ads:", error);
  }

  if (!clientId) {
    return (
      <div className={styles.container}>
        <Suspense fallback={null}>
          <MercadoPagoRefresh />
        </Suspense>
        <div className={styles.header}>
          <h1 className={styles.title}>ANUNCIOS</h1>
        </div>
      </div>
    );
  }

  const hasNoResults = !initialData?.ads || initialData.ads.length === 0;
  return (
    <>
      <Suspense fallback={null}>
        <MercadoPagoRefresh />
      </Suspense>
      <AnunciosClient
        clientId={clientId}
        initialData={{ ...(initialData || {}), profile }}
        hasNoResults={hasNoResults}
      />
    </>
  );
}
