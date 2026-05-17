import { getCommunityAdmins } from "@/actions/community/communities";
import CommunityAdminsClient from "../../../../../../components/comunidades/configuracion/CommunityAdminsClient/CommunityAdminsClient";

export default async function CommunityConfiguracionAdministradoresPage({
  params,
}) {
  const { communityId } = await params;

  let initialData = [];

  try {
    const response = await getCommunityAdmins(communityId);
    initialData = response?.data || [];
  } catch (error) {
    console.error("Error fetching community admins:", error);
    // Continue with empty data
  }
  return (
    <CommunityAdminsClient
      communityId={communityId}
      initialData={initialData}
    />
  );
}
