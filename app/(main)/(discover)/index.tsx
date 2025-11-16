import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { discoveryService } from "../../../services/discoveryService";

const COLORS = {
  primary: "#b21e46",
  secondary: "#fae0e7",
  white: "#FFFFFF",
  text: "#1F2937",
  blueCheck: "#3B82F6",
  error: "#e74c3c",
  success: "#27ae60",
  overlay: "rgba(0,0,0,0.55)",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_H_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_V_THRESHOLD = 0.2 * SCREEN_HEIGHT;
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900";

type ProfilePhoto = {
  url?: string;
  isMain?: boolean;
};

type Profile = {
  _id: string;
  name: string;
  age?: number;
  pronouns?: string;
  occupation?: string;
  bio?: string;
  verified?: boolean;
  image?: string;
  photos?: ProfilePhoto[];
  distance?: number;
};

type SwipeAction = "like" | "pass" | "superlike";

type ProfilesApiResponse = {
  data?: {
    profiles?: Profile[];
  };
};

type SwipeApiResponse = {
  data?: {
    isMatch?: boolean;
  };
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

const getProfileImage = (profile: Profile): string => {
  if (profile.image) return profile.image;
  const photos = profile.photos || [];
  const mainPhoto = photos.find((photo) => photo.isMain && photo.url);
  if (mainPhoto?.url) return mainPhoto.url;
  const fallback = photos.find((photo) => photo.url)?.url;
  return fallback || PLACEHOLDER_IMAGE;
};

const parseErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err && "message" in err) {
    return String((err as any).message || fallback);
  }
  return fallback;
};

// Memoized ProfileCard Component to prevent unnecessary re-renders
const ProfileCard = React.memo<{
  profile: Profile;
  index: number;
  isCurrent: boolean;
  panHandlers?: any;
  animatedStyle?: any;
  likeOpacity?: any;
  nopeOpacity?: any;
  superOpacity?: any;
  superScale?: any;
}>(({ profile, index, isCurrent, panHandlers, animatedStyle }) => {
  const imageUri = getProfileImage(profile);
  
  return (
    <Animated.View
      style={[
        styles.card,
        animatedStyle,
        isCurrent && { zIndex: 3, elevation: 6 },
        !isCurrent && {
          zIndex: index === 1 ? 2 : 1,
          elevation: index === 1 ? 4 : 2,
          top: 12 * index,
          transform: [{ scale: index === 1 ? 0.97 : 0.94 }],
          opacity: index === 1 ? 0.95 : 0.9,
        },
      ]}
      {...(isCurrent ? panHandlers : {})}
    >
      <ImageBackground
        key={`${profile._id}-${imageUri}`} // Force re-mount when profile changes
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={styles.imageRadius}
        blurRadius={isCurrent ? 0 : index === 1 ? 3 : 5}
      >
        {isCurrent ? (
          <View pointerEvents="none" style={styles.overlayContainer}>
            <Animated.View
              style={[styles.overlayBadge, styles.likeBadge, { opacity: (animatedStyle as any)?.likeOpacity }]}
            >
              <MaterialIcons name="check" size={24} color="#27ae60" />
              <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
            </Animated.View>
            <Animated.View
              style={[styles.overlayBadge, styles.nopeBadge, { opacity: (animatedStyle as any)?.nopeOpacity }]}
            >
              <MaterialIcons name="close" size={24} color="#e74c3c" />
              <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
            </Animated.View>
            <Animated.View
              style={[styles.superBadge, { opacity: (animatedStyle as any)?.superOpacity, transform: [{ scale: (animatedStyle as any)?.superScale || 1 }] }]}
            >
              <MaterialIcons name="favorite" size={64} color="#2980b9" />
              <Text style={[styles.overlayText, styles.superText]}>SUPER LIKE</Text>
            </Animated.View>
          </View>
        ) : null}
        <LinearGradient colors={["transparent", COLORS.overlay]} style={styles.gradient}>
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>
                {profile.name}
                {profile.age ? `, ${profile.age}` : ""}
              </Text>
              {profile.verified && (
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color={COLORS.blueCheck}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
            <View style={styles.badgeRow}>
              {profile.pronouns && (
                <View style={[styles.pill, styles.pronounPill]}>
                  <Text style={styles.pronounPillText}>{profile.pronouns}</Text>
                </View>
              )}
              {profile.occupation && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{profile.occupation}</Text>
                </View>
              )}
              {profile.distance !== undefined && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{profile.distance} km away</Text>
                </View>
              )}
            </View>
            {profile.bio ? (
              <Text numberOfLines={3} style={styles.bioText}>
                {profile.bio}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
});

ProfileCard.displayName = 'ProfileCard';

// Custom comparison to ensure re-render when profile changes
const arePropsEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.profile._id === nextProps.profile._id &&
    prevProps.index === nextProps.index &&
    prevProps.isCurrent === nextProps.isCurrent
  );
};

const MemoizedProfileCard = React.memo(ProfileCard, arePropsEqual);

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState("");
  const [swiping, setSwiping] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  
  const [, forceUpdate] = useState(0); // Force update trigger

  // Refs để giữ giá trị ổn định
  const position = useRef(new Animated.ValueXY()).current;
  const hasFetchedRef = useRef(false);
  const profilesRef = useRef<Profile[]>([]);
  const swipingRef = useRef(false);
  const frozenVisibleProfilesRef = useRef<Profile[]>([]); // Freeze visible profiles during swipe
  const lastIntentRef = useRef<SwipeAction | null>(null); // Track last intent for haptics

  // Sync profiles với ref
  useEffect(() => {
    profilesRef.current = profiles;
    
    // LOG: Mỗi khi profiles thay đổi
    if (profiles.length > 0) {
      console.log('📊 PROFILES STATE CHANGED - Current top 3:');
      profiles.slice(0, 3).forEach((p, i) => {
        console.log(`  [${i}] ${p.name} (ID: ${p._id})`);
      });
    }
  }, [profiles]);

  // Sync swiping với ref
  useEffect(() => {
    swipingRef.current = swiping;
  }, [swiping]);

  // Fetch profiles only once
  useEffect(() => {
    fetchProfiles();
  }, []);

  // DEBUG: Detect unexpected profile changes (allow expected shift after swipe)
  const prevProfilesRef = useRef<Profile[]>([]);
  useEffect(() => {
    if (!hasFetchedRef.current) {
      prevProfilesRef.current = profiles;
      return;
    }

    const prev = prevProfilesRef.current;
    const prevIds = prev.map((p) => p._id).join(',');
    const expectedAfterSwipeIds = prev.slice(1).map((p) => p._id).join(',');
    const currentIds = profiles.map((p) => p._id).join(',');

    // Only warn if we're NOT swiping and the change isn't the expected shift
    if (!swipingRef.current && prev.length > 0) {
      const isExpectedShift = currentIds === expectedAfterSwipeIds;
      const isNoChange = currentIds === prevIds;
      if (!isExpectedShift && !isNoChange) {
        console.warn('⚠️ WARNING: Profiles might be changing from external source!');
        console.warn('This could be: WebSocket, another useEffect, or state management');
      }
    }

    prevProfilesRef.current = profiles;
  }, [profiles]);

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Swipe intent overlays (show around 50% of threshold)
  const likeOpacity = useMemo(
    () => position.x.interpolate({
      inputRange: [0, SWIPE_H_THRESHOLD * 0.5, SWIPE_H_THRESHOLD],
      outputRange: [0, 0.6, 1],
      extrapolate: "clamp",
    }),
    [position.x]
  );
  const nopeOpacity = useMemo(
    () => position.x.interpolate({
      inputRange: [-SWIPE_H_THRESHOLD, -SWIPE_H_THRESHOLD * 0.5, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: "clamp",
    }),
    [position.x]
  );
  const superOpacity = useMemo(
    () => position.y.interpolate({
      inputRange: [-SWIPE_V_THRESHOLD, -SWIPE_V_THRESHOLD * 0.5, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: "clamp",
    }),
    [position.y]
  );
  const superScale = useMemo(
    () => position.y.interpolate({
      inputRange: [-SWIPE_V_THRESHOLD, 0],
      outputRange: [1.08, 0.9],
      extrapolate: "clamp",
    }),
    [position.y]
  );

  const fetchProfiles = async (force = false) => {
    if (hasFetchedRef.current && !force) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setScreenError("");
    setToast(null);
    try {
      const response: ProfilesApiResponse = await discoveryService.getProfiles(25);
      const nextProfiles = response?.data?.profiles || [];
      
      // LOG: Kiểm tra profiles từ API
      console.log('🌐 FETCHED from API - First 5 profiles:');
      nextProfiles.slice(0, 5).forEach((p, i) => {
        console.log(`  [${i}] ${p.name} (ID: ${p._id})`);
      });
      
      // Kiểm tra trùng lặp
      const ids = nextProfiles.map(p => p._id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('⚠️ DUPLICATE IDs detected in profiles!');
      }
      
      setProfiles(nextProfiles);
      hasFetchedRef.current = true;
      if (!nextProfiles.length) {
        setScreenError("Không còn hồ sơ mới, thử lại sau nhé!");
      }
    } catch (err) {
      setScreenError(parseErrorMessage(err, "Không thể tải danh sách."));
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = useCallback(async (action: SwipeAction) => {
    const activeProfile = profilesRef.current[0];
    if (swipingRef.current || !activeProfile) return;

    // LOG: Trước khi swipe
    console.log('🎯 BEFORE SWIPE:');
    console.log(`  Swiping: ${activeProfile.name} (ID: ${activeProfile._id})`);
    console.log(`  Card #2 (behind): ${profilesRef.current[1]?.name || 'N/A'} (ID: ${profilesRef.current[1]?._id || 'N/A'})`);
    console.log(`  Card #3: ${profilesRef.current[2]?.name || 'N/A'} (ID: ${profilesRef.current[2]?._id || 'N/A'})`);

    // CRITICAL: Freeze the current visible profiles BEFORE any state change
    frozenVisibleProfilesRef.current = profilesRef.current.slice(0, 3);
    
    setSwiping(true);

    try {
      const response: SwipeApiResponse = await discoveryService.swipe(
        activeProfile._id,
        action
      );

      const messageMap: Record<SwipeAction, string> = {
        like: `Đã thích ${activeProfile.name}!`,
        pass: `Đã bỏ qua ${activeProfile.name}.`,
        superlike: `Superlike ${activeProfile.name}! 💫`,
      };

      const message = response?.data?.isMatch 
        ? `Bạn đã match với ${activeProfile.name}! 🔥`
        : messageMap[action];

      // Wait for animation to complete before updating state
      setTimeout(() => {
        frozenVisibleProfilesRef.current = []; // Unfreeze
        setProfiles((prev) => {
          const newProfiles = prev.slice(1);
          
          // LOG: Sau khi swipe
          console.log('✅ AFTER SWIPE:');
          console.log(`  NEW Card #1: ${newProfiles[0]?.name || 'N/A'} (ID: ${newProfiles[0]?._id || 'N/A'})`);
          console.log(`  NEW Card #2: ${newProfiles[1]?.name || 'N/A'} (ID: ${newProfiles[1]?._id || 'N/A'})`);
          console.log(`  NEW Card #3: ${newProfiles[2]?.name || 'N/A'} (ID: ${newProfiles[2]?._id || 'N/A'})`);
          
          return newProfiles;
        });
        position.setValue({ x: 0, y: 0 });
        showToast("success", message);
        setSwiping(false);
        forceUpdate(v => v + 1); // Force re-render
      }, 350);

    } catch (err) {
      frozenVisibleProfilesRef.current = []; // Unfreeze on error
      showToast("error", parseErrorMessage(err, "Có lỗi khi swipe."));
      setSwiping(false);
      forceUpdate(v => v + 1);
    }
  }, [position, showToast]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
          const absX = Math.abs(gesture.dx);
          const absY = Math.abs(gesture.dy);
          return absX > 15 || absY > 15;
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
          // Haptic feedback when crossing intent thresholds (~50%)
          const halfRight = SWIPE_H_THRESHOLD * 0.5;
          const halfUp = SWIPE_V_THRESHOLD * 0.5;
          let intent: SwipeAction | null = null;
          if (gesture.dx > halfRight) intent = "like";
          else if (gesture.dx < -halfRight) intent = "pass";
          else if (gesture.dy < -halfUp) intent = "superlike";
          else intent = null;
          if (intent !== lastIntentRef.current) {
            lastIntentRef.current = intent;
            if (intent) {
              Haptics.selectionAsync().catch(() => {});
            }
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_H_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            Animated.spring(position, {
              toValue: { x: SCREEN_WIDTH + 120, y: gesture.dy },
              useNativeDriver: false,
            }).start(() => handleSwipe("like"));
          } else if (gesture.dx < -SWIPE_H_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            Animated.spring(position, {
              toValue: { x: -SCREEN_WIDTH - 120, y: gesture.dy },
              useNativeDriver: false,
            }).start(() => handleSwipe("pass"));
          } else if (gesture.dy < -SWIPE_V_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            Animated.spring(position, {
              toValue: { x: gesture.dx, y: -SCREEN_HEIGHT - 120 },
              useNativeDriver: false,
            }).start(() => handleSwipe("superlike"));
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          }
          lastIntentRef.current = null;
        },
      }),
    [handleSwipe, position]
  );

  // CRITICAL: Always check frozen first, ignore state updates during swipe
  const visibleProfiles = frozenVisibleProfilesRef.current.length > 0 
    ? frozenVisibleProfilesRef.current 
    : profiles.slice(0, 3);

  const renderProfileCard = useCallback((profile: Profile, index: number) => {
    const isCurrent = index === 0;

    return (
      <MemoizedProfileCard
        key={profile._id}
        profile={profile}
        index={index}
        isCurrent={isCurrent}
        panHandlers={isCurrent ? panResponder.panHandlers : undefined}
        animatedStyle={
          isCurrent
            ? {
                transform: position.getTranslateTransform(),
                likeOpacity,
                nopeOpacity,
                superOpacity,
                superScale,
              }
            : undefined
        }
      />
    );
  }, [panResponder.panHandlers, position, likeOpacity, nopeOpacity, superOpacity, superScale]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centeredText}>Đang tải danh sách...</Text>
        </View>
      );
    }

    if (screenError) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.error} />
          <Text style={[styles.centeredText, { color: COLORS.error, marginTop: 12 }]}>
            {screenError}
          </Text>
          <Text style={styles.retryText} onPress={() => fetchProfiles(true)}>
            Thử lại (tải lại)
          </Text>
        </View>
      );
    }

    if (!visibleProfiles.length) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="sentiment-dissatisfied" size={56} color={COLORS.primary} />
          <Text style={styles.centeredText}>Hết profile để lướt rồi!</Text>
          <Text style={styles.retryText} onPress={() => fetchProfiles(true)}>
            Tải thêm
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.stackContainer}>
        {visibleProfiles.map((profile, idx) => {
          // Use stable key to prevent re-render of cards that haven't changed position
          return (
            <React.Fragment key={profile._id}>
              {renderProfileCard(profile, idx)}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderContent()}
      {toast ? (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <MaterialIcons
            name={toast.type === "success" ? "check-circle" : "error-outline"}
            size={20}
            color={toast.type === "success" ? COLORS.success : COLORS.error}
          />
          <Text
            style={[
              styles.toastText,
              { color: toast.type === "success" ? COLORS.success : COLORS.error },
            ]}
          >
            {toast.message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    padding: 16,
  },
  overlayBadge: {
    position: "absolute",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  likeBadge: {
    top: 24,
    left: 24,
    transform: [{ rotate: "-15deg" }],
  },
  nopeBadge: {
    top: 24,
    right: 24,
    transform: [{ rotate: "15deg" }],
  },
  superBadge: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(41, 128, 185, 0.12)",
    borderRadius: 48,
    padding: 12,
  },
  overlayText: {
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: 1,
  },
  likeText: {
    color: "#27ae60",
  },
  nopeText: {
    color: "#e74c3c",
  },
  superText: {
    color: "#2980b9",
    fontSize: 12,
    textAlign: "center",
  },
  stackContainer: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "90%",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: "hidden",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: 24,
  },
  gradient: {
    padding: 20,
    borderRadius: 24,
  },
  infoContainer: {
    marginTop: "auto",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  pill: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  pronounPill: {
    backgroundColor: COLORS.secondary,
  },
  pronounPillText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  bioText: {
    color: COLORS.white,
    marginTop: 12,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredText: {
    color: COLORS.text,
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  retryText: {
    color: COLORS.primary,
    marginTop: 12,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 24,
    zIndex: 1000,
  },
  toastSuccess: {
    backgroundColor: "#E8F8F0",
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  toastError: {
    backgroundColor: "#FDEDEC",
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  toastText: {
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 15,
  },
});