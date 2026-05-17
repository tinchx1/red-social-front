"use server"
import { serverApi } from '@/lib/api';
import { preserveError } from '@/utils/preserveError';

export async function addCommentReaction(commentId, reactionType = 'like') {
  try {
    const response = await serverApi.put(`/comments/${commentId}/reactions`, {
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

    throw preserveError(error, 'Error agregando reacción al comentario');
  }
}

export async function removeCommentReaction(commentId) {
  try {
    const response = await serverApi.delete(`/comments/${commentId}/reactions`);
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

    throw preserveError(error, 'Error removiendo reacción del comentario');
  }
}

export async function updateComment(commentId, data) {
  try {
    const response = await serverApi.patch(`/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    throw preserveError(error, 'Error actualizando el comentario');
  }
}

export async function deleteComment(commentId) {
  try {
    const response = await serverApi.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw preserveError(error, 'Error eliminando el comentario');
  }
}