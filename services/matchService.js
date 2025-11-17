import api from '../api/config';

export const matchService = {
    /**
     * Get all matches for current user
     * GET /matches
     */
    getMatches: async () => {
        try {
            const res = await api.get('/matches');
            return res.data; // { success, count, data: { matches: [...] } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get a single match detail (optional)
     * GET /matches/:matchId
     */
    getMatchById: async (matchId) => {
        try {
            const res = await api.get(`/matches/${matchId}`);
            return res.data; // { success, data: { match: {...} } }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Unmatch a user
     * DELETE /matches/:matchId
     */
    unmatch: async (matchId) => {
        try {
            const res = await api.delete(`/matches/${matchId}`);
            return res.data; // { success, message }
        } catch (error) {
            throw error?.response?.data || { message: 'Network error' };
        }
    },
};
