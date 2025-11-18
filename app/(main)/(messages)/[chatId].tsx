import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Feather,
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { chatService } from "../../../services/chatService";
import { socketService } from "../../../services/socketService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6", // Màu nền cho input
  gray: "#E5E7EB",
  blueCheck: "#3B82F6",
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

// --- Component Tin nhắn (của mình) ---
const MyMessageBubble = ({ text, time }: { text: string; time: string }) => (
  <View style={styles.myMessageContainer}>
    <View style={styles.myMessageBubble}>
      <Text style={styles.myMessageText}>{text}</Text>
    </View>
    <Text style={styles.messageTime}>{time}</Text>
  </View>
);

const TheirMessageBubble = ({ text, time }: { text: string; time: string }) => (
  <View style={styles.theirMessageContainer}>
    <View style={styles.theirMessageBubble}>
      <Text style={styles.theirMessageText}>{text}</Text>
    </View>
    <Text style={styles.messageTime}>{time}</Text>
  </View>
);

// --- Màn hình chính ---
export default function ChatScreen() {
  const { chatId, matchId, userName, userAge, avatar, userId } = useLocalSearchParams<{ chatId: string; matchId?: string; userName?: string; userAge?: string; avatar?: string; userId?: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [inputHeight, setInputHeight] = useState(0);
  const headerHeight = useHeaderHeight();

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
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // No manual keyboard listeners needed with KeyboardStickyView

  // Init socket & listeners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const uid = u?.id || u?._id || null;
          if (mounted) setCurrentUserId(uid);
          console.log('👤 Current user ID:', uid);
        }
        const sock = await socketService.init();
        console.log('🔌 Socket connected:', sock?.connected);
        
        if (chatId) {
          console.log('🚪 Joining conversation:', chatId);
          socketService.joinConversation(chatId);
        }
        
        socketService.onNewMessage((payload:any) => {
          console.log('📨 Message received in chat screen:', payload);
          const convId = payload?.conversationId?.toString();
          const currentChatId = chatId?.toString();
          console.log('Comparing:', convId, 'vs', currentChatId);
          
          if (convId !== currentChatId) {
            console.log('❌ Wrong conversation, ignoring');
            return;
          }
          
          const msg = payload.message;
          if (!msg) {
            console.log('❌ No message in payload');
            return;
          }
          
          console.log('✅ Adding message to UI:', msg);
          // Avoid duplicate (check if already exists)
          if (!mounted) return;
          setMessages(prev => {
            const exists = prev.find(m => (m._id || m.id) === (msg._id || msg.id));
            if (exists) {
              console.log('⚠️ Duplicate message, skipping');
              return prev;
            }
            return [...prev, msg];
          });
          // auto scroll
          requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          // Auto read receipt if message from other user
          if (msg.sender && msg.sender._id !== currentUserId) {
            socketService.emitRead({ messageId: msg._id, conversationId: chatId, senderId: msg.sender._id });
          }
        });
        
        socketService.onTyping((data:any) => {
          if (data?.conversationId === chatId && data?.userId === userId) {
            if (mounted) setTyping(data.isTyping);
          }
        });
      } catch (err) {
        console.error('❌ Socket setup error:', err);
      }
    })();
    return () => {
      mounted = false;
      if (chatId) {
        console.log('👋 Leaving conversation:', chatId);
        socketService.leaveConversation(chatId);
      }
    };
  }, [chatId, userId, currentUserId]);

  // Hàm này sẽ điều hướng đến trang video call
  const onVideoCallPress = () => {
    router.push('/(main)/(messages)/video-call');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
    >
      <StatusBar style="dark" />

      {/* --- Cấu hình Header --- */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            // Header Title tùy chỉnh
            <View style={styles.headerTitleContainer}>
              {headerUser.avatar ? (
                <Image source={{ uri: headerUser.avatar }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, { backgroundColor: COLORS.gray }]} />
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName}>
                  {headerUser.name}{headerUser.age ? `, ${headerUser.age}` : ""}{" "}
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={COLORS.blueCheck}
                  />
                </Text>
                <View style={styles.headerSubtitleRow}>
                  {!!headerUser.pronouns && <Text style={styles.headerSubtitle}>{headerUser.pronouns}</Text>}
                  {!!headerUser.occupation && (
                    <Text style={[styles.headerSubtitle, { marginLeft: 8 }]}>
                      <FontAwesome name="briefcase" size={12} /> {headerUser.occupation}
                    </Text>
                  )}
                </View>
              </View>
              {/* Profile quick view removed per request */}
            </View>
          ),
          headerTitleAlign: "left",
          // headerTitleStyle removed unsupported flex prop
          // Header Right (Video, More)
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={onVideoCallPress}>
                <Feather name="video" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 16 }}>
                <Feather name="more-vertical" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* --- 1. Nội dung Chat --- */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 + inputHeight }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={true}
      >
        {loading ? (
          <Text style={styles.dateSeparator}>Loading...</Text>
        ) : messages.length === 0 ? (
          <Text style={styles.dateSeparator}>Say hi 👋</Text>
        ) : (
          messages.map((m, idx) => {
            const isMine = (m.sender?._id || m.sender?.id) === currentUserId;
            const time = new Date(m.createdAt || Date.now()).toLocaleTimeString();
            // Use unique key: combine _id/id with index to prevent duplicates
            const uniqueKey = `${m._id || m.id || 'temp'}-${idx}`;
            return isMine ? (
              <MyMessageBubble key={uniqueKey} text={m.text || ''} time={time} />
            ) : (
              <TheirMessageBubble key={uniqueKey} text={m.text || ''} time={time} />
            );
          })
        )}
      </ScrollView>
      {!!typing && <Text style={styles.typingIndicator}>{headerUser.name} is typing...</Text>}

      {/* Mini-game banner removed */}

      {/* --- 3. Ô nhập tin nhắn --- */}
      <View
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={[
          styles.inputContainer,
          { paddingBottom: Platform.OS === 'ios' ? 12 + insets.bottom : 12 },
        ]}
      >
        {/* Hàng 1: Text Input */}
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={message}
            onChangeText={(t) => {
              setMessage(t);
              if (chatId && userId) {
                socketService.debounceTyping({ conversationId: String(chatId), receiverId: String(userId) });
              }
            }}
            multiline
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons
              name="happy-outline"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {/* Hàng 2: Action Icons */}
        <View style={styles.actionRow}>
          <View style={styles.actionIconsLeft}>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="mic-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={async () => {
              if (!message.trim() || !matchId) return;
              const textToSend = message.trim();
              const optimistic: ChatMessage = { _id: `optimistic-${Date.now()}`, sender: { _id: currentUserId }, text: textToSend, createdAt: new Date().toISOString() };
              setMessages(prev => [...prev, optimistic]);
              requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
              setMessage('');
              try {
                const res = await chatService.sendMessage(String(matchId), { type: 'text', text: textToSend });
                const sent = res?.data?.message || res?.message;
                if (sent) {
                  setMessages(prev => prev.map(m => m._id === optimistic._id ? sent : m));
                }
              } catch {
                setMessages(prev => prev.filter(m => m._id !== optimistic._id));
              }
            }}
          >
            <Ionicons name="send" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // --- Header Styles ---
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1, // Để chiếm không gian
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  // --- Chat Body Styles ---
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateSeparator: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary, // Đổi màu
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4, // Góc bo
    maxWidth: "80%",
  },
  theirMessageBubble: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
  },
  myMessageText: {
    color: COLORS.white,
    fontSize: 16,
  },
  theirMessageText: {
    color: COLORS.text,
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  typingIndicator: {
    textAlign: 'left',
    marginLeft: 16,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  // --- Banner Styles Removed ---
  // --- Input Styles ---
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16, // Safe area
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  textInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100, // Giới hạn chiều cao khi gõ nhiều
  },
  emojiButton: {
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  actionIconsLeft: {
    flexDirection: "row",
  },
  actionIcon: {
    marginRight: 16,
  },
  sendButton: {
    // Thêm style cho nút send nếu muốn
  },
});