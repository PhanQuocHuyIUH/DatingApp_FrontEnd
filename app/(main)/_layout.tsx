import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // <-- Vẫn cần cho các tab khác

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  textSecondary: "#94A3B8",
  white: "#FFFFFF",
  gray: "#E5E7EB",
};
// -----------------

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // BỎ tabBarActiveTintColor và tabBarInactiveTintColor ở đây
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.gray,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          // TẤT CẢ options đã bị xóa, vì discover/_layout.tsx
          // (file ở bước B) sẽ tự cung cấp
        }}
      />

      <Tabs.Screen
        name="matches"
        options={{
          // Giữ nguyên options cho tab này
          title: "Matches",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          // Giữ nguyên options cho tab này
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          // TẤT CẢ options đã bị xóa, vì profile/_layout.tsx
          // (file ở bước A) sẽ tự cung cấp
        }}
      />
    </Tabs>
  );
}