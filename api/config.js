import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thay đổi URL này theo địa chỉ backend của bạn
const API_URL = 'http://192.168.100.4:3000/api'; // Hoặc IP máy của bạn: http://192.168.1.x:5000/api

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn, xóa token và chuyển về màn hình login
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;