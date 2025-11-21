import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "../../../services/authService";
import { userService } from "../../../services/userService";

const COLORS = {
  primary: "#FF6B9D",
  primaryDark: "#C92A6D",
  primaryLight: "#FFB4D5",
  secondary: "#FEF3F7",
  accent: "#FFD93D",
  text: "#2D3748",
  textSecondary: "#718096",
  white: "#FFFFFF",
  gray: "#E2E8F0",
  lightGray: "#F7FAFC",
  gradient1: ["#FF6B9D", "#C92A6D"],
  gradient2: ["#FFB4D5", "#FF6B9D"],
  gradient3: ["#FEF3F7", "#FFE8F3"],
  shadow: "rgba(201, 42, 109, 0.3)",
};

type ProfileInfoProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};
const ProfileInfo: React.FC<ProfileInfoProps> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    {icon}
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

type PillProps = {
  label: string;
};
const Pill: React.FC<PillProps> = ({ label }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

type UserProfile = {
  name: string;
  dob: string;
  location?: { city?: string };
  bio?: string;
  interests?: string[];
  occupation?: string;
  education?: string;
  pronouns?: string;
  height?: number;
  zodiac?: string;
  languages?: string[];
  photos?: { url: string; isMain?: boolean }[];
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const fetchProfile = async () => {
    try {
      const response = await userService.getMyProfile();
      type UserProfileResponse = {
        success: boolean;
        data: { user: UserProfile };
      };
      const typedResponse = response as UserProfileResponse;
      if (typedResponse.success) {
        setUser(typedResponse.data.user);
      } else {
        Alert.alert("Error", "Failed to fetch profile.");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert("Error", "An error occurred while fetching your profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
      // Animate on mount
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, scaleAnim])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/(auth)/login");
  };

  const getAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
        <TouchableOpacity onPress={fetchProfile}>
          <Text style={{ color: COLORS.primary, marginTop: 10 }}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mainPhoto =
    user.photos?.find((p) => p.isMain)?.url ||
    user.photos?.[0]?.url ||
    "https://placehold.co/400/fae0e7/b21e46?text=No+Photo";

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Profile",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={COLORS.gradient2 as any}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: mainPhoto }} style={styles.profileImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.imageOverlay}
              />
            </View>
            <Text style={styles.name}>
              {user.name}, {getAge(user.dob)}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={COLORS.white} />
              <Text style={styles.location}>
                {user.location?.city || "Unknown Location"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/(main)/(profile)/edit")}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={16} color={COLORS.white} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="heart" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>About Me</Text>
              </View>
              <Text style={styles.bio}>{user.bio || "No bio yet."}</Text>
            </View>

            {user.interests && user.interests.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="star" size={20} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Interests</Text>
                </View>
                <View style={styles.pillContainer}>
                  {(user.interests ?? []).map((interest, idx) => (
                    <Pill key={interest} label={interest} />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>My Details</Text>
              </View>
          {user.occupation && (
            <ProfileInfo
              icon={
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
              }
              label="Occupation"
              value={user.occupation}
            />
          )}
          {user.education && (
            <ProfileInfo
              icon={
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
              }
              label="Education"
              value={user.education}
            />
          )}
          {user.pronouns && (
            <ProfileInfo
              icon={
                <AntDesign name="user" size={20} color={COLORS.textSecondary} />
              }
              label="Pronouns"
              value={user.pronouns}
            />
          )}
          {user.height && (
            <ProfileInfo
              icon={
                <MaterialCommunityIcons
                  name="ruler"
                  size={20}
                  color={COLORS.textSecondary}
                />
              }
              label="Height"
              value={`${user.height} cm`}
            />
          )}
          {user.zodiac && (
            <ProfileInfo
              icon={
                <MaterialCommunityIcons
                  name="zodiac-aquarius"
                  size={20}
                  color={COLORS.textSecondary}
                />
              }
              label="Zodiac"
              value={user.zodiac}
            />
          )}
        </View>

            {user.languages && user.languages.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="language" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>I Communicate In</Text>
                </View>
                <View style={styles.pillContainer}>
                  {(user.languages ?? []).map((lang) => (
                    <Pill key={lang} label={lang} />
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    alignItems: "center",
    padding: 30,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 4,
    opacity: 0.95,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10,
  },
  bio: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: "auto",
    fontWeight: '600',
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  pill: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  pillText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },
});
