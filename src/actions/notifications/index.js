"use server"
import { chatApi } from "../chat";

/**
 * Get notifications list
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @returns {Promise<{ data: any[], pagination: { page: number, limit: number, total: number, pages: number } }>}
 */
export const getNotifications = async ({ userId, page = 1, limit = 20 }) => {
    try {
        const res = await chatApi.get('/notifications', {
            params: { userId, page, limit }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/** Mark a notification as read */
export const markNotificationRead = async (notificationId, userId) => {
    try {
        // Matches: /api/chat-notification/v1/notifications/:id/read?userId={{user_id}}
        const res = await chatApi.put(`/notifications/${notificationId}/read`, null, {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/** Delete a notification */
export const deleteNotification = async (notificationId, userId) => {
    try {
        // Matches: api/chat-notification/v1/notifications/{{notification_id}}?userId={{user_id}}
        const res = await chatApi.delete(`/notifications/${notificationId}`, {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/**
 * Get notification preferences
 * @param {Object} params
 * @param {string} params.userId
 * @returns {Promise<any>}
 */
export const getNotificationPreferences = async ({ userId }) => {
    try {
        const res = await chatApi.get(`/notifications/preferences?userId=${userId}`);
        // Map API preferences to component format (coerce to strict booleans)
        const apiPreferences = res.data.preferences || {};
        return {
            newComment: Boolean(apiPreferences.post_comment),
            newMessages: Boolean(apiPreferences.message_new || apiPreferences.message_unread),
            newLike: Boolean(apiPreferences.post_like),
            newSharedContent: Boolean(apiPreferences.post_share),
            // adPaymentStatus: Boolean(apiPreferences.contact_accepted), // No existe en API
            adPublication: Boolean(apiPreferences.community_join),
            newTagMention: Boolean(apiPreferences.community_invite),
            newContactRequest: Boolean(apiPreferences.contact_request),
        };
    } catch (error) {
        throw error.response?.data || error;
    }
}

/**
 * Update notification preferences
 * @param {Object} params
 * @param {string} params.userId
 * @param {Object} params.preferences
 * @returns {Promise<any>}
 */
export const updateNotificationPreferences = async ({ userId, preferences }) => {
    try {
        // Map component preferences back to API format
        // Only send keys validated by backend and ensure values are booleans
        const apiPreferences = {
            post_like: Boolean(preferences.newLike),
            post_comment: Boolean(preferences.newComment),
            post_share: Boolean(preferences.newSharedContent),
            message_new: Boolean(preferences.newMessages),
            message_unread: Boolean(preferences.newMessages),
            // ad_payment_status: Boolean(preferences.adPaymentStatus), // No existe en API
            contact_request: Boolean(preferences.newContactRequest),
            community_invite: Boolean(preferences.newTagMention),
            community_join: Boolean(preferences.adPublication),
        };

        const res = await chatApi.put(`/notifications/preferences`, {
            preferences: apiPreferences
        }, {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/** Delete all notifications for a user */
export const deleteAllNotifications = async (userId) => {
    try {
        const res = await chatApi.delete('/notifications', {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/** Mark all notifications as read for a user */
export const markAllNotificationsRead = async (userId) => {
    try {
        const res = await chatApi.put('/notifications/read-all', null, {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

/**
 * Get community notification preferences
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.communityId
 * @returns {Promise<any>}
 */
export const getCommunityNotificationPreferences = async ({ userId, communityId }) => {
    try {
        const res = await chatApi.get('/notifications/community-preferences', {
            params: { userId, communityId }
        });
        // Map API preferences to component format (coerce to strict booleans)
        const apiPreferences = res.data.preferences || {};
        return {
            newPublications: Boolean(apiPreferences.community_post_new),
            newComments: Boolean(apiPreferences.community_post_comment),
            newLikes: Boolean(apiPreferences.community_post_like),
            newTag: Boolean(apiPreferences.community_post_tag),
            newSharedContent: Boolean(apiPreferences.community_post_share),
            newMember: Boolean(apiPreferences.community_member_join),
        };
    } catch (error) {
        throw error.response?.data || error;
    }
}

/**
 * Update community notification preferences
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.communityId
 * @param {Object} params.preferences
 * @returns {Promise<any>}
 */
export const updateCommunityNotificationPreferences = async ({ userId, communityId, preferences }) => {
    try {
        // Map component preferences back to API format
        const apiPreferences = {
            community_post_new: Boolean(preferences.newPublications),
            community_post_comment: Boolean(preferences.newComments),
            community_post_like: Boolean(preferences.newLikes),
            community_post_tag: Boolean(preferences.newTag),
            community_post_share: Boolean(preferences.newSharedContent),
            community_member_join: Boolean(preferences.newMember),
        };

        const res = await chatApi.put('/notifications/community-preferences', {
            preferences: apiPreferences
        }, {
            params: { userId, communityId }
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}