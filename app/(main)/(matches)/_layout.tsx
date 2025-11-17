import React from "react";
import { Stack } from "expo-router";

export default function MatchesStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Matches",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Profile",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
