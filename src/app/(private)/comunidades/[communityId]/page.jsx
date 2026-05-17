import { CommunityInfo, VolverButton } from "@/components";
import {
  getCommunityById,
  getMyProfile,
  getCommunityPosts,
  getCommunityMembershipStatusServer,
} from "@/actions";
import styles from "@/styles/pages/Community.module.scss";
import Link from "next/link";
import SettingsIcon from "@/assets/settings.svg";
import { notFound } from "next/navigation";
import {
  EditarComunidad,
  AddParticipants,
  AboutCommunityEditable,
  CommunityMobileTabs,
} from "@/components/comunidades";
import CommunitySettings from "@/components/comunidades/CommunitySettings";
import { CommunityMembershipProvider } from "@/components/comunidades/connections/CommunityMembershipProvider";
import CommunityFeedWrapper from "@/components/comunidades/CommunityFeedWrapper";
import { CommunityPrivacyProvider } from "@/contexts/CommunityPrivacyContext";
import NotificationIcon from "@/assets/notification.svg";

export default async function CommunityDetailPage({ params }) {
  const { communityId: id } = await params;
  let community = null;
  let myProfile = null;
  let isOwner = false;
  let communityPosts = [];
  let pagination = null;
  let membershipStatus = null;
  try {
    community = await getCommunityById(id);
    myProfile = await getMyProfile();
    isOwner = myProfile?.id === community?.creator.id;
    membershipStatus = await getCommunityMembershipStatusServer(id);

    // Only fetch posts if user is a member, owner, or community is public
    const isPublicCommunity = community?.visibility === "public";
    const isMember = membershipStatus?.status === "approved" || membershipStatus?.status === "creator";

    if (isPublicCommunity || isMember || isOwner) {
      const postsResp = await getCommunityPosts(id, 1, 10);
      communityPosts = postsResp?.posts || postsResp?.data || [];
      pagination = postsResp?.pagination || null;
    }
  } catch (error) {
    notFound();
  }
  const isPublicCommunity = community?.visibility === "public";
  const canCreatePost = membershipStatus?.canPost
  return (
    <CommunityPrivacyProvider isPrivate={community?.visibility === "private"}>
      <CommunityMembershipProvider membershipStatus={membershipStatus}>
        <div
          className={
            styles.container +
            " " +
            styles.containerComunidad +
            " container-padding"
          }
        >
          <div className={styles.leftSidebar} style={{ width: "100%" }}>
            <div style={{ display: "flex", width: "100%", gap: "10px" }}>
              <VolverButton
                variant={"light-blue"}
                className={styles.volverButton}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {/* <div className={styles.hideTablet}>
                <UserProfile />
              </div> */}
                <EditarComunidad membershipStatus={membershipStatus} />
                <CommunitySettings
                  communityId={id}
                  isPrivate={community?.visibility === "private"}
                  isOwner={isOwner}
                  creator={community?.creator}
                />
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            {/* Community information section */}
            <CommunityInfo
              community={community}
              isOwner={isOwner}
              membershipStatus={membershipStatus}
            />

            <div className={styles.showMobile}>
              {(isOwner || membershipStatus?.status === "approved") && (
                <Link
                  href={`/comunidades/${id}/configuracion-notificaciones`}
                  className={styles.containerNotifications}
                >
                  <div>Gestiona tus notificaciones</div>
                  <NotificationIcon color="#0288C2" width={24} height={24} />
                </Link>
              )}
              {isOwner && (
                <Link
                  href={`/comunidades/${id}/administracion/configuracion`}
                  className={styles.containerNotifications}
                >
                  <div>Configuración</div>
                  <SettingsIcon width={22} height={22} />
                </Link>
              )}
              {/* {isOwner && (
              <PrivacyToggle
                communityId={id}
                isPrivate={community?.visibility === "private"}
                isOwner={isOwner}
              />
            )} */}
              <AboutCommunityEditable
                communityId={id}
                bio={community?.bio}
                isOwner={isOwner}
              />
            </div>

            {/* Mobile tabs for owners */}
            {isOwner && (
              <div className={styles.showMobile}>
                <CommunityMobileTabs
                  posts={communityPosts}
                  communityId={id}
                  hasMore={!!(pagination && pagination.pages > 1)}
                  isJoined={
                    membershipStatus?.status === "approved" ||
                    membershipStatus?.status === "creator"
                  }
                />
              </div>
            )}

            {/* Regular posts feed for non-owners */}
            {!isOwner && (
              <CommunityFeedWrapper
                posts={communityPosts}
                communityId={id}
                hasMore={!!(pagination && pagination.pages > 1)}
                isJoined={
                  membershipStatus?.status === "approved" ||
                  membershipStatus?.status === "creator"
                }
                isPublicCommunity={isPublicCommunity}
                isModerator={membershipStatus?.role === "moderator" || membershipStatus?.role === "admin" || membershipStatus?.role === "creator"}
                canCreatePost={canCreatePost}
                membershipStatus={membershipStatus}
                isInCommunityPage={true}
              />
            )}

            {/* Desktop posts feed for owners */}
            {isOwner && (
              <div className={styles.showDesktop}>
                <CommunityFeedWrapper
                  posts={communityPosts}
                  communityId={id}
                  hasMore={!!(pagination && pagination.pages > 1)}
                  isJoined={
                    membershipStatus?.status === "approved" ||
                    membershipStatus?.status === "creator"
                  }
                  canCreatePost={canCreatePost}
                  membershipStatus={membershipStatus}
                  isInCommunityPage={true}
                />
              </div>
            )}
          </div>

          <div className={styles.rightSidebar}>
            <div className={styles.showDesktop}>
              <AboutCommunityEditable
                communityId={id}
                bio={community?.bio}
                isOwner={isOwner}
              />
            </div>
            <div className={styles.showDesktop}>
              {isOwner && <AddParticipants communityId={id} />}
            </div>
          </div>
        </div>
      </CommunityMembershipProvider>
    </CommunityPrivacyProvider>
  );
}
