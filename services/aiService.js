import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://datingapp-backend-0khx.onrender.com/api'; // Android emulator
// const API_URL = 'http://localhost:5000/api'; // iOS simulator

class AIService {
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Get AI chat suggestions based on conversation
   */
  async getChatSuggestions(conversationId, limit = 15) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/ai/suggestions/${conversationId}?limit=${limit}`,
        headers
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get chat suggestions error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get ice breaker suggestions for new match
   */
  async getIceBreakerSuggestions(matchId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/ai/ice-breakers/${matchId}`,
        headers
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get ice breaker error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get custom suggestion with user prompt
   */
  async getCustomSuggestion(conversationId, userPrompt) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/ai/custom-suggestion`,
        { conversationId, userPrompt },
        headers
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get custom suggestion error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const aiService = new AIService();
