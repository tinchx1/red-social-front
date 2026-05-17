import React from "react";
import { getCommunityAdminPosts } from "@/actions";
import CommunityPublicacionesClient from "@/components/comunidades/configuracion/publicaciones/CommunityPublicacionesClient/CommunityPublicacionesClient";
import PostsTableSkeleton from "@/components/comunidades/configuracion/publicaciones/PostsTableSkeleton/PostsTableSkeleton";
import { Suspense } from "react";

export default async function CommunityConfiguracionPublicacionesPage({
  params,
}) {
  const { communityId } = await params;

  let initialData = null;
  let error = null;

  try {
    initialData = await getCommunityAdminPosts(communityId, {
      page: 1,
      limit: 10,
    });
  } catch (err) {
    console.error("Error fetching initial posts:", err);
    error = err;
  }

  return (
    <Suspense fallback={<PostsTableSkeleton />}>
      <CommunityPublicacionesClient
        communityId={communityId}
        initialData={initialData}
      />
    </Suspense>
  );
}
