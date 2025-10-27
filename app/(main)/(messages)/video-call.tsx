import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  white: "#FFFFFF",
  textSecondary: "#E5E7EB", // Trắng mờ
  darkTransparent: "rgba(0, 0, 0, 0.4)", // Nền cho control
};

// --- Dữ liệu giả ---
const user = {
  name: "Ava Jones",
  // Ảnh nền (sẽ được làm mờ)
  profilePhoto:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  // Ảnh avatar (rõ nét)
  avatar:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D&auto=format&fit=crop&w=761&q=80",
};

export default function VideoCallScreen() {
  return (
    <View style={styles.container}>
      {/* Đổi chữ trên thanh status bar sang màu trắng */}
      <StatusBar style="light" />

      {/* --- Cấu hình Stack (đã làm trong _layout) --- */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Ảnh nền (được làm mờ) --- */}
      <ImageBackground
        source={{ uri: user.profilePhoto }}
        style={styles.backgroundImage}
        blurRadius={10} // Độ mờ
      >
        {/* Lớp phủ làm tối ảnh */}
        <View style={styles.overlay} />

        {/* --- 1. Nút điều khiển trên cùng --- */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="chevron-down" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="more-vertical" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* --- 2. Thông tin người gọi --- */}
        <View style={styles.centerContainer}>
          <View style={styles.avatarOuter}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.nameText}>{user.name}</Text>
          <Text style={styles.statusText}>Calling...</Text>
        </View>

        {/* --- 3. Nút điều khiển dưới cùng --- */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons
              name="camera-flip-outline"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="mic-off-outline" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={() => router.back()} // Nút tắt gọi sẽ đóng modal
          >
            <MaterialCommunityIcons
              name="phone-hangup"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Làm tối ảnh nền
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Đẩy xuống dưới notch
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.secondary, // Màu hồng nhạt
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.darkTransparent, // Nền đen mờ
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // Đẩy lên trên thanh home
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Trắng mờ
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    backgroundColor: COLORS.primary, // Màu đỏ đô
  },
});