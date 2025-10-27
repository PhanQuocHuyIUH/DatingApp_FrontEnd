// app/(main)/discover/[id].tsx

import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6", // Màu nền cho pill xám
  gray: "#E5E7EB",
  blueCheck: "#3B82F6",
};

// --- Dữ liệu giả (Sẽ dùng chung cho cả màn hình) ---
const user = {
  id: "ava-jones",
  name: "Ava Jones",
  age: 25,
  pronouns: "she/ her/ hers",
  occupation: "Business Analyst at Tech",
  location: "Las Vegas, NV 89104",
  distance: "2.0 kilometres away",
  about:
    "It would be wonderful to meet someone who appreciates the arts and enjoys exploring the vibrant culture of the city. I value open-mindedness, good communication, and a shared passion for classical music and fine arts. Also, mother of 2 cats ;)",
  details: [
    { icon: "ruler", label: "5'6\" (168 cm)" },
    { icon: "smoking-off", label: "Non-smoker" },
    { icon: "cat", label: "Cat lover" },
    { icon: "school-outline", label: "Master degree" },
    { icon: "account-child-outline", label: "Want two" },
    { icon: "glass-cocktail", label: "Occasionally" },
    { icon: "zodiac-virgo", label: "Virgo" },
    { icon: "magnify", label: "Relationship/ Friendship" },
    { icon: "account-alert-outline", label: "No religious affiliation" },
  ],
  enjoys: [
    "Classical Music & Art",
    "Thriller Films",
    "Nature",
    "Baking",
    "Asian Food",
    "Mathematics & Technology",
  ],
  languages: [
    "English (Native)",
    "Spanish (Fluent)",
    "Tagalog (Verbal)",
    "Mandarin Chinese (Verbal)",
  ],
  photos: [
    "https://images.unsplash.com/photo-1574719427318-54e1731816f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    "https://images.unsplash.com/photo-1574719427498-81c4e756910e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    "https://images.unsplash.com/photo-1574719427393-3b3b4f6e3c0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
  ],
};

// --- Component Pill Chi tiết (Màu hồng) ---
const InfoPill = ({ label, iconName }: { label: string; iconName: any }) => (
  <View style={styles.infoPill}>
    <MaterialCommunityIcons
      name={iconName}
      size={18}
      color={COLORS.primary}
      style={{ marginRight: 6 }}
    />
    <Text style={styles.infoPillText}>{label}</Text>
  </View>
);

// --- Component Pill Sở thích (Màu xám) ---
const InterestPill = ({ label }: { label: string }) => (
  <View style={styles.interestPill}>
    <Text style={styles.interestPillText}>{label}</Text>
  </View>
);

export default function ProfileDetailScreen() {
  const { width } = useWindowDimensions();
  // Lấy id từ URL, ví dụ "ava-jones"
  const { id } = useLocalSearchParams<{ id: string }>();

  // (Sau này bạn sẽ dùng 'id' để fetch data)
  // if (!user) return <Text>Loading profile for {id}...</Text>;

  const smallImageSize = (width - 20 * 2 - 12) / 2;
  const largeImageHeight = width * 1.25;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* --- 1. Ảnh chính & Thông tin (Giống card) --- */}
      <View style={[styles.card, { height: largeImageHeight }]}>
        <ImageBackground
          source={{ uri: user.photos[0] }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>
                {user.name}, {user.age}{" "}
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color={COLORS.blueCheck}
                />
              </Text>
              <View style={styles.pillRow}>
                <View style={[styles.pill, styles.pronounPill]}>
                  <Text style={styles.pronounPillText}>{user.pronouns}</Text>
                </View>
                <View style={styles.pill}>
                  <FontAwesome name="briefcase" size={14} color={COLORS.white} />
                  <Text style={styles.pillText}>{user.occupation}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* --- 2. Vị trí --- */}
      <View style={styles.section}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.distanceText}>{user.distance}</Text>
        </View>
        <Text style={styles.locationText}>{user.location}</Text>
      </View>

      {/* --- 3. About Me --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About me</Text>
        <Text style={styles.aboutText}>{user.about}</Text>
      </View>

      {/* --- 4. My Details --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My details</Text>
        <View style={styles.pillContainer}>
          {user.details.map((item) => (
            <InfoPill key={item.label} label={item.label} iconName={item.icon} />
          ))}
        </View>
      </View>

      {/* --- 5. I enjoy --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I enjoy</Text>
        <View style={styles.pillContainer}>
          {user.enjoys.map((item) => (
            <InterestPill key={item} label={item} />
          ))}
        </View>
      </View>

      {/* --- 6. I communicate in --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I communicate in</Text>
        <View style={styles.pillContainer}>
          {user.languages.map((item) => (
            <InterestPill key={item} label={item} />
          ))}
        </View>
      </View>

      {/* --- 7. Photo Gallery (Ảnh còn lại) --- */}
      <View style={styles.section}>
        <View style={styles.smallImageContainer}>
          <Image
            source={{ uri: user.photos[1] }}
            style={[
              styles.smallImage,
              { width: smallImageSize, height: smallImageSize },
            ]}
          />
          <Image
            source={{ uri: user.photos[2] }}
            style={[
              styles.smallImage,
              { width: smallImageSize, height: smallImageSize },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  // --- Ảnh chính ---
  card: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderRadius: 20,
    justifyContent: "flex-end",
  },
  infoContainer: {
    padding: 20,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 5,
  },
  pronounPill: {
    backgroundColor: COLORS.secondary,
  },
  pronounPillText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  // --- Các Section ---
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  // --- Vị trí ---
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 4,
  },
  // --- About ---
  aboutText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  // --- Pills ---
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoPill: { // Pill màu hồng
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 10,
  },
  infoPillText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  interestPill: { // Pill màu xám
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 10,
  },
  interestPillText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  // --- Ảnh nhỏ ---
  smallImageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  smallImage: {
    borderRadius: 16,
    backgroundColor: COLORS.gray,
  },
});