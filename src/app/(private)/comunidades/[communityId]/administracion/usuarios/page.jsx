import { Suspense } from "react";
import { getCommunityMembers } from "@/actions/community/communities";
import CommunityUsersClient from "@/components/comunidades/configuracion/CommunityUsersClient/CommunityUsersClient";
import UsersTableSkeleton from "@/components/comunidades/configuracion/CommunityUsersClient/UsersTableSkeleton";

async function UsersContent({ communityId }) {
  let initialData = {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  };

  try {
    initialData = await getCommunityMembers(communityId, {
      page: 1,
      limit: 10,
    });
  } catch (error) {
    console.error("Error fetching community members:", error);
    // Continue with empty data
  }
  return (
    <CommunityUsersClient communityId={communityId} initialData={initialData} />
  );
}

export default async function CommunityConfiguracionUsuariosPage({ params }) {
  const { communityId } = await params;

  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersContent communityId={communityId} />
    </Suspense>
  );
}
