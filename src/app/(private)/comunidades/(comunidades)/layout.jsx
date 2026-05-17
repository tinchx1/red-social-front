import { Suspense } from "react";
import { getStatsUserCommunity, getMyProfile } from "@/actions";
import { AboutComunity } from "@/components/comunidades/connections/aboutComunnity/AboutCommunity";
import { RouteComunity } from "@/components/comunidades/connections/routes-comunity/RouteComunity";
import { PageSkeleton } from "@/components/ui";
import styles from "@/styles/pages/comunidad/layoutComunidad.module.scss";

async function ComunidadesContent({ children }) {
  const data = await getStatsUserCommunity();
  let userRole = null;
  let planKey = null;
  try {
    const profile = await getMyProfile();
    userRole = profile?.roleKey || profile?.user?.roleKey;
    planKey =
      profile?.subscription?.key ||
      profile?.subscription?.plan?.key ||
      profile?.plan?.key ||
      profile?.planKey ||
      null;
  } catch (error) {
    console.log("Error getting user profile:", error);
  }

  const isFreePlan = planKey === "free" || planKey === null;
  return (
    <div className={styles.container + " container-padding"}>
      <div className={styles.leftDiv}>
        <RouteComunity
          data={data}
          userRole={userRole}
          isFreePlan={isFreePlan}
          planKey={planKey || "free"}
        />
      </div>

      <div className={styles.RightDiv}>
        <AboutComunity count={data?.myCommunities?.total || 0} />
      </div>

      <div className="comunidades-content" style={{ minHeight: "500px" }}>
        {children}
      </div>
    </div>
  );
}

export default function ComunidadesLayout({ children }) {
  return (
    <Suspense fallback={<PageSkeleton variant="communities-with-aside" />}>
      <ComunidadesContent>{children}</ComunidadesContent>
    </Suspense>
  );
}
