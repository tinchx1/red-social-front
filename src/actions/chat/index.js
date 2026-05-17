"use server"

import axios from "axios";

const api = axios.create({
    baseURL: process.env.MICROSERVICE_CHAT_NOTIFICATION_URL
});

// Interceptor para incluir el token en cada solicitud
api.interceptors.request.use(
    (config) => {
        const token = process.env.MICROSERVICE_CHAT_NOTIFICATION_API_KEY;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ ENDPOINTS ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

/**
 * Create a new chat
 * @param {string} user1Id - User ID
 * @param {string} user2Id - Other user ID
 * @param {boolean} [isWithAdmin = false] - Optional - the chat is with an admin
 * @param {boolean} [isAdminConsultant = false] - Optional - If the admin is a consultant
 * @returns {Promise<any>}
 */
export const createChat = async (user1Id, user2Id, isWithAdmin = false, isAdminConsultant = false) => {
    try {
        const res = await api.post("/chat/create", {
            user1: user1Id,
            user2: user2Id,
            isWithAdmin,
            isAdminConsultant
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Get user chat rooms
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<{ count: number, rows: any[], totalUnreadMessages: number }>}
 */
export const getChatRooms = async (page, pageSize, userId, role = "") => {
    try {
        const res = await api.get("/chat/get-rooms", {
            params: {
                page,
                pageSize,
                userId,
                role
            }
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Get an user chat room
 * @param {number} chatId - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<{ chat: any, totalUnreadMessages: number }>}
 */
export const getChatRoomById = async (chatId, userId) => {
    try {
        const res = await api.get("/chat/get-room-by-id", {
            params: {
                chatId,
                userId
            }
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Get chat files
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @param {number} chatId - chat ID
 * @returns {Promise<{ count: number, rows: any[] }>}
 */
export const getChatFiles = async (page, pageSize, chatId) => {
    try {
        const res = await api.get("/chat/get-files", {
            params: {
                page,
                pageSize,
                chatId
            }
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Get chat messages
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @param {number} chatId - chat ID
 * @returns {Promise<{ count: number, rows: any[] }>}
 */
export const getChatMessages = async (page, pageSize, chatId) => {
    try {
        const res = await api.get("/chat/get-messages", {
            params: {
                page,
                pageSize,
                chatId
            }
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Send a chat message to the server
 *
 * @param {Object} data - Message payload
 * @param {number} data.chatId - ID of the chat where the message is sent
 * @param {string} data.userId - ID of the user sending the message
 * @param {string} data.otherUserId - ID of the recipient user
 * @param {string} [data.message] - Optional text content of the message
 * @param {string} [data.file] - Optional file encoded in Base64
 * @param {string} [data.fileName] - Name of the attached file (without extension)
 * @param {number} [data.weightMb] - File size in MB
 * @param {number} [data.replyMsgId] - ID of the message being replied to (if any)
 * @returns {Promise<Object>} Response data from the API
 */
export const sendMessage = async (data) => {
    try {
        const res = await api.post("/chat/send-message", data);

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Update messages status
 * @param {number} chatId - Chat ID
 * @param {string} userId - User ID
 * @returns
 */
export const updateMessageStatus = async (chatId, userId) => {
    try {
        await api.put("/chat/update-message-status", {
            chatId,
            userId
        });

        return;
    } catch (error) {
        throw error.response.data;
    }
}

/**
 * Get the latest chat messege sent
 * @param {string} userId - User ID
 * @returns {Promise<{ chatId: string, role: string }>}
 */
export const getLatestChatMessageSent = async (userId) => {
    try {
        const res = await api.get("/chat/get-latest-chat-message-sent", {
            params: {
                userId
            }
        });

        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}
export { api as chatApi };