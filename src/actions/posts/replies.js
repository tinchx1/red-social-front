"use server"
import { serverApi } from '@/lib/api';
import { preserveError } from '@/utils/preserveError';

export async function getCommentReplies(commentId, page = 1, limit = 10) {
  try {
    const response = await serverApi.get(`/comments/${commentId}/replies`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error obteniendo respuestas del comentario');
  }
}

export async function createCommentReply(commentId, content) {
  try {
    const response = await serverApi.post(`/comments/${commentId}/replies`, {
      content
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      '';
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

    // Si no es miembro o la comunidad está eliminada, lanzamos error con redirectTo
    if (isNotMember) {
      const redirectError = new Error(JSON.stringify({
        message: 'User is not a member of this community',
        redirectTo: '/inicio'
      }));
      throw redirectError;
    }

    if (isCommunityDeleted) {
      const redirectError = new Error(JSON.stringify({
        message: 'Community has been deleted',
        redirectTo: '/comunidades'
      }));
      throw redirectError;
    }

    throw preserveError(error, 'Error creando respuesta al comentario');
  }
}

export async function addReplyReaction(replyId, reactionType = 'like') {
  try {
    const response = await serverApi.put(`/replies/${replyId}/reactions`, {
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

    // Si no es miembro o la comunidad está eliminada, lanzamos error con redirectTo
    if (isNotMember) {
      const redirectError = new Error(JSON.stringify({
        message: 'User is not a member of this community',
        redirectTo: '/inicio'
      }));
      throw redirectError;
    }

    if (isCommunityDeleted) {
      const redirectError = new Error(JSON.stringify({
        message: 'Community has been deleted',
        redirectTo: '/comunidades'
      }));
      throw redirectError;
    }

    throw preserveError(error, 'Error agregando reacción a la respuesta');
  }
}

export async function removeReplyReaction(replyId) {
  try {
    const response = await serverApi.delete(`/replies/${replyId}/reactions`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      '';
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

    // Si no es miembro o la comunidad está eliminada, lanzamos error con redirectTo
    if (isNotMember) {
      const redirectError = new Error(JSON.stringify({
        message: 'User is not a member of this community',
        redirectTo: '/inicio'
      }));
      throw redirectError;
    }

    if (isCommunityDeleted) {
      const redirectError = new Error(JSON.stringify({
        message: 'Community has been deleted',
        redirectTo: '/comunidades'
      }));
      throw redirectError;
    }

    throw preserveError(error, 'Error removiendo reacción de la respuesta');
  }
}

export async function updateReply(replyId, data) {
  try {
    const response = await serverApi.put(`/replies/${replyId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error actualizando respuesta');
  }
}

export async function deleteReply(replyId) {
  try {
    const response = await serverApi.delete(`/replies/${replyId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error eliminando respuesta');
  }
}
