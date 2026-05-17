import {
  getCommunityNotificationPreferences,
  getCommunityById,
  getCommunityMembershipStatusServer,
} from "@/actions";
import { CommunityNotificationSettingsClient } from "@/components/notificaciones";
import styles from "@/styles/pages/NotificacionesConfiguracion.module.scss";
import { getMyProfile } from "@/actions";
import { VolverButton } from "@/components";
import CommunityUserProfile from "@/components/layout/UserProfile/CommunityUserProfile";
import { notFound, redirect } from "next/navigation";

export default async function CommunityNotificationPreferencesPage({ params }) {
  const id = await params.communityId;

  let notifications = {
    newPublications: true,
    newComments: true,
    newLikes: true,
    newTag: true,
    newSharedContent: true,
    newMember: true,
  };
  let community = null;
  let error = null;
  let membershipStatus = null;

  try {
    // Get community data and user profile
    community = await getCommunityById(id);
    const userId = (await getMyProfile()).id;

    // Check membership status to protect the page
    membershipStatus = await getCommunityMembershipStatusServer(id);
    const isMember =
      membershipStatus?.status === "approved" ||
      membershipStatus?.status === "creator";
    if (!isMember) {
      redirect(`/comunidades/${id}`);
    }

    // Get community notification preferences
    notifications = await getCommunityNotificationPreferences({
      userId,
      communityId: id,
    });
  } catch (err) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSidebar + " " + styles.inConfig}>
        <VolverButton variant="light-blue" />
        <div
          className={styles.hideTablet}
          style={{ width: "100%", height: "fit-content" }}
        >
          <CommunityUserProfile
            bannerUrl={community?.bannerUrl}
            avatarUrl={community?.avatarUrl}
            community={community}
            style={{ width: "100%", height: "fit-content" }}
            showContacts
          />
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.notificationCard}>
          <h1 className={styles.title}>
            Notificaciones de {community?.name}
          </h1>
          <CommunityNotificationSettingsClient
            initialNotifications={notifications}
            communityId={id}
          />
        </div>
      </div>
    </div>
  );
}
