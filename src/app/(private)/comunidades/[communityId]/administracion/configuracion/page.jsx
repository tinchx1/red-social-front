import {
  getCommunityById,
  getCommunityMembershipStatusServer,
} from "@/actions";
import { notFound } from "next/navigation";
import CommunityConfiguracion from "@/components/comunidades/configuracion/CommunityConfiguracion/CommunityConfiguracion";

export default async function CommunityConfiguracionConfiguracionPage({
  params,
}) {
  const { communityId: id } = await params;
  let community = null;
  let membershipStatus = null;
  let isOwner = false;
  try {
    community = await getCommunityById(id);
    membershipStatus = await getCommunityMembershipStatusServer(id);
    isOwner = membershipStatus?.status === "creator";
    const isAdmin = membershipStatus?.isAdmin === true;
    if (!isOwner && !isAdmin) {
      notFound();
    }
  } catch (err) {
    console.error("Error loading community:", err);
    notFound();
  }

  return <CommunityConfiguracion community={community} isOwner={isOwner} />;
}
