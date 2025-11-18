// app/(main)/(discover)/_layout.tsx

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { discoveryService } from "../../../services/discoveryService";

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
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    // Check if filters are active
    const checkFilters = () => {
      const filters = discoveryService.activeFilters || {};
      const hasFilters = Object.keys(filters).length > 0;
      setHasActiveFilters(hasFilters);
    };

    // Initial check
    checkFilters();

    // Listen for filter changes
    const handleFiltersApplied = () => {
      checkFilters();
    };

    const handleFiltersCleared = () => {
      setHasActiveFilters(false);
    };

    discoveryService.on('filtersApplied', handleFiltersApplied);
    discoveryService.on('filtersCleared', handleFiltersCleared);

    return () => {
      discoveryService.off('filtersApplied', handleFiltersApplied);
      discoveryService.off('filtersCleared', handleFiltersCleared);
    };
  }, []);

  const handleRefresh = () => {
    // Emit event to reload profiles
    discoveryService.emit('refreshRequested');
  };

  const handleClearFilters = () => {
    if (hasActiveFilters) {
      discoveryService.clearFilters();
    }
  };

  return (
    <Stack
      screenOptions={{
        // CRITICAL: Prevent screen from unmounting when navigating
        animation: "none", // Tắt animation để tránh remount
        gestureEnabled: false, // Disable swipe back gesture
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // Options cho Header
          headerTitle: "Chilling Date",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "700",
            color: COLORS.primary,
          },
          headerLeft: () => (
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={handleClearFilters}>
                {hasActiveFilters ? (
                  <MaterialCommunityIcons
                    name="filter-off"
                    size={26}
                    color={COLORS.primary}
                    style={{ marginRight: 16 }}
                  />
                ) : (
                  <Feather
                    name="menu"
                    size={26}
                    color={COLORS.textSecondary}
                    style={{ marginRight: 16 }}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRefresh}>
                <Ionicons
                  name="refresh"
                  size={26}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => router.push("/(main)/(discover)/filters")}>
                <Ionicons
                  name="options-outline"
                  size={26}
                  color={hasActiveFilters ? COLORS.primary : COLORS.textSecondary}
                />
                {hasActiveFilters && (
                  <View style={styles.filterBadge} />
                )}
              </TouchableOpacity>
            </View>
          ),
          headerShadowVisible: false,
          headerShown: true,
        }}
      />

      {/* --- MÀN HÌNH CHI TIẾT (KẾ THỪA HEADER) --- */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          // Prevent remount when navigating to detail
          animation: "slide_from_right",
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
    width: "40%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  filterBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});