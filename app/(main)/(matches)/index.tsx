import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { matchService } from '../../../services/matchService';
import { discoveryService } from '../../../services/discoveryService';
import { useRouter } from 'expo-router';
import { chatService } from '../../../services/chatService';

const COLORS = {
  primary: '#b21e46',
  bg: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  green: '#27ae60',
  red: '#e74c3c',
  blue: '#2980b9',
  chip: '#F3F4F6',
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
      const [mRes, lRes] = await Promise.all([
        matchService.getMatches(),
        discoveryService.getLikedSwiped(50),
      ]);
      const m = mRes?.data?.matches || [];
      const l = lRes?.data?.profiles || [];
      setMatches(m);
      setLiked(l);
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

  const MatchCard = ({ item }: { item: MatchItem }) => {
    const img = getProfileImage(item.user);
    const isNew = (() => {
      const d = new Date(item.matchedAt).getTime();
      return Date.now() - d < 24 * 60 * 60 * 1000;
    })();
    const onChat = async () => {
      try {
        const res = await chatService.createConversation(item.id);
        const conv = res?.data?.conversation || res?.conversation || res?.data;
        if (conv?.id) {
          router.push({ pathname: '/(main)/(messages)/[chatId]', params: { chatId: String(conv.id), matchId: String(item.id) } });
        }
      } catch {
        // noop; could show toast
      }
    };
    return (
      <View style={styles.card}>
        <Image source={{ uri: img }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.user.name}{item.user.age ? `, ${item.user.age}` : ''}</Text>
            {isNew && (
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
            )}
          </View>
          <Text style={styles.meta}>Matched {humanizeMatchTime(item.matchedAt)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => openMatchDetail(item)}>
              <MaterialIcons name="person" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onChat}>
              <MaterialIcons name="chat" size={18} color={COLORS.primary} />
              <Text style={styles.btnOutlineText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const LikedCard = ({ item }: { item: Profile }) => {
    const img = getProfileImage(item);
    const displayName = item.name + (item.age ? `, ${item.age}` : '');
    const onSuperLike = () => {
      // Backend prevents re-swipe on same user; show friendly notice
      console.log('Superlike requested for', item._id || item.id);
    };
    const onUndoLike = () => {
      // No backend endpoint for undo like; show notice
      console.log('Undo like requested for', item._id || item.id);
    };
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => openLikedDetail(item)} style={styles.card}>
        <Image source={{ uri: img }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.meta}>You liked this profile</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onSuperLike}>
              <MaterialIcons name="favorite" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Super Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onUndoLike}>
              <MaterialIcons name="close" size={18} color="#fff" />
              <Text style={styles.btnDangerText}>Undo Like</Text>
            </TouchableOpacity>
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
    backgroundColor: '#F3F4F6',
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
  },
  tabText: {
    color: COLORS.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#E8F8F0',
    borderColor: COLORS.green,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  newBadgeText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },
  meta: {
    color: COLORS.muted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  btnDanger: {
    backgroundColor: COLORS.red,
  },
  btnDangerText: {
    color: '#fff',
    fontWeight: '700',
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
