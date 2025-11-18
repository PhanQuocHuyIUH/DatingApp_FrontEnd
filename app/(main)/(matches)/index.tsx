import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { matchService } from '../../../services/matchService';
import { discoveryService } from '../../../services/discoveryService';
import { useRouter } from 'expo-router';
import { chatService } from '../../../services/chatService';

const COLORS = {
  primary: '#FF6B9D',
  primaryDark: '#C92A6D',
  bg: '#F7FAFC',
  text: '#2D3748',
  muted: '#718096',
  border: '#E2E8F0',
  green: '#48BB78',
  red: '#F56565',
  blue: '#4299E1',
  chip: '#F3F4F6',
  gold: '#FFD93D',
  superLike: '#1E90FF',
  gradient: ['#FFB4D5', '#FF6B9D'],
  superGradient: ['#4FC3F7', '#1E88E5'],
};

type ProfilePhoto = { url?: string; isMain?: boolean };
type Profile = {
  _id?: string; // from discovery
  id?: string; // from matches.user.id
  name: string;
  age?: number;
  verified?: boolean;
  image?: string;
  photos?: ProfilePhoto[];
  location?: any;
  lastActive?: string;
  isOnline?: boolean;
  bio?: string;
  occupation?: string;
};

type MatchItem = {
  id: string;
  matchedAt: string;
  isSuperLike?: boolean;
  superLikedBy?: string;
  user: {
    id: string;
    name: string;
    age?: number;
    photos?: ProfilePhoto[];
    bio?: string;
    occupation?: string;
    lastActive?: string;
    isOnline?: boolean;
  };
};

const getProfileImage = (p: Profile | MatchItem['user']): string => {
  // support either { image } or photos[] with isMain
  const anyP: any = p as any;
  if (anyP.image) return anyP.image;
  const photos: ProfilePhoto[] = anyP.photos || [];
  const main = photos.find(ph => ph.isMain && ph.url)?.url;
  if (main) return main;
  const first = photos.find(ph => ph.url)?.url;
  return first || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900';
};

const humanizeMatchTime = (ts?: string) => {
  if (!ts) return '';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function MatchesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'matches' | 'liked'>('matches');
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [liked, setLiked] = useState<Profile[]>([]);
  const [superLikedIds, setSuperLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const openMatchDetail = useCallback((item: MatchItem) => {
    try {
      router.push({
        pathname: '/(main)/(matches)/[id]',
        params: {
          id: item.id,
          type: 'match',
          initial: JSON.stringify(item),
        },
      });
    } catch {
      // fallback without initial if stringify fails
      router.push({ pathname: '/(main)/(matches)/[id]', params: { id: item.id, type: 'match' } });
    }
  }, [router]);

  const openLikedDetail = useCallback((item: Profile) => {
    const pid = String(item._id || item.id);
    try {
      router.push({
        pathname: '/(main)/(matches)/[id]',
        params: {
          id: pid,
          type: 'liked',
          initial: JSON.stringify(item),
        },
      });
    } catch {
      router.push({ pathname: '/(main)/(matches)/[id]', params: { id: pid, type: 'liked' } });
    }
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, lRes, sRes] = await Promise.all([
        matchService.getMatches(),
        discoveryService.getLikedSwiped(50),
        discoveryService.getSuperLiked(50),
      ]);
      const m = mRes?.data?.matches || [];
      const l = lRes?.data?.profiles || [];
      const s = sRes?.data?.profiles || [];
      
      // Create set of superliked user IDs
      const superLikedSet = new Set<string>(s.map((p: any) => String(p._id || p.id)));
      
      setMatches(m);
      setLiked(l);
      setSuperLikedIds(superLikedSet);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Matches</Text>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'matches' && styles.tabActive]}
          onPress={() => setTab('matches')}
        >
          <Text style={[styles.tabText, tab === 'matches' && styles.tabTextActive]}>Matched</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'liked' && styles.tabActive]}
          onPress={() => setTab('liked')}
        >
          <Text style={[styles.tabText, tab === 'liked' && styles.tabTextActive]}>Liked</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Animated Heart Component for SuperLike
  const AnimatedHeart = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, [scaleAnim, opacityAnim]);

    return (
      <Animated.View
        style={[
          styles.superLikeHeartBadge,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Ionicons name="heart" size={24} color="#FF1744" />
      </Animated.View>
    );
  };

  const MatchCard = ({ item }: { item: MatchItem }) => {
    const img = getProfileImage(item.user);
    const isNew = (() => {
      const d = new Date(item.matchedAt).getTime();
      return Date.now() - d < 24 * 60 * 60 * 1000;
    })();
    const isSuperLike = item.isSuperLike || item.superLikedBy || superLikedIds.has(String(item.user.id));
    const onChat = async () => {
      try {
        const res = await chatService.createConversation(item.id);
        const conv = res?.data?.conversation || res?.conversation || res?.data;
        if (conv?.id) {
          const other = conv.participants?.find?.((p:any)=> p._id !== item.user.id);
          router.push({ pathname: '/(main)/(messages)/[chatId]', params: { chatId: String(conv.id), matchId: String(item.id), userId: other?._id || '' } });
        }
      } catch {
        // noop; could show toast
      }
    };
    
    return isSuperLike ? (
      <LinearGradient
        colors={['#4FC3F7', '#1E88E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradientWrapper}
      >
        <View style={[styles.card, styles.cardSuperLike]}>
          <View style={styles.superLikeBadge}>
            <Ionicons name="star" size={16} color={COLORS.gold} />
            <Text style={styles.superLikeBadgeText}>Super Like</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: img }} style={styles.avatar} />
              {item.user.isOnline && <View style={styles.onlineBadge} />}
              <AnimatedHeart />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.user.name}{item.user.age ? `, ${item.user.age}` : ''}</Text>
                {isNew && (
                  <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
                )}
              </View>
              {item.user.occupation && (
                <Text style={styles.occupation} numberOfLines={1}>{item.user.occupation}</Text>
              )}
              <Text style={styles.meta}>Matched {humanizeMatchTime(item.matchedAt)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnPrimary]} 
                  onPress={() => openMatchDetail(item)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="person" size={18} color="#fff" />
                  <Text style={styles.btnPrimaryText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnOutline]} 
                  onPress={onChat}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="chat" size={18} color={COLORS.primary} />
                  <Text style={styles.btnOutlineText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    ) : (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: img }} style={styles.avatar} />
            {item.user.isOnline && <View style={styles.onlineBadge} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.user.name}{item.user.age ? `, ${item.user.age}` : ''}</Text>
              {isNew && (
                <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
              )}
            </View>
            {item.user.occupation && (
              <Text style={styles.occupation} numberOfLines={1}>{item.user.occupation}</Text>
            )}
            <Text style={styles.meta}>Matched {humanizeMatchTime(item.matchedAt)}</Text>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnPrimary]} 
                onPress={() => openMatchDetail(item)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.btnOutline]} 
                onPress={onChat}
                activeOpacity={0.8}
              >
                <MaterialIcons name="chat" size={18} color={COLORS.primary} />
                <Text style={styles.btnOutlineText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const LikedCard = ({ item }: { item: Profile }) => {
    const img = getProfileImage(item);
    const displayName = item.name + (item.age ? `, ${item.age}` : '');
    const isSuperLiked = superLikedIds.has(String(item._id || item.id));
    
    const onSuperLike = () => {
      // Backend prevents re-swipe on same user; show friendly notice
      console.log('Superlike requested for', item._id || item.id);
    };
    const onUndoLike = () => {
      // No backend endpoint for undo like; show notice
      console.log('Undo like requested for', item._id || item.id);
    };
    return (
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => openLikedDetail(item)}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: img }} style={styles.avatar} />
              {item.isOnline && <View style={styles.onlineBadge} />}
              {isSuperLiked && <AnimatedHeart />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName}</Text>
              {item.occupation && (
                <Text style={styles.occupation} numberOfLines={1}>{item.occupation}</Text>
              )}
              <Text style={styles.meta}>
                {isSuperLiked ? 'You superliked this profile ⭐' : 'You liked this profile'}
              </Text>
              <View style={styles.actions}>
                {!isSuperLiked && (
                  <TouchableOpacity 
                    style={[styles.btn, styles.btnPrimary]} 
                    onPress={onSuperLike}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="star" size={18} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Super Like</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.btn, styles.btnDanger, isSuperLiked && { flex: 1 }]} 
                  onPress={onUndoLike}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={18} color="#fff" />
                  <Text style={styles.btnDangerText}>Undo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}> 
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Loading...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.red} />
          <Text style={[styles.muted, { color: COLORS.red, marginTop: 8 }]}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]}>
            <Text style={styles.btnPrimaryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (tab === 'matches') {
      if (!matches.length) {
        return (
          <View style={styles.centered}>
            <MaterialIcons name="people-outline" size={48} color={COLORS.muted} />
            <Text style={styles.muted}>No matches yet</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={matches}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <MatchCard item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      );
    }
    // liked
    if (!liked.length) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="thumb-up-off-alt" size={48} color={COLORS.muted} />
          <Text style={styles.muted}>You haven’t liked anyone yet</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={liked}
        keyExtractor={(it) => (it._id || it.id)!}
        renderItem={({ item }) => <LikedCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    color: COLORS.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  cardGradientWrapper: {
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardSuperLike: {
    borderRadius: 14,
  },
  superLikeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  superLikeBadgeText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: '#fff',
  },
  superLikeHeartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 8,
  },
  occupation: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: '#E6F7EF',
    borderColor: COLORS.green,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  newBadgeText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  meta: {
    color: COLORS.muted,
    marginTop: 4,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDangerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muted: {
    color: COLORS.muted,
    marginTop: 8,
  },
});
