"use server";
import { serverApi } from "@/lib/api";
import { preserveError } from "@/utils/preserveError";

// Función helper para verificar si es error de cuenta bloqueada
const isAccountBlockedError = (error) => {
  const message = error?.response?.data?.message;
  return (
    message === "Account has been suspended" ||
    message === "Account has been deleted"
  );
};

export async function createPost(postData) {
  try {
    const response = await serverApi.post("/posts", postData);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "";
    const isBlocked =
      status === 403 &&
      message.toLowerCase().includes("blocked from this community");
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes("user is not a member of this community") ||
        lowerMsg.includes("not a member of this community") ||
        lowerMsg.includes("user is not a member"));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes("community deleted") ||
        lowerMsg.includes("comunidad eliminada") ||
        lowerMsg.includes("community has been deleted"));
    const isRestrictedPosting =
      message ===
      "Only the creator, administrators, and moderators can post in this community.";
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }
    if (isRestrictedPosting) {
      return {
        success: false,
        message:
          "Solo el creador, administradores y moderadores pueden publicar en esta comunidad.",
      };
    }
    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: "/inicio", reason: "not-member" };
    }

    if (isCommunityDeleted) {
      return { redirectTo: "/comunidades", reason: "community-deleted" };
    }

    throw preserveError(error, "Error creando post");
  }
}

export async function getAllPosts(page = 1, limit = 10) {
  try {
    const response = await serverApi.get("/feed", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    // Si el usuario está suspendido, retornar datos vacíos en lugar de error
    if (isAccountBlockedError(error)) {
      console.log("User blocked, returning empty posts data");
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    }
    throw new Error(error.response?.data?.message || "Error obteniendo posts");
  }
}

export async function getCommunityPosts(communityId, page = 1, limit = 10) {
  try {
    const response = await serverApi.get(`/communities/${communityId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo posts de la comunidad",
    );
  }
}

export async function getPostById(id) {
  try {
    const response = await serverApi.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error obteniendo post");
  }
}

export async function updatePost(id, postData) {
  try {
    const response = await serverApi.patch(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error actualizando post");
  }
}

export async function deletePost(id) {
  try {
    const response = await serverApi.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error eliminando post");
  }
}

export async function getUserPosts(userId, page = 1, limit = 10) {
  try {
    const response = await serverApi.get(`/feed/${userId}`, {
      params: {
        page,
        limit,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo posts del usuario",
    );
  }
}

export async function addReaction(postId, reactionType = "like") {
  try {
    const response = await serverApi.put(`/posts/${postId}/reactions`, {
      type: reactionType,
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "";
    const isBlocked =
      status === 403 &&
      message.toLowerCase().includes("blocked from this community");
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes("user is not a member of this community") ||
        lowerMsg.includes("not a member of this community") ||
        lowerMsg.includes("user is not a member"));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes("community deleted") ||
        lowerMsg.includes("comunidad eliminada") ||
        lowerMsg.includes("community has been deleted"));
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }

    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: "/inicio", reason: "not-member" };
    }

    if (isCommunityDeleted) {
      return { redirectTo: "/comunidades", reason: "community-deleted" };
    }

    throw preserveError(error, "Error agregando reacción");
  }
}

export async function removeReaction(postId) {
  try {
    const response = await serverApi.delete(`/posts/${postId}/reactions`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "";
    const isBlocked =
      status === 403 &&
      message.toLowerCase().includes("blocked from this community");
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes("user is not a member of this community") ||
        lowerMsg.includes("not a member of this community") ||
        lowerMsg.includes("user is not a member"));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes("community deleted") ||
        lowerMsg.includes("comunidad eliminada") ||
        lowerMsg.includes("community has been deleted"));
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }

    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: "/inicio", reason: "not-member" };
    }

    if (isCommunityDeleted) {
      return { redirectTo: "/comunidades", reason: "community-deleted" };
    }

    throw preserveError(error, "Error removiendo reacción");
  }
}
