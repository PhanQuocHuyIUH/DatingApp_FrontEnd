import {
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService } from "../../../services/chatService";
import { socketService } from "../../../services/socketService";
import { aiService } from "../../../services/aiService";

const { width } = Dimensions.get('window');

// --- Bảng màu Hiện đại (Modern Palette) ---
const COLORS = {
  primary: "#E94057", // Đỏ hồng hiện đại hơn
  primaryGradient: ['#E94057', '#F27121'] as const, // Gradient cam-hồng ấm áp
  secondary: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  offWhite: "#F9FAFB",
  border: "#E5E7EB",
  inputBackground: "#F3F4F6",
  myMessageText: "#FFFFFF",
  superLikeGradient: ['#4FACFE', '#00F2FE'] as const,
  purple: "#A855F7",
  blue: "#3B82F6",
  green: "#10B981",
};

type ChatMessage = {
  _id?: string;
  id?: string;
  sender?: any;
  receiver?: any;
  text?: string;
  type?: string;
  mediaUrl?: string;
  createdAt?: string;
};

type AISuggestion = {
  text: string;
  style: string;
  emoji?: string;
  basedOn?: string;
};

// --- Component Hiển thị ngày/giờ (Time Pill) ---
const DatePill = ({ dateString }: { dateString: string }) => (
  <View style={styles.datePillContainer}>
    <Text style={styles.datePillText}>{dateString}</Text>
  </View>
);

// --- Component Tin nhắn của tôi ---
const MyMessageBubble = ({ text, time, isSuper }: { text: string; time: string; isSuper?: boolean }) => (
  <View style={styles.myMessageWrapper}>
    <LinearGradient
      colors={isSuper ? COLORS.superLikeGradient : COLORS.primaryGradient}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.myMessageBubble}
    >
      <Text style={styles.myMessageText}>{text}</Text>
    </LinearGradient>
    <View style={styles.myMessageStatus}>
      <Text style={styles.messageTime}>{time}</Text>
      <Ionicons name="checkmark-done" size={14} color={COLORS.primary} style={{marginLeft: 4}} />
    </View>
  </View>
);

// --- Component Tin nhắn đối phương ---
const TheirMessageBubble = ({ text, time, avatar }: { text: string; time: string; avatar?: string }) => (
  <View style={styles.theirMessageWrapper}>
    {avatar ? (
      <Image source={{ uri: avatar }} style={styles.smallAvatar} />
    ) : (
      <View style={[styles.smallAvatar, { backgroundColor: '#DDD' }]} />
    )}
    <View>
      <View style={styles.theirMessageBubble}>
        <Text style={styles.theirMessageText}>{text}</Text>
      </View>
      <Text style={styles.messageTimeLeft}>{time}</Text>
    </View>
  </View>
);

// --- AI Suggestions Panel Component ---
const AISuggestionsPanel = ({ 
  suggestions, 
  onSelectSuggestion, 
  onRefresh, 
  loading, 
  isIceBreaker = false 
}: { 
  suggestions: AISuggestion[]; 
  onSelectSuggestion: (text: string) => void; 
  onRefresh: () => void; 
  loading: boolean; 
  isIceBreaker?: boolean;
}) => {
  const getStyleColor = (style: string) => {
    switch (style) {
      case 'friendly': return COLORS.green;
      case 'humorous':
      case 'playful': return COLORS.blue;
      case 'flirty':
      case 'charming': return COLORS.purple;
      default: return COLORS.primary;
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'friendly': return 'happy-outline';
      case 'humorous':
      case 'playful': return 'chatbubble-ellipses-outline';
      case 'flirty':
      case 'charming': return 'heart-outline';
      default: return 'chatbubbles-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.aiContainer}>
        <View style={styles.aiLoadingContainer}>
          <Text style={styles.aiLoadingText}>AI đang tạo gợi ý...</Text>
        </View>
      </View>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.aiContainer}>
      <View style={styles.aiHeader}>
        <View style={styles.aiHeaderLeft}>
          <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.aiIcon}>
            <Ionicons name="sparkles" size={14} color="white" />
          </LinearGradient>
          <Text style={styles.aiHeaderTitle}>
            {isIceBreaker ? 'Câu mở đầu gợi ý' : 'AI gợi ý'}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.aiRefreshButton}>
          <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.aiSuggestionsContainer}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.aiSuggestionCard}
            onPress={() => onSelectSuggestion(suggestion.text)}
            activeOpacity={0.7}
          >
            <View style={styles.aiSuggestionHeader}>
              <View style={[styles.aiStyleIndicator, { backgroundColor: getStyleColor(suggestion.style) }]}>
                <Ionicons name={getStyleIcon(suggestion.style) as any} size={12} color="white" />
              </View>
              <Text style={styles.aiStyleText}>{suggestion.emoji}</Text>
            </View>
            <Text style={styles.aiSuggestionText} numberOfLines={3}>
              {suggestion.text}
            </Text>
            {suggestion.basedOn && (
              <Text style={styles.aiBasedOnText}>Dựa trên {suggestion.basedOn}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// --- Màn hình chính ---
export default function ChatScreen() {
  const { chatId, matchId, userName, userAge, avatar, userId, isSuperLike } = useLocalSearchParams<{ chatId: string; matchId?: string; userName?: string; userAge?: string; avatar?: string; userId?: string; isSuperLike?: string }>();
  const isSuper = isSuperLike === 'true';
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // AI Suggestions State
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [isIceBreaker, setIsIceBreaker] = useState(false);

  // ... (Giữ nguyên logic socket/load message cũ của bạn để đảm bảo chức năng không đổi) ...
  const headerUser = useMemo(() => ({
    id: "",
    name: userName || "Chat",
    age: userAge ? Number(userAge) : undefined,
    pronouns: "",
    occupation: "",
    avatar: avatar || undefined,
  }), [userName, userAge, avatar]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const res = await chatService.getMessages(String(chatId), { limit: 50 });
      const list = res?.data?.messages || [];
      setMessages(list);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 300);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Load AI Suggestions
  const loadAISuggestions = useCallback(async () => {
    if (!chatId) return;
    
    setAILoading(true);
    try {
      let response;
      
      if (messages.length === 0 && matchId) {
        console.log('🤖 Loading ice breakers...');
        response = await aiService.getIceBreakerSuggestions(matchId);
        setIsIceBreaker(true);
      } else {
        console.log('🤖 Loading chat suggestions...');
        response = await aiService.getChatSuggestions(chatId, 15);
        setIsIceBreaker(false);
      }

      if (response?.success && response?.data?.suggestions) {
        setAISuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('❌ AI suggestions error:', error);
      setAISuggestions([]);
    } finally {
      setAILoading(false);
    }
  }, [chatId, matchId, messages.length]);

  const toggleAISuggestions = () => {
    if (!showAISuggestions) {
      loadAISuggestions();
    }
    setShowAISuggestions(!showAISuggestions);
  };

  const handleSelectSuggestion = (text: string) => {
    setMessage(text);
    setShowAISuggestions(false);
  };

  const refreshSuggestions = () => {
    loadAISuggestions();
  };

  // Logic Socket giữ nguyên như cũ...
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setCurrentUserId(u?.id || u?._id || null);
        }
        await socketService.init();
        if (chatId) socketService.joinConversation(chatId);
        
        socketService.onNewMessage((payload:any) => {
          const convId = payload?.conversationId?.toString();
          if (convId !== chatId?.toString()) return;
          const msg = payload.message;
          if (!msg) {
            console.log('❌ No message in payload');
            return;
          }
          
          console.log('✅ Processing message:', msg);
          if (!mounted) return;
          
          setMessages(prev => {
            // Check if sender is current user (this is our sent message)
            const msgSenderId = msg.sender?._id || msg.sender?.id || msg.sender;
            if (msgSenderId === currentUserId) {
              console.log('📤 This is our sent message, replacing optimistic');
              // Replace optimistic message with real one
              const hasOptimistic = prev.some(m => m._id?.toString().startsWith('optimistic-'));
              if (hasOptimistic) {
                return prev.map(m => 
                  m._id?.toString().startsWith('optimistic-') ? msg : m
                );
              }
              // If no optimistic (e.g. sent from another device), check duplicate
              const exists = prev.find(m => (m._id || m.id) === (msg._id || msg.id));
              if (exists) return prev;
              return [...prev, msg];
            }
            
            // Message from other user - check duplicate and add
            console.log('📥 Message from other user');
            const exists = prev.find(m => (m._id || m.id) === (msg._id || msg.id));
            if (exists) return prev;
            return [...prev, msg];
          });
          requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          if (msg.sender && msg.sender._id !== currentUserId) {
            socketService.emitRead({ messageId: msg._id, conversationId: chatId, senderId: msg.sender._id });
          }
        });
        
        socketService.onTyping((data:any) => {
          if (data?.conversationId === chatId && data?.userId === userId) {
            if (mounted) setTyping(data.isTyping);
          }
        });
        
        socketService.onReadReceipt((data:any) => {
          console.log('📖 Read receipt received:', data);
          if (data?.conversationId === chatId) {
            // Update messages read status if needed
            setMessages(prev => prev.map(m => {
              if (m._id === data.messageId) {
                return { ...m, isRead: true };
              }
              return m;
            }));
          }
        });
        
        // Mark conversation as entered (clear unread on backend)
        if (chatId) {
          socketService.emitRead({ conversationId: String(chatId) });
        }
      } catch (err) {
        console.error('❌ Socket setup error:', err);
      }
    })();
    return () => {
      mounted = false;
      if (chatId) socketService.leaveConversation(chatId);
    };
  }, [chatId, userId, currentUserId]);

  const onVideoCallPress = () => {
    router.push({
      pathname: '/(main)/(messages)/video-call',
      params: { userName, userAge, avatar, userId },
    });
  };

  // Helper để format ngày hiển thị
  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return "Today";
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerShadowVisible: false, // Xóa shadow mặc định của header
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.avatarContainer}>
                {headerUser.avatar ? (
                  <Image source={{ uri: headerUser.avatar }} style={styles.headerAvatar} />
                ) : (
                  <View style={[styles.headerAvatar, { backgroundColor: '#EEE' }]} />
                )}
                {/* Online Indicator Dot */}
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {headerUser.name}{headerUser.age ? `, ${headerUser.age}` : ""}
                </Text>
                <Text style={styles.headerStatus}>Active now</Text>
              </View>
            </View>
          ),
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: COLORS.white },
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={onVideoCallPress} style={styles.iconButton}>
                <Ionicons name="videocam" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconButton, { marginLeft: 12 }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatContainer}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive" // Mượt hơn on-drag
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <Text style={styles.systemText}>Loading conversation...</Text>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={{ uri: headerUser.avatar }} style={styles.emptyStateAvatar} />
              <Text style={styles.emptyStateText}>You matched with {headerUser.name}!</Text>
              <Text style={styles.systemText}>Send a message to start chatting.</Text>
            </View>
          ) : (
            messages.map((m, idx) => {
              const isMine = (m.sender?._id || m.sender?.id) === currentUserId;
              const time = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const uniqueKey = `${m._id || m.id || 'temp'}-${idx}`;
              
              // Hiển thị ngày nếu tin nhắn này cách tin trước quá xa hoặc là tin đầu tiên
              const showDate = idx === 0 || new Date(m.createdAt!).getDate() !== new Date(messages[idx - 1].createdAt!).getDate();

              return (
                <View key={uniqueKey}>
                  {showDate && <DatePill dateString={getFormattedDate(m.createdAt)} />}
                  {isMine ? (
                    <MyMessageBubble text={m.text || ''} time={time} isSuper={isSuper} />
                  ) : (
                    <TheirMessageBubble text={m.text || ''} time={time} avatar={headerUser.avatar} />
                  )}
                </View>
              );
            })
          )}
          {/* Khoảng trống dưới cùng để tránh bị che bởi input */}
          <View style={{ height: 10 }} />
        </ScrollView>

        {/* --- Typing Indicator --- */}
        {!!typing && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>{headerUser.name} is typing...</Text>
          </View>
        )}

        {/* AI Suggestions Panel */}
        {showAISuggestions && (
          <AISuggestionsPanel
            suggestions={aiSuggestions}
            onSelectSuggestion={handleSelectSuggestion}
            onRefresh={refreshSuggestions}
            loading={aiLoading}
            isIceBreaker={isIceBreaker}
          />
        )}

        {/* --- Thanh Nhập liệu Mới --- */}
        <View style={[styles.inputWrapper, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16 }]}>
          <View style={styles.inputBar}>
            {/* AI Button */}
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={toggleAISuggestions}
            >
              <LinearGradient
                colors={showAISuggestions ? ['#A855F7', '#EC4899'] : ['#E5E7EB', '#E5E7EB']}
                style={styles.aiButtonGradient}
              >
                <Ionicons 
                  name="sparkles" 
                  size={18} 
                  color={showAISuggestions ? 'white' : COLORS.textSecondary} 
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Add Attachment Button */}
            <TouchableOpacity style={styles.attachButton}>
               <Ionicons name="add" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={(t) => {
                setMessage(t);
                if (chatId && userId) {
                  socketService.debounceTyping({ conversationId: String(chatId), receiverId: String(userId) });
                }
              }}
              multiline
            />
            
            {message.trim().length > 0 ? (
              <TouchableOpacity
                onPress={async () => {
                  if (!message.trim() || !matchId) return;
                  const textToSend = message.trim();
                  const optimistic: ChatMessage = { _id: `optimistic-${Date.now()}`, sender: { _id: currentUserId }, text: textToSend, createdAt: new Date().toISOString() };
                  setMessages(prev => [...prev, optimistic]);
                  setMessage('');
                  setShowAISuggestions(false); // Hide AI panel after sending
                  try {
                    const res = await chatService.sendMessage(String(matchId), { type: 'text', text: textToSend });
                    const sent = res?.data?.message || res?.message;
                    if (sent) setMessages(prev => prev.map(m => m._id === optimistic._id ? sent : m));
                  } catch {
                    setMessages(prev => prev.filter(m => m._id !== optimistic._id));
                  }
                }}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={styles.sendButton}
                >
                  <Ionicons name="arrow-up" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // Mic icon khi chưa nhập gì (Option)
              <TouchableOpacity style={styles.micButton}>
                 <Ionicons name="mic-outline" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Styles Improved
  headerTitleContainer: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4ADE80', // Green
    borderWidth: 1.5, borderColor: COLORS.white
  },
  headerTextContainer: { marginLeft: 10 },
  headerName: { fontSize: 16, fontWeight: "700", color: COLORS.text, maxWidth: 150 },
  headerStatus: { fontSize: 12, color: COLORS.primary, fontWeight: "500" },
  headerRightContainer: { flexDirection: "row", alignItems: "center", marginRight: 4 },
  iconButton: { padding: 8, borderRadius: 20, backgroundColor: COLORS.offWhite },

  // Chat Body
  chatContainer: { flex: 1, paddingHorizontal: 16, backgroundColor: COLORS.white },
  systemText: { textAlign: "center", color: COLORS.textSecondary, fontSize: 13, marginVertical: 10 },
  
  // Date Pill
  datePillContainer: { alignItems: 'center', marginVertical: 16 },
  datePillText: { backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: 11, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: 'hidden', fontWeight: '600' },

  // My Message (Phải)
  myMessageWrapper: { alignItems: 'flex-end', marginBottom: 4 },
  myMessageBubble: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 22, borderBottomRightRadius: 4, // Bo góc kiểu hiện đại
    maxWidth: "75%",
  },
  myMessageText: { color: COLORS.white, fontSize: 16, lineHeight: 22 },
  myMessageStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginRight: 2 },
  
  // Their Message (Trái)
  theirMessageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginBottom: 16 }, // Avatar nhỏ ở dưới cùng bubble
  theirMessageBubble: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 22, borderBottomLeftRadius: 4,
    backgroundColor: COLORS.secondary,
    maxWidth: width * 0.7,
  },
  theirMessageText: { color: COLORS.text, fontSize: 16, lineHeight: 22 },
  messageTimeLeft: { fontSize: 11, color: '#9CA3AF', marginTop: 4, marginLeft: 4 },
  messageTime: { fontSize: 11, color: '#9CA3AF' },

  // Typing
  typingContainer: { paddingLeft: 52, marginBottom: 10 },
  typingText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

  // Empty State
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyStateAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },

  // Input Bar Improved
  inputWrapper: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingHorizontal: 16, paddingTop: 10,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', // Align bottom để input scale đẹp khi multiline
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  aiButton: { marginRight: 4 },
  aiButtonGradient: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  attachButton: { padding: 8, marginRight: 4 },
  micButton: { padding: 8 },
  textInput: {
    flex: 1,
    fontSize: 16, color: COLORS.text,
    maxHeight: 100,
    paddingTop: 10, paddingBottom: 10, // Padding text input
  },
  sendButton: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 4, marginBottom: 2, // Canh chỉnh với input
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3,
  },

  // AI Suggestions Styles
  aiContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  aiLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiRefreshButton: {
    padding: 4,
  },
  aiSuggestionsContainer: {
    paddingHorizontal: 16,
  },
  aiSuggestionCard: {
    width: 240,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiStyleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  aiStyleText: {
    fontSize: 16,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  aiBasedOnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});