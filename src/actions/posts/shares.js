"use server"
import { serverApi } from '@/lib/api';
import { preserveError } from '@/utils/preserveError';


export async function updateSharedPost(shareId, shareData) {
  try {
    const response = await serverApi.patch(`/shares/${shareId}`, shareData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error actualizando post compartido');
  }
}

export async function sharePost(postId, shareData) {
  try {
    const response = await serverApi.post(`/posts/${postId}/share`, shareData);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      '';
    const isBlocked =
      status === 400 &&
      message.toLowerCase().includes('blocked from this community');
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes('user is not a member of this community') ||
        lowerMsg.includes('not a member of this community') ||
        lowerMsg.includes('user is not a member'));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes('community deleted') ||
        lowerMsg.includes('comunidad eliminada') ||
        lowerMsg.includes('community has been deleted'));
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }

    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: '/inicio', reason: 'not-member' };
    }

    if (isCommunityDeleted) {
      return { redirectTo: '/comunidades', reason: 'community-deleted' };
    }

    throw preserveError(error, 'Error compartiendo post');
  }
}

export async function removeSharedPost(shareId) {
  try {
    const response = await serverApi.delete(`/shares/${shareId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error removiendo post compartido');
  }
}

export async function getSharedPostReactions(shareId) {
  try {
    const response = await serverApi.get(`/shares/${shareId}/reactions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error obteniendo reacciones del post compartido');
  }
}

export async function addSharedReaction(shareId, reactionType = 'like') {
  try {
    const response = await serverApi.put(`/shares/${shareId}/reactions`, {
      type: reactionType
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      '';
    const isBlocked =
      status === 400 &&
      message.toLowerCase().includes('blocked from this community');
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes('user is not a member of this community') ||
        lowerMsg.includes('not a member of this community') ||
        lowerMsg.includes('user is not a member'));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes('community deleted') ||
        lowerMsg.includes('comunidad eliminada') ||
        lowerMsg.includes('community has been deleted'));
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }

    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: '/inicio', reason: 'not-member' };
    }

    if (isCommunityDeleted) {
      return { redirectTo: '/comunidades', reason: 'community-deleted' };
    }

    throw preserveError(error, 'Error agregando reacción al post compartido');
  }
}

export async function removeSharedReaction(shareId) {
  try {
    const response = await serverApi.delete(`/shares/${shareId}/reactions`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      '';
    const isBlocked =
      status === 400 &&
      message.toLowerCase().includes('blocked from this community');
    const lowerMsg = message.toLowerCase();
    const isNotMember =
      (status === 400 || status === 500) &&
      (lowerMsg.includes('user is not a member of this community') ||
        lowerMsg.includes('not a member of this community') ||
        lowerMsg.includes('user is not a member'));
    const isCommunityDeleted =
      status === 400 &&
      (lowerMsg.includes('community deleted') ||
        lowerMsg.includes('comunidad eliminada') ||
        lowerMsg.includes('community has been deleted'));
    // Para bloqueados devolvemos un flag en lugar de lanzar error (Next oculta el mensaje en prod)
    if (isBlocked) {
      return { blocked: true };
    }

    // Si no es miembro o la comunidad está eliminada, devolvemos redirect sin lanzar
    if (isNotMember) {
      return { redirectTo: '/inicio', reason: 'not-member' };
    }

    if (isCommunityDeleted) {
      return { redirectTo: '/comunidades', reason: 'community-deleted' };
    }

    throw preserveError(error, 'Error removiendo reacción del post compartido');
  }
}
