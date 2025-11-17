import { Stack } from "expo-router";
import React from "react";

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Profile",
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
