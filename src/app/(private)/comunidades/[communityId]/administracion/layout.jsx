import {
  getCommunityById,
  getCommunityMembershipStatus,
  getCommunityMembershipStatusServer,
} from "@/actions";
import ConfiguracionTabs from "@/components/comunidades/configuracion/ConfiguracionTabs/ConfiguracionTabs";
import { notFound } from "next/navigation";
import CreatorProvider from "../../../../../contexts/CreatorProvider";

export default async function CommunityConfiguracionLayout({
  children,
  params,
}) {
  const { communityId: id } = await params;
  let community = null;
  let membershipStatus = null;
  let name = null;
  try {
    // Get community data and user profile
    community = await getCommunityById(id);
    name = community.name;
    // Check membership status to protect the page
    membershipStatus = await getCommunityMembershipStatus(id);
    const isCreator =
      membershipStatus?.status === "creator" ||
      membershipStatus?.isAdmin === true;
    if (!isCreator) {
      notFound();
    }
  } catch (err) {
    notFound();
  }

  return (
    <div
      style={{
        maxWidth: "1625px",
        margin: "0 auto",
        padding: "0 16px",
        minHeight: "calc(100dvh - 130px)",
      }}
    >
      <ConfiguracionTabs
        communityName={name}
        communityLogo={community.avatarUrl}
        communityId={id}
      />
      <CreatorProvider creator={community.creator}>
        {children}
      </CreatorProvider>
    </div>
  );
}
