import api from '../api/config';

// Simple EventEmitter implementation for React Native
class SimpleEventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    off(event, handler) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(data));
    }
}

const eventEmitter = new SimpleEventEmitter();

export const discoveryService = {
    // Active filters state
    activeFilters: {},

    // Event emitter methods
    on: (event, handler) => eventEmitter.on(event, handler),
    off: (event, handler) => eventEmitter.off(event, handler),
    emit: (event, data) => eventEmitter.emit(event, data),

    /**
     * Get profiles to swipe.
     * @param {number} limit - The number of profiles to fetch.
     * @param {Object} filters - Optional filters to apply
     * @returns {Promise<Object>} The API response data.
     */
    getProfiles: async (limit = 10, filters = null) => {
        try {
            // Use provided filters or active filters
            const activeFilters = filters || discoveryService.activeFilters || {};
            const hasFilters = Object.keys(activeFilters).length > 0;

            if (hasFilters) {
                // Use filter endpoint when filters are active
                const params = { ...activeFilters, limit };
                const response = await api.get('/discovery/filter', { params });
                return response.data;
            } else {
                // Use regular profiles endpoint when no filters
                const response = await api.get('/discovery/profiles', {
                    params: { limit }
                });
                return response.data;
            }
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

    /**
     * Get profiles I have superliked only.
     * GET /discovery/getSuperLiked
     */
    getSuperLiked: async (limit = 50) => {
        try {
            const response = await api.get('/discovery/getSuperLiked', { params: { limit } });
            return response.data; // { success, count, data: { profiles } }
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Filter profiles with custom parameters.
     * GET /discovery/filter
     * @param {Object} filters - Filter parameters
     * @param {number} filters.ageMin - Minimum age
     * @param {number} filters.ageMax - Maximum age
     * @param {string} filters.gender - Gender filter (male|female|nonbinary)
     * @param {number} filters.distance - Max distance in km
     * @param {string} filters.languages - Comma-separated languages
     * @param {number} filters.limit - Results per page
     * @param {number} filters.page - Page number
     */
    filterProfiles: async (filters = {}) => {
        try {
            // Save active filters
            discoveryService.activeFilters = filters;

            const response = await api.get('/discovery/filter', { params: filters });

            // Emit event to notify index screen
            discoveryService.emit('filtersApplied', filters);

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    clearFilters: () => {
        discoveryService.activeFilters = {};
        discoveryService.emit('filtersCleared');
    },
};
