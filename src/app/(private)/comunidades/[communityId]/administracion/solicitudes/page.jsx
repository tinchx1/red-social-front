import { Suspense } from "react";
import CommunityRequestsClient from "@/components/comunidades/configuracion/solicitudes/CommunityRequestsClient/CommunityRequestsClient";
import UsersTableSkeleton from "@/components/comunidades/configuracion/CommunityUsersClient/UsersTableSkeleton";
import { serverApi } from "@/lib/api";

async function RequestsContent({ communityId }) {
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
    const response = await serverApi.get("/communities/requests/received", {
      params: {
        communityId,
        page: 1,
        limit: 10,
        status: "pending",
      },
    });

    const payload = response?.data || {};
    const dataBlocks = Array.isArray(payload.data) ? payload.data : [];
    const nestedRequests = dataBlocks.flatMap((block) => block?.requests || []);
    const directRequests = Array.isArray(payload.requests)
      ? payload.requests
      : [];
    const combined = [...nestedRequests, ...directRequests];

    const seen = new Set();
    const uniqueRequests = combined.filter((req) => {
      const key = req?.id;
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return req?.status === "pending";
    });

    initialData = {
      data: uniqueRequests,
      pagination: {
        page: payload?.pagination?.page || 1,
        limit: payload?.pagination?.limit || 10,
        total: payload?.pagination?.total || uniqueRequests.length || 0,
        pages: payload?.pagination?.pages || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching community requests:", error);
  }

  return (
    <CommunityRequestsClient
      communityId={communityId}
      initialData={initialData}
    />
  );
}

export default async function CommunityConfiguracionSolicitudesPage({
  params,
}) {
  const { communityId } = await params;

  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <RequestsContent communityId={communityId} />
    </Suspense>
  );
}
