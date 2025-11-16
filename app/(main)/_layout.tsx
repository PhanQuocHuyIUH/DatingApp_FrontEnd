import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#b21e46",
  textSecondary: "#94A3B8",
  white: "#FFFFFF",
  gray: "#E5E7EB",
};

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.gray,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        // CRITICAL: Prevent tabs from unmounting when switching
        lazy: true, // Changed to true
        unmountOnBlur: false, // Don't unmount when tab loses focus
      }}
    >
      {/* Discover */}
      <Tabs.Screen
        name="(discover)"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Matches */}
      <Tabs.Screen
        name="(matches)/index"
        options={{
          title: "Matches",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Messages */}
      <Tabs.Screen
        name="(messages)"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}