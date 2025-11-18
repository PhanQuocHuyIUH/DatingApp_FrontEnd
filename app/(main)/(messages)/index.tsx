import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { chatService } from "../../../services/chatService";
import { socketService } from "../../../services/socketService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSearch } from "./_layout";

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
  superLike: "#1E90FF",
  gold: "#FFD700",
};

type Conversation = {
  id: string;
  matchId: string;
  isSuperLike?: boolean;
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

// --- Component cho Hàng Chat với SuperLike ---
const ChatRow = ({ item }: { item: Conversation }) => {
  // Extract avatar with proper fallback logic
  const getAvatar = () => {
    if (!item.user.photos || item.user.photos.length === 0) {
      return 'https://via.placeholder.com/150';
    }
    const mainPhoto = item.user.photos.find(p => p.isMain && p.url);
    if (mainPhoto?.url) return mainPhoto.url;
    const firstPhoto = item.user.photos.find(p => p.url);
    return firstPhoto?.url || 'https://via.placeholder.com/150';
  };
  const avatar = getAvatar();
  const statusColor = item.user.isOnline ? COLORS.online : COLORS.offline;
  const lastText = item.lastMessage?.text || '';
  const isSuperLike = item.isSuperLike;
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSuperLike) {
      // Pulsing animation for SuperLike
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSuperLike, scaleAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Link
      href={{
        pathname: '/(main)/(messages)/[chatId]',
        params: {
          chatId: String(item.id),
          matchId: String(item.matchId),
          userName: item.user.name || 'User',
          userAge: String(item.user.age || ''),
          avatar: avatar,
          userId: String(item.user.id),
          isSuperLike: isSuperLike ? 'true' : 'false',
        },
      }}
      asChild
    >
      <TouchableOpacity>
        <Animated.View
          style={[
            styles.chatRow,
            isSuperLike && {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {isSuperLike && (
            <Animated.View
              style={[
                styles.superLikeGlow,
                { opacity: glowOpacity },
              ]}
            >
              <LinearGradient
                colors={['#4FC3F7', '#1E88E5', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
          <View style={styles.chatAvatarContainer}>
            {isSuperLike && (
              <View style={styles.superLikeBadge}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.superLikeBadgeGradient}
                >
                  <MaterialCommunityIcons name="star" size={12} color={COLORS.white} />
                </LinearGradient>
              </View>
            )}
            <Image source={{ uri: avatar }} style={[
              styles.chatAvatar,
              isSuperLike && styles.chatAvatarSuperLike,
            ]} />
            <View style={[styles.chatStatusIndicator, { backgroundColor: statusColor }]} />
          </View>
          <View style={styles.chatTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.chatName, isSuperLike && styles.chatNameSuperLike]}>
                {item.user.name}{item.user.age ? `, ${item.user.age}` : ''}
              </Text>
              {isSuperLike && (
                <MaterialCommunityIcons 
                  name="star-circle" 
                  size={16} 
                  color={COLORS.gold} 
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <Text style={styles.chatLastMessage} numberOfLines={1}>
              {lastText}
            </Text>
          </View>
          {item.unreadCount ? (
            <View style={[styles.unreadBadge, isSuperLike && styles.unreadBadgeSuperLike]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );
};

// --- Màn hình chính ---
export default function MessagesScreen() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchQuery } = useSearch();

  // Filter conversations based on search query
  const filteredConvs = convs.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = conv.user.name?.toLowerCase() || '';
    const lastMsg = conv.lastMessage?.text?.toLowerCase() || '';
    return name.includes(query) || lastMsg.includes(query);
  });

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

  // Floating Hearts Animations - Continuous throughout screen
  const heart1 = useRef(new Animated.Value(0)).current;
  const heart2 = useRef(new Animated.Value(0)).current;
  const heart3 = useRef(new Animated.Value(0)).current;
  const heart4 = useRef(new Animated.Value(0)).current;
  const heart5 = useRef(new Animated.Value(0)).current;
  const heart6 = useRef(new Animated.Value(0)).current;
  const heart7 = useRef(new Animated.Value(0)).current;
  const heart8 = useRef(new Animated.Value(0)).current;
  const heart9 = useRef(new Animated.Value(0)).current;
  const heart10 = useRef(new Animated.Value(0)).current;
  const heart11 = useRef(new Animated.Value(0)).current;
  const heart12 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create continuous floating animations for each heart
    const createHeartAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Start animations with different timings for continuous effect
    createHeartAnimation(heart1, 10000, 0);
    createHeartAnimation(heart2, 12000, 1000);
    createHeartAnimation(heart3, 9000, 2000);
    createHeartAnimation(heart4, 11000, 3000);
    createHeartAnimation(heart5, 13000, 4000);
    createHeartAnimation(heart6, 10500, 5000);
    createHeartAnimation(heart7, 11500, 6000);
    createHeartAnimation(heart8, 12500, 7000);
    createHeartAnimation(heart9, 9500, 1500);
    createHeartAnimation(heart10, 10000, 2500);
    createHeartAnimation(heart11, 11000, 3500);
    createHeartAnimation(heart12, 12000, 4500);
  }, [heart1, heart2, heart3, heart4, heart5, heart6, heart7, heart8, heart9, heart10, heart11, heart12]);

  // Interpolate positions for each heart - float across entire screen
  const createHeartStyle = (animValue: Animated.Value, startX: number, endX: number, rotate: string) => ({
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [800, -150],
        }),
      },
      {
        translateX: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [startX, endX, startX + 30],
        }),
      },
      { rotate },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 0.15, 0.85, 1],
      outputRange: [0, 0.6, 0.6, 0],
    }),
  });

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
        
        // Listen for read receipts to clear unread badge
        socketService.onReadReceipt((data: any) => {
          const { conversationId } = data || {};
          if (conversationId) {
            setConvs(prev => prev.map(c => 
              c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
          }
        });
      } catch {
        // ignore socket connect errors
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Floating Hearts Background - Absolute positioned across entire screen */}
      <View style={styles.heartsBackground}>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart1, -20, 30, '15deg')]}>
          <MaterialCommunityIcons name="heart" size={30} color={COLORS.primary} />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart2, 80, 60, '-10deg')]}>
          <MaterialCommunityIcons name="heart" size={26} color="#FF6B9D" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart3, 200, 180, '20deg')]}>
          <MaterialCommunityIcons name="heart" size={34} color={COLORS.gold} />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart4, 300, 320, '-15deg')]}>
          <MaterialCommunityIcons name="heart" size={22} color="#FF1493" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart5, 40, 20, '25deg')]}>
          <MaterialCommunityIcons name="heart" size={28} color="#FF69B4" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart6, 150, 170, '-20deg')]}>
          <MaterialCommunityIcons name="heart" size={24} color={COLORS.superLike} />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart7, 250, 230, '10deg')]}>
          <MaterialCommunityIcons name="heart" size={32} color="#FF1493" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart8, 120, 140, '-25deg')]}>
          <MaterialCommunityIcons name="heart" size={26} color={COLORS.primary} />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart9, 60, 40, '18deg')]}>
          <MaterialCommunityIcons name="heart" size={28} color="#FF69B4" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart10, 180, 200, '-12deg')]}>
          <MaterialCommunityIcons name="heart" size={30} color={COLORS.gold} />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart11, 280, 260, '22deg')]}>
          <MaterialCommunityIcons name="heart" size={24} color="#FF6B9D" />
        </Animated.View>
        <Animated.View style={[styles.floatingHeart, createHeartStyle(heart12, 100, 120, '-18deg')]}>
          <MaterialCommunityIcons name="heart" size={26} color={COLORS.superLike} />
        </Animated.View>
      </View>

      <LinearGradient
        colors={['#ffffff', '#fef5f7', '#fef9fa']}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.section}>
            <View style={styles.chatHeader}>
              <Text style={styles.sectionTitle}>
                Chats ({searchQuery ? `${filteredConvs.length}/${convs.length}` : convs.length})
              </Text>
              <TouchableOpacity onPress={load}>
                <Ionicons name="refresh" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.chatListContainer}>
              {loading ? (
                <Text style={{ padding: 12, color: COLORS.textSecondary }}>Loading...</Text>
              ) : error ? (
                <Text style={{ padding: 12, color: 'red' }}>{error}</Text>
              ) : filteredConvs.length === 0 ? (
                <Text style={{ padding: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </Text>
              ) : (
                <FlatList
                  data={filteredConvs}
                  renderItem={({ item }) => <ChatRow item={item} />}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginHorizontal: 12,
    padding: 8,
    position: 'relative',
    minHeight: 400,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(178, 30, 70, 0.15)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  superLikeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  superLikeBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    zIndex: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  superLikeBadgeGradient: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  chatAvatarSuperLike: {
    borderWidth: 2,
    borderColor: COLORS.gold,
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
  chatNameSuperLike: {
    color: COLORS.superLike,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeSuperLike: {
    backgroundColor: COLORS.gold,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chatLastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  // Floating Hearts Background - Covers entire screen
  heartsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    pointerEvents: 'none',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 0,
  },
});