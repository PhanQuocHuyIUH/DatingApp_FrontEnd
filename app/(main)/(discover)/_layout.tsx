// app/(main)/discover/_layout.tsx

import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  lightGray: "#F3F4F6",
  text: "#1F2937",
  textSecondary: "#6B7280",
};

// Component thanh Progress Bar
const HeaderProgressBar = () => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar} />
  </View>
);

export default function DiscoverStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // Options cho Tab Bar
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,

          // Options cho Header
          headerTitle: "Chilling Date",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "700",
            color: COLORS.primary,
          },
          headerLeft: () => (
            <View style={styles.headerIcons}>
              <TouchableOpacity>
                <Feather
                  name="menu"
                  size={26}
                  color={COLORS.textSecondary}
                  style={{ marginRight: 16 }}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons
                  name="refresh"
                  size={26}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("filters")}>
              <Ionicons
                name="options-outline"
                size={26}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
          headerBottom: () => <HeaderProgressBar />,
          headerShadowVisible: false,
          headerShown: true,
        }}
      />

      {/* --- MÀN HÌNH CHI TIẾT (KẾ THỪA HEADER) --- */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true, // Hiển thị header (sẽ dùng chung header của Stack)
        }}
      />
      {/* ------------------------------------------- */}

      <Stack.Screen
        name="filters"
        options={{
          title: "Filters",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: "row",
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.lightGray,
  },
  progressBar: {
    height: "100%",
    width: "40%", // Giả lập 40%
    backgroundColor: COLORS.primary, // Màu đỏ đô
    borderRadius: 2,
  },
});
