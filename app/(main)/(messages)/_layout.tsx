import React from "react";
import { Stack } from "expo-router";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  textSecondary: "#94A3B8",
  lightGray: "#F3F4F6",
  gray: "#E5E7EB",
};

// Component Thanh Search
const HeaderSearchBar = () => (
  <View style={styles.searchContainer}>
    <Ionicons
      name="search-outline"
      size={20}
      color={COLORS.textSecondary}
      style={styles.searchIcon}
    />
    <TextInput
      placeholder="Search"
      placeholderTextColor={COLORS.textSecondary}
      style={styles.searchInput}
    />
  </View>
);

export default function MessagesStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // --- Options cho Tab Bar ---
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          // ---------------------------

          // --- Options cho Header ---
          headerTitle: () => <HeaderSearchBar />,
          headerTitleAlign: "left",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 16 }}>
              <Feather name="menu" size={26} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      />

      {/* Màn hình chat chi tiết (sẽ code sau) */}
      <Stack.Screen
        name="[chatId]"
        options={{
          headerShown: true, // Sẽ tùy chỉnh ở file [chatId].tsx
        }}
      />
      
      {/* Màn hình video call (sẽ code sau) */}
      <Stack.Screen
        name="video-call"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />

    </Stack>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginLeft: 10, // Dịch sang trái để vừa vặn
    marginRight: 10,
    height: 36,
  },
  searchIcon: {
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,

  },
});