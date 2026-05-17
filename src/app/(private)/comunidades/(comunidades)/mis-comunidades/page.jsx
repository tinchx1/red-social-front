import { Suspense } from "react";
import { getMyCommunities } from "@/actions";
import { CardComunnity } from "@/components/comunidades/connections/cardComunnity/CardCommunity";
import { CommunityEmpty } from "@/components/comunidades/connections/communityEmpty/CommunityEmpty";
import { ResponsiveDropdown } from "@/components/comunidades/connections/ResposiveDropdown/ResposiveDropdown";
import styles from "@/styles/pages/comunidad/mis-comunidades.module.scss";
import { PageSkeleton } from "@/components/ui";

async function MyCommunitiesContent({ searchParams }) {
  const { data } = await getMyCommunities();
  const communitiesMember = data.filter(
    (el) =>
      (el.role === "member" || el.role === "admin" || el.role === "moderator") && el.status === "approved"
  );

  if (communitiesMember.length === 0) {
    return <CommunityEmpty />;
  }

  return (
    <div className={styles.container}>
      {/* Vista Desktop */}
      <div className={styles.desktopView}>
        <div className={styles.containerCards}>
          <div className={styles.title}>
            <p>Participando</p>
          </div>
          {communitiesMember.length > 0 ? (
            communitiesMember.map((el, index) => (
              <CardComunnity
                id={el.community.id}
                title={el.community.name}
                members={el.community.membersCount}
                description={el.community.bio}
                photoProfile={el.community.avatarUrl}
                url={`/comunidades/${el.community.id}`}
                variant={
                  el.role === "admin" ? "community-admin" : "community-member"
                }
                key={index}
              />
            ))
          ) : (
            <CommunityEmpty title={"No participas en ninguna comunidad"} />
          )}
        </div>
      </div>

      {/* Vista Mobile */}
      <ResponsiveDropdown
        type="community"
        title="Participando"
        communities={communitiesMember}
        count={communitiesMember.length}
        variant="community-member"
      />
    </div>
  );
}

export default function MyCommunities({ searchParams }) {
  return (
    <Suspense fallback={<PageSkeleton variant="communities" />}>
      <MyCommunitiesContent searchParams={searchParams} />
    </Suspense>
  );
}
