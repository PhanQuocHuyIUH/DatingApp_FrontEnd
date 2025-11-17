import api from '../api/config';

export const discoveryService = {
    /**
     * Get profiles to swipe.
     * @param {number} limit - The number of profiles to fetch.
     * @returns {Promise<Object>} The API response data.
     */
    getProfiles: async (limit = 10) => {
        try {
            const response = await api.get('/discovery/profiles', { params: { limit } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Swipe left, right, or superlike on a profile.
     * @param {string} targetUserId - The ID of the user being swiped on.
     * @param {string} action - The swipe action ('like', 'pass', 'superlike').
     * @returns {Promise<Object>} The API response data, including match information if a match occurs.
     */
    swipe: async (targetUserId, action) => {
        try {
            const response = await api.post('/discovery/swipe', { targetUserId, action });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get a list of users who have liked the current user.
     * @returns {Promise<Object>} The API response data.
     */
    getLikes: async () => {
        try {
            const response = await api.get('/discovery/likes');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get the current user's swipe history.
     * @param {string} action - Optional filter to get swipes of a specific type ('like', 'pass', 'superlike').
     * @returns {Promise<Object>} The API response data.
     */
    getSwipeHistory: async (action) => {
        try {
            const params = action ? { action } : {};
            const response = await api.get('/discovery/swipe-history', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },
    /**
     * Get profiles I have liked (including superlikes), not necessarily matched.
     * GET /discovery/getLikeSwiped
     */
    getLikedSwiped: async (limit = 50) => {
        try {
            const response = await api.get('/discovery/getLikeSwiped', { params: { limit } });
            return response.data; // { success, count, data: { profiles } }
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

};
