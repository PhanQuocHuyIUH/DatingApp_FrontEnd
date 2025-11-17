import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Link } from "expo-router";
import { chatService } from "../../../services/chatService";
import { socketService } from "../../../services/socketService";
import { Ionicons } from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  online: "#22C55E", // Xanh lá
  offline: "#94A3B8", // Xám
  away: "#F59E0B", // Vàng
};

type Conversation = {
  id: string;
  matchId: string;
  user: {
    id: string;
    name: string;
    age?: number;
    photos?: { url?: string; isMain?: boolean }[];
    lastActive?: string;
    isOnline?: boolean;
  };
  lastMessage?: { text?: string; timestamp?: string };
  unreadCount?: number;
};

// --- Component cho Avatar (Matches) ---
// Placeholder for matches carousel (optional)
// (Reserved) Match avatar carousel not used currently; keep placeholder minimal.
// const MatchAvatar = ({ item }: { item: any }) => null;

// --- Component cho Hàng Chat ---
const ChatRow = ({ item }: { item: Conversation }) => {
  const avatar = (item.user.photos?.find(p => p.isMain && p.url)?.url) || item.user.photos?.[0]?.url;
  const statusColor = item.user.isOnline ? COLORS.online : COLORS.offline;
  const lastText = item.lastMessage?.text || '';
  return (
    <Link
      href={{
        pathname: '/(main)/(messages)/[chatId]',
        params: {
          chatId: item.id,
          matchId: item.matchId,
          userName: item.user.name,
          userAge: item.user.age?.toString() || '',
          avatar: avatar || '',
          userId: item.user.id,
        },
      }}
      asChild
    >
      <TouchableOpacity style={styles.chatRow}>
        <View style={styles.chatAvatarContainer}>
          <Image source={{ uri: avatar }} style={styles.chatAvatar} />
          <View style={[styles.chatStatusIndicator, { backgroundColor: statusColor }]} />
        </View>
        <View style={styles.chatTextContainer}>
          <Text style={styles.chatName}>{item.user.name}{item.user.age ? `, ${item.user.age}` : ''}</Text>
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {lastText}
          </Text>
        </View>
        <Text style={styles.chatTime}></Text>
      </TouchableOpacity>
    </Link>
  );
};

// --- Màn hình chính ---
export default function MessagesScreen() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await chatService.getConversations();
      const list = res?.data?.conversations || [];
      setConvs(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime updates for new messages
  useEffect(() => {
    (async () => {
      try {
        await socketService.init();
        socketService.onNewMessage((payload: any) => {
          const { conversationId, message } = payload || {};
          if (!conversationId || !message) return;
          setConvs(prev => {
            const existing = prev.find(c => c.id === conversationId);
            const updated = existing ? prev.map(c => c.id === conversationId ? { ...c, lastMessage: { text: message.text, timestamp: message.createdAt }, unreadCount: (c.unreadCount || 0) + 1 } : c) : [{ id: conversationId, matchId: '', user: { id: message.sender?._id, name: message.sender?.name || 'New', photos: message.sender?.photos }, lastMessage: { text: message.text, timestamp: message.createdAt }, unreadCount: 1 }, ...prev];
            // reorder by lastMessage timestamp desc
            return [...updated].sort((a,b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime());
          });
        });
      } catch {
        // ignore socket connect errors
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.section}>
        <View style={styles.chatHeader}>
          <Text style={styles.sectionTitle}>Chats ({convs.length})</Text>
          {/* Auto realtime updates via socket; manual refresh optional */}
          <TouchableOpacity onPress={load}>
            <Ionicons name="refresh" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.chatListContainer}>
          {loading ? (
            <Text style={{ padding: 12, color: COLORS.textSecondary }}>Loading...</Text>
          ) : error ? (
            <Text style={{ padding: 12, color: 'red' }}>{error}</Text>
          ) : (
            <FlatList
              data={convs}
              renderItem={({ item }) => <ChatRow item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // --- Styles cho Matches ---
  matchItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  matchAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.secondary, // Viền hồng nhạt
  },
  statusIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: "absolute",
    bottom: 20,
    right: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  matchName: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  // --- Styles cho Chats ---
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20, // sectionTitle đã có paddingLeft
  },
  chatListContainer: {
    backgroundColor: COLORS.secondary, // Nền hồng nhạt
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 8,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  chatAvatarContainer: {
    width: 50,
    height: 50,
  },
  chatAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  chatStatusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.secondary, // Nền hồng nhạt
  },
  chatTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  chatLastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: "flex-start", // Đặt ở trên cùng
    marginTop: 4,
  },
});