import React, { useState, createContext, useContext } from "react";
import { Stack } from "expo-router";
import {
  TouchableOpacity,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  textSecondary: "#94A3B8",
  lightGray: "#F3F4F6",
  gray: "#E5E7EB",
  text: "#1F2937",
};

// Search Context
const SearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({ searchQuery: '', setSearchQuery: () => {} });

export const useSearch = () => useContext(SearchContext);

// Component Thanh Search đơn giản
const HeaderSearchBar = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => (
  <View style={styles.searchContainer}>
    <Ionicons
      name="search-outline"
      size={18}
      color={COLORS.textSecondary}
      style={styles.searchIcon}
    />
    <TextInput
      placeholder="Search name"
      placeholderTextColor={COLORS.textSecondary}
      style={styles.searchInput}
      value={value}
      onChangeText={onChange}
    />
    {value ? (
      <TouchableOpacity onPress={() => onChange('')}>
        <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default function MessagesStackLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            // --- Options cho Header ---
            title: "Messages",
            headerTitle: () => <HeaderSearchBar value={searchQuery} onChange={setSearchQuery} />,
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
    </SearchContext.Provider>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    height: 38,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    padding:8
  },
});