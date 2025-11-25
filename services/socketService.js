import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

// Derive base URL (remove trailing /api if present)
const API_BASE = api?.defaults?.baseURL?.replace(/\/api$/, '') || 'http://localhost:3000';

let socket = null;
let typingTimeouts = {};

export const socketService = {
  init: async () => {
    if (socket && socket.connected) {
      console.log('✅ Socket already connected');
      return socket;
    }
    const token = await AsyncStorage.getItem('token');
    console.log('🔐 Initializing socket with token:', token ? 'exists' : 'missing');
    console.log('🌐 Socket URL:', API_BASE);

    socket = io(API_BASE, {
      transports: ['websocket'],
      auth: { token },
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 800,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully, ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        reject(err);
      });
    });
  },
  get: () => socket,
  joinConversation: (conversationId) => {
    console.log('🚪 Emitting join_conversation:', conversationId);
    socket?.emit('join_conversation', conversationId);
  },
  leaveConversation: (conversationId) => {
    console.log('👋 Emitting leave_conversation:', conversationId);
    socket?.emit('leave_conversation', conversationId);
  },
  onNewMessage: (handler) => {
    socket?.off('new_message');
    socket?.on('new_message', (payload) => {
      console.log('📩 Received new_message:', payload);
      handler(payload);
    });
  },
  onTyping: (handler) => {
    socket?.off('user_typing');
    socket?.on('user_typing', handler);
  },
  onReadReceipt: (handler) => {
    socket?.off('message_read_receipt');
    socket?.on('message_read_receipt', handler);
  },
  emitTyping: ({ conversationId, receiverId, isTyping }) => {
    socket?.emit(isTyping ? 'typing_start' : 'typing_stop', { conversationId, receiverId });
  },
  emitRead: ({ messageId, conversationId, senderId } = {}) => {
    if (messageId) {
      socket?.emit('message_read', { messageId, conversationId, senderId });
    } else if (conversationId) {
      // Mark entire conversation as read
      socket?.emit('conversation_read', { conversationId });
    }
  },
  debounceTyping: ({ conversationId, receiverId }) => {
    // Start typing
    socketService.emitTyping({ conversationId, receiverId, isTyping: true });
    if (typingTimeouts[conversationId]) clearTimeout(typingTimeouts[conversationId]);
    typingTimeouts[conversationId] = setTimeout(() => {
      socketService.emitTyping({ conversationId, receiverId, isTyping: false });
    }, 1500);
  },
  stopTyping: ({ conversationId, receiverId }) => {
    // Clear timeout and emit stop immediately
    if (typingTimeouts[conversationId]) {
      clearTimeout(typingTimeouts[conversationId]);
      delete typingTimeouts[conversationId];
    }
    socketService.emitTyping({ conversationId, receiverId, isTyping: false });
  }
};
