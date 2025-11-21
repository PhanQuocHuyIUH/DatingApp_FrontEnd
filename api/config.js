import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API URL từ environment variable (dễ chuyển đổi khi build)
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.7:3000/api';
console.log('📡 API URL:', API_URL);

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