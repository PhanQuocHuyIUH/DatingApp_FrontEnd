import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userService = {
    /**
     * Get the public profile of any user by their ID.
     * @param {string} userId - The ID of the user to fetch.
     * @returns {Promise<Object>} The API response data.
     */
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Get the full profile of the currently authenticated user.
     * @returns {Promise<Object>} The API response data.
     */
    getMyProfile: async () => {
        try {
            const response = await api.get('/users/me');
            // Keep the local user data in sync
            if (response.data.success) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Update the profile of the currently authenticated user.
     * @param {Object} profileData - An object containing fields to update (e.g., name, bio, interests).
     * @returns {Promise<Object>} The API response data.
     */
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/me', profileData);
            // Update the stored user with the latest profile data
            if (response.data.success) {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const updatedUser = { ...user, ...response.data.data.user };
                    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Upload a profile photo for the current user.
     * @param {Object} photo - The photo file object from an image picker (e.g., { uri, name, type }).
     * @returns {Promise<Object>} The API response data.
     */

    uploadPhoto: async (photo) => {
        try {
            const formData = new FormData();
            formData.append('photo', {
                uri: photo.uri,
                name: photo.name || 'photo.jpg',
                type: photo.type || 'image/jpeg',
            });

            const response = await api.post('/users/me/photos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
                transformRequest: (data) => data, // 👈 Không cho Axios stringify FormData
            });

            return response.data;
        } catch (error) {
            console.log('Upload error:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Network error' };
        }
    },



    /**
     * Delete a specific photo from the user's profile.
     * @param {string} photoId - The ID of the photo to delete.
     * @returns {Promise<Object>} The API response data.
     */
    deletePhoto: async (photoId) => {
        try {
            const response = await api.delete(`/users/me/photos/${photoId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Set a specific photo as the user's main profile picture.
     * @param {string} photoId - The ID of the photo to set as main.
     * @returns {Promise<Object>} The API response data.
     */
    setMainPhoto: async (photoId) => {
        try {
            const response = await api.put(`/users/me/photos/${photoId}/main`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    /**
     * Update the user's geographical location.
     * @param {Object} locationData - An object with location details (city, state, country, coordinates).
     * @returns {Promise<Object>} The API response data.
     */
    updateLocation: async (locationData) => {
        try {
            const response = await api.put('/users/me/location', locationData);
            // Optionally update local user data if needed
            if (response.data.success) {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.location = response.data.data.location;
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                }
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },
};