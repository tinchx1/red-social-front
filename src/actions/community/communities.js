"use server";
import api, { serverApi } from "/src/lib/api";

//Create community
export async function CreateCommunities(submitData) {
  try {
    const response = await serverApi.post("/communities", submitData);
    return response.data;
  } catch (error) {
    console.log(error);

    throw new Error(error.response?.data?.message || "Error al crear comunidad");
  }
}

export async function getAllCommunities(searchParam = "", page = 1, limit = 10) {
  try {

    const response = await serverApi.get(`/communities/search`, {
      params: {
        q: searchParam,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo comunidades");
  }
}

//Endpoint de mis comunidades(creadas y unidas)
export async function getMyCommunities() {
  try {
    const response = await serverApi.get("/communities/my-memberships");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo mis comunidades");
  }
}

//Abandonar una comunidad unida
export async function quitCommunity(id) {
  try {
    const response = await serverApi.delete(`/communities/${id}/members/me`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al abandonar la comunidades");
  }
}

//Endpoint invitaciones recibidas a mi comunidad (administrativo)
export async function getRequestInvitesOfMyCommunity() {
  try {
    const response = await serverApi.get(`/communities/requests/received`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo invitaciones a mis comunidades"
    );
  }
}

//Endpoint invitaciones enviadas para que se unan a mi comunidad(administrativo)
export async function getSendInvitesOfMyCommunity() {
  try {
    const response = await serverApi.get("/communities/invitations/sent");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Endpoint invitaciones recibidas para unirme a una comunidad(user)
export async function getReceiptInvitesOfSommeCommunity() {
  try {
    const response = await serverApi.get("/communities/invitations/pending");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Endpoint invitaciones enviadas para unirme a una comunidad(user)
export async function getSendInvitesOfSommeCommunity() {
  try {
    const response = await serverApi.get(`/communities/requests/sent`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Endpoint para aceptar o rechazar ingreso de una persona a mi comunidad(administrador)
export async function acceptOrRefuseInvite(action, id) {
  try {
    const response = await serverApi.put(`/communities/requests/${id}`, {
      status: action,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Cancelar invitacion a una comunidad(admin)
export async function cancelInvitationSendToMyCommunity(invitationId) {
  try {
    const response = await serverApi.delete(`/communities/invitations/${invitationId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}
export async function cancelInvitationSendFromMyCommunity(invitationId) {
  try {
    const response = await serverApi.delete(`/communities/invitations/${invitationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Cancelar invitacion a una comunidad(user)
export async function cancelInvitationsendToSomeCommunity(invitationId) {
  try {
    const response = await serverApi.delete(`/communities/requests/${invitationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo invitaciones");
  }
}

//Endpoint stats
export async function getStatsUserCommunity() {
  try {
    const response = await serverApi.get("/profile/me/stats");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo comunidad");
  }
}

export async function updateCommunity(id, data) {
  try {
    const response = await serverApi.patch(`/communities/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error actualizando comunidad");
  }
}

export async function deleteCommunity(id) {
  try {
    const response = await serverApi.delete(`/communities/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error eliminando comunidad");
  }
}

// Community admin posts management
export async function getCommunityAdminPosts(communityId, params = {}) {
  try {
    const { page = 1, limit = 10, status, dateFrom, dateTo, search, email } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) queryParams.append('status', status);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    if (search) queryParams.append('search', search);
    if (email) queryParams.append('email', email);

    // Use /posts/search endpoint which handles all filters including dates
    const response = await serverApi.get(`/communities/admin/${communityId}/posts/search?${queryParams}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error obteniendo posts de la comunidad');
  }
}

export async function updateCommunityPostApproval(communityId, postId, payload) {
  try {
    if (!postId) throw new Error('postId is required');
    if (!payload || !payload.status) throw new Error('payload.status is required');
    const response = await serverApi.patch(`/communities/admin/${communityId}/posts/${postId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error actualizando estado del post');
  }
}

// Membership status (client-safe; needed in client components)
/**
 * Get current user's membership status for a community
 * @param {string} communityId
 */
export async function getCommunityMembershipStatus(communityId) {
  try {
    const response = await api.get(`/communities/${communityId}/membership-status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo estado de membresía");
  }
}

/**
 * Server-side: get membership status (uses serverApi)
 * @param {string} communityId
 */
export async function getCommunityMembershipStatusServer(communityId) {
  try {
    const response = await serverApi.get(`/communities/${communityId}/membership-status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo estado de membresía");
  }
}
/**
 * Request membership to a community
 * @param {string} communityId
 */
export async function requestCommunityMembership(communityId) {
  try {
    const response = await api.post(`/communities/${communityId}/request`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error solicitando unirse a la comunidad");
  }
}

/**
 * Leave current community membership
 * @param {string} communityId
 */
export async function leaveCommunity(communityId) {
  try {
    const response = await api.delete(`/communities/${communityId}/members/me`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al abandonar la comunidad");
  }
}

// Client-safe: search users to invite to a community
/**
 * Search users for community invitations
 * @param {string} communityId
 * @param {string} query
 * @param {number} page
 * @param {number} limit
 */
export async function searchCommunityUsers(communityId, query = "", page = 1, limit = 5) {
  try {
    const response = await api.get(`/communities/${communityId}/search-users`, {
      params: { search: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error buscando usuarios para la comunidad");
  }
}

/**
 * Invite a user to a community
 * @param {string} communityId
 * @param {string} userId
 */
export async function inviteUserToCommunity(communityId, userId) {
  try {
    console.log(communityId, userId);
    const response = await api.post(`/communities/${communityId}/invite/${userId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(error.response?.data?.message || "Error enviando invitación a la comunidad");
  }
}

export async function getCommunityById(id) {
  try {
    const response = await serverApi.get(`/communities/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo comunidad");
  }
}

/**
 * Get community members (server-side)
 * @param {string} communityId
 * @param {object} params - Query parameters (page, limit, role, industry, search, status)
 */
export async function getCommunityMembers(communityId, params = {}) {
  try {
    const { page = 1, limit = 10, role, industry, search, status } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status: String(status) }),
      ...(role && { role }),
      ...(industry && { industry }),
      ...(search && { search }),
    });

    const response = await serverApi.get(
      `/communities/admin/${communityId}/members/search?${queryParams}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo miembros de la comunidad"
    );
  }
}

//Accept invitation for user (usuario tab recibidas)
export async function acceptInvitation(invitationId) {
  try {
    const response = await serverApi.put(`/communities/invitations/${invitationId}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error aceptando invitación");
  }
}

//Reject invitation for user (usuario tab recibidas)
export async function rejectInvitation(invitationId) {
  try {
    const response = await serverApi.delete(`/communities/invitations/${invitationId}/reject`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error rechazando invitación");
  }
}

/**
 * Get community administrators (server-side)
 * @param {string} communityId
 */
export async function getCommunityAdmins(communityId) {
  try {
    const response = await serverApi.get(`/communities/${communityId}/admins`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo administradores de la comunidad"
    );
  }
}

/**
 * Change admin role (client-side)
 * @param {string} communityId
 * @param {string} userId
 * @param {string} role - "admin" or "member"
 */
export async function changeAdminRole(communityId, userId, role) {
  try {
    const response = await api.patch(`/communities/${communityId}/admins/${userId}`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error cambiando rol del administrador"
    );
  }
}
/**
 * Upload and import users in bulk to a community
 * @param {string} communityId
 * @param {File} file - CSV file with user data
 * @returns {{success: boolean, data?: object, message?: string}}
 */
export async function bulkImportCommunityUsers(communityId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await serverApi.post(
      `/communities/${communityId}/bulk-import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error importando usuarios a la comunidad",
    };
  }
}