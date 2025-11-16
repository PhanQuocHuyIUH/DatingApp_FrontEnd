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
} from "react-native";
import { authService } from "../../../services/authService";
import { userService } from "../../../services/userService";

const COLORS = {
  primary: "#b21e46",
  primaryLight: "#cc5073",
  secondary: "#fae0e7",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  lightGray: "#F3F4F6",
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
    }, [])
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Image source={{ uri: mainPhoto }} style={styles.profileImage} />
          <Text style={styles.name}>
            {user.name}, {getAge(user.dob)}
          </Text>
          <Text style={styles.location}>
            {user.location?.city || "Unknown Location"}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/(main)/(profile)/edit")}
          >
            <Feather name="edit-2" size={16} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>{user.bio || "No bio yet."}</Text>
        </View>

        {user.interests && user.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.pillContainer}>
              {(user.interests ?? []).map((interest) => (
                <Pill key={interest} label={interest} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Details</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>I Communicate In</Text>
            <View style={styles.pillContainer}>
              {(user.languages ?? []).map((lang) => (
                <Pill key={lang} label={lang} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.lightGray,
    paddingBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  location: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 15,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: "auto",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  pillText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
