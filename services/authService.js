import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    // Đăng ký
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                // Lưu token và user info
                await AsyncStorage.setItem('token', response.data.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    // Đăng nhập
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                await AsyncStorage.setItem('token', response.data.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            // Chuyển thành Error instance để handle đúng
            const message = error.response?.data?.message || error.message || 'Network error';
            throw new Error(message);
        }
    },


    // Đăng xuất
    logout: async () => {
        try {
            await api.post('/auth/logout');
            // Xóa token và user info
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            // Vẫn xóa local data dù API fail
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            throw error.response?.data || { message: 'Network error' };
        }
    },

    // Lấy thông tin user hiện tại
    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error' };
        }
    },

    // Kiểm tra đã đăng nhập chưa
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token;
    },

    // Lấy user từ storage
    getCurrentUser: async () => {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
};