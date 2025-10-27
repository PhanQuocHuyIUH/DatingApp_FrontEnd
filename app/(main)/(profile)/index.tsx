import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  primaryLight: "#cc5073", // Đỏ đô nhạt
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  blueCheck: "#3B82F6", // Giữ màu xanh cho checkmark
};

// --- Dữ liệu giả cho bảng ---
const features = [
  { name: "Unlimited swipes", free: true, premium: true },
  { name: "Advanced filters", free: true, premium: true },
  { name: "Remove ads", free: false, premium: true },
  { name: "Undo accidental left swipes", free: false, premium: true },
  { name: "Push you profile to more viewers", free: false, premium: true },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("Plans");

  // Component cho Checkbox
  const Checkbox = ({ checked }: { checked: boolean }) => (
    <MaterialCommunityIcons
      name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
      size={24}
      color={checked ? COLORS.primary : COLORS.gray}
    />
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* --- Phần Profile Header --- */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              // Ảnh placeholder, bạn có thể thay bằng ảnh thật
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
            }}
            style={styles.avatar}
          />
          {/* Badge tiến độ */}
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>45% complete</Text>
          </View>
        </View>

        <Text style={styles.profileName}>
          Joshua Edwards, 29{" "}
          <MaterialIcons name="check-circle" size={20} color={COLORS.blueCheck} />
        </Text>

        <Link href="edit" asChild>
          <TouchableOpacity>
            <Text style={styles.editProfileLink}>
              Edit your profile <Feather name="chevron-right" size={16} />
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* --- Phần Verification Banner --- */}
      <TouchableOpacity style={styles.verificationBanner}>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={32}
          color={COLORS.primary}
          style={styles.bannerIcon}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>
            Verification adds an extra layer of...
          </Text>
          <Text style={styles.bannerSubtitle}>Verify your account now!</Text>
        </View>
        <Feather name="chevron-right" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* --- Phần Tabs (Plans / Safety) --- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Plans" && styles.activeTab]}
          onPress={() => setActiveTab("Plans")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Plans"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Safety" && styles.activeTab]}
          onPress={() => setActiveTab("Safety")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Safety"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Safety
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Nội dung Tab --- */}
      {activeTab === "Plans" && (
        <View>
          {/* Banner Premium */}
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumTitle}>HeartSync Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Unlock exclusive features and supercharge your dating experience.
            </Text>
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Upgrade from $7.99</Text>
            </TouchableOpacity>
          </View>

          {/* Bảng so sánh */}
          <View style={styles.tableContainer}>
            {/* Hàng Header */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCellName]}>
                Whats included
              </Text>
              <Text style={[styles.tableHeader, styles.tableCellCheck]}>Free</Text>
              <Text style={[styles.tableHeader, styles.tableCellCheck]}>
                Premium
              </Text>
            </View>
            {/* Hàng Dữ liệu */}
            {features.map((item, index) => (
              <View
                style={[
                  styles.tableRow,
                  index === features.length - 1 && styles.lastRow,
                ]}
                key={item.name}
              >
                <Text style={[styles.tableCell, styles.tableCellName]}>
                  {item.name}
                </Text>
                <View style={[styles.tableCell, styles.tableCellCheck]}>
                  <Checkbox checked={item.free} />
                </View>
                <View style={[styles.tableCell, styles.tableCellCheck]}>
                  <Checkbox checked={item.premium} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === "Safety" && (
        <View style={styles.safetyTab}>
          <Text style={styles.safetyText}>
            Safety information will be shown here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  // --- Profile Header ---
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  avatarContainer: {
    position: "relative",
    width: 120,
    height: 120,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    borderWidth: 5,
    borderColor: COLORS.primaryLight, // Vòng tròn bên ngoài
  },
  progressBadge: {
    position: "absolute",
    bottom: 5,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 15,
    alignItems: "center",
  },
  editProfileLink: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: "600",
  },
  // --- Verification Banner ---
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary, // Màu hồng nhạt
    borderRadius: 12,
    padding: 16,
    marginTop: 25,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
  // --- Tabs ---
  tabContainer: {
    flexDirection: "row",
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  inactiveTabText: {
    color: COLORS.textSecondary,
  },
  // --- Premium Banner ---
  premiumBanner: {
    backgroundColor: COLORS.primaryLight, // Màu đỏ đô nhạt
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 30,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: COLORS.primary, // Màu đỏ đô
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  premiumButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // --- Feature Table ---
  tableContainer: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableHeader: {
    fontWeight: "700",
    color: COLORS.text,
    padding: 12,
    fontSize: 14,
  },
  tableCell: {
    padding: 12,
  },
  tableCellName: {
    flex: 2,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  tableCellCheck: {
    flex: 0.7,
    alignItems: "center",
  },
  // --- Safety Tab ---
  safetyTab: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  safetyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});