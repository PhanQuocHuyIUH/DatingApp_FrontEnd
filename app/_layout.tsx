import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from 'react';
import { socketService } from "../services/socketService";

export default function RootLayout() {
  useEffect(() => {
    // Initialize socket once for the app lifecycle
    socketService.init().catch(() => {});
  }, []);
  return (
    <SafeAreaProvider>
      {/* SafeAreaView giúp đảm bảo mọi thứ không bị che bởi notch / status bar */}
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#fff" }, // nền mặc định
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eee",
  },
});
