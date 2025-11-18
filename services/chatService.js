import api from '../api/config';

export const chatService = {
    /**
     * Create conversation for a match
     * POST /chats/conversation  { matchId }
     */
    createConversation: async (matchId) => {
        try {
            const res = await api.post('/chats/conversation', { matchId });
            return res.data; // { success, data: { conversation } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get all conversations for current user
     * GET /chats
     */
    getConversations: async () => {
        try {
            const res = await api.get('/chats');
            return res.data; // { success, count, data: { conversations } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get messages in a conversation
     * GET /chats/:conversationId/messages?limit=50&before=<iso>
     */
    getMessages: async (conversationId, params = {}) => {
        try {
            const res = await api.get(`/chats/${conversationId}/messages`, { params });
            return res.data; // { success, count, data: { messages } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Send a message (by matchId)
     * POST /chats/:matchId/messages
     */
    sendMessage: async (matchId, payload) => {
        try {
            const res = await api.post(`/chats/${matchId}/messages`, payload);
            return res.data; // { success, data: { message } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Delete a message
     * DELETE /chats/messages/:messageId
     */
    deleteMessage: async (messageId) => {
        try {
            const res = await api.delete(`/chats/messages/${messageId}`);
            return res.data; // { success, message }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },
};
