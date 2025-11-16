import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
const COLORS = {
  primary: "#b21e46",
  textSecondary: "#94A3B8",
};
export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="subcription"
        options={{
          headerShown: true,
          title: "Subscription",
        }}
      />
    </Stack>
  );
}
