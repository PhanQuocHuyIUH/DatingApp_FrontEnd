// app/(main)/discover/index.tsx

import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  secondary: "#fae0e7",
  white: "#FFFFFF",
  text: "#1F2937",
  blueCheck: "#3B82F6",
};

// --- Dữ liệu giả ---
const user = {
  id: "ava-jones", // <-- ID để dùng cho link
  name: "Ava Jones",
  age: 25,
  pronouns: "she/ her/ hers",
  occupation: "Business Analyst at Tech",
  image:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D&auto=format&fit=crop&w=761&q=80",
};

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* --- Bọc thẻ bằng Link và TouchableOpacity --- */}
      {/* Sửa href để trỏ đến route động */}
      <Link href={user.id} asChild>
        <TouchableOpacity activeOpacity={0.9} style={styles.card}>
          <ImageBackground
            source={{ uri: user.image }}
            style={styles.imageBackground} // Style cho ImageBackground
            imageStyle={{ borderRadius: 20 }} // Giữ bo góc cho ảnh bên trong
          >
            {/* --- Lớp phủ hướng dẫn --- */}
            <View style={styles.instructionOverlay}>
              {/* Hướng dẫn trên */}
              <View style={styles.instructionTop}>
                <MaterialCommunityIcons
                  name="gesture-swipe-right"
                  size={40}
                  color={COLORS.white}
                  style={styles.iconShadow}
                />
                <Text style={styles.instructionTitle}>
                  Swipe right if you like
                </Text>
                <Text style={styles.instructionSubtitle}>
                  If the person also swipes right on you, it's a match and you
                  can connect.
                </Text>
              </View>
              {/* Đường kẻ giữa */}
              <View style={styles.divider} />
              {/* Hướng dẫn dưới */}
              <View style={styles.instructionBottom}>
                <Text style={styles.instructionTitle}>Swipe left to pass</Text>
                <Text style={styles.instructionSubtitle}>
                  If the person is not your cup of tea, simply pass. It's that
                  easy!
                </Text>
                <MaterialCommunityIcons
                  name="gesture-swipe-left"
                  size={40}
                  color={COLORS.white}
                  style={styles.iconShadow}
                />
              </View>
            </View>

            {/* --- Lớp phủ Gradient và Thông tin --- */}
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
                <View style={styles.pillContainer}>
                  <View style={[styles.pill, styles.pronounPill]}>
                    <Text style={styles.pronounPillText}>{user.pronouns}</Text>
                  </View>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{user.occupation}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#ccc",
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
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 14,
  },
  pronounPill: {
    backgroundColor: COLORS.secondary,
  },
  pronounPillText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  // --- Các style hướng dẫn (giữ nguyên) ---
  instructionOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  instructionTop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "20%",
  },
  instructionBottom: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: "20%",
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 20,
  },
  iconShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    marginVertical: 10,
  },
  divider: {
    width: "100%",
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});