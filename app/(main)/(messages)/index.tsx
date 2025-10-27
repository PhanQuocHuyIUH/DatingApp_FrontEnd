import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  online: "#22C55E", // Xanh lá
  offline: "#94A3B8", // Xám
  away: "#F59E0B", // Vàng
};

// --- Dữ liệu giả ---
const matches = [
  {
    id: "1",
    name: "Maria",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "online",
  },
  {
    id: "2",
    name: "Anna",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "offline",
  },
  {
    id: "3",
    name: "Jennifer",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    status: "away",
  },
  {
    id: "4",
    name: "Charlie",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    status: "online",
  },
  {
    id: "5",
    name: "Sarah",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    status: "offline",
  },
];

const chats = [
  {
    id: "ava-jones", // Sẽ dùng cho dynamic route
    name: "Ava Jones",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D&auto=format&fit=crop&w=761&q=80",
    lastMessage: "You: Hello!",
    time: "1 hours ago",
    status: "online",
  },
  // Thêm các chat khác ở đây nếu muốn
];

// --- Component cho Avatar (Matches) ---
const MatchAvatar = ({ item }: { item: (typeof matches)[0] }) => {
  const statusColor =
    item.status === "online"
      ? COLORS.online
      : item.status === "away"
      ? COLORS.away
      : COLORS.offline;

  return (
    <TouchableOpacity style={styles.matchItem}>
      <Image source={{ uri: item.avatar }} style={styles.matchAvatar} />
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      <Text style={styles.matchName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

// --- Component cho Hàng Chat ---
const ChatRow = ({ item }: { item: (typeof chats)[0] }) => {
  const statusColor =
    item.status === "online"
      ? COLORS.online
      : item.status === "away"
      ? COLORS.away
      : COLORS.offline;

  return (
    <Link href={item.id} asChild>
      <TouchableOpacity style={styles.chatRow}>
        {/* Ảnh và status */}
        <View style={styles.chatAvatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
          <View
            style={[
              styles.chatStatusIndicator,
              { backgroundColor: statusColor },
            ]}
          />
        </View>
        {/* Tên và tin nhắn */}
        <View style={styles.chatTextContainer}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {/* Thời gian */}
        <Text style={styles.chatTime}>{item.time}</Text>
      </TouchableOpacity>
    </Link>
  );
};

// --- Màn hình chính ---
export default function MessagesScreen() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* --- 1. Matches --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Matches ({matches.length})</Text>
        <FlatList
          data={matches}
          renderItem={({ item }) => <MatchAvatar item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
        />
      </View>

      {/* --- 2. Chats --- */}
      <View style={styles.section}>
        <View style={styles.chatHeader}>
          <Text style={styles.sectionTitle}>Chats ({chats.length})</Text>
          <TouchableOpacity>
            <Ionicons
              name="options-outline"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Nền hồng nhạt cho chat */}
        <View style={styles.chatListContainer}>
          <FlatList
            data={chats}
            renderItem={({ item }) => <ChatRow item={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Tắt cuộn của FlatList này
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // --- Styles cho Matches ---
  matchItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  matchAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.secondary, // Viền hồng nhạt
  },
  statusIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: "absolute",
    bottom: 20,
    right: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  matchName: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  // --- Styles cho Chats ---
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20, // sectionTitle đã có paddingLeft
  },
  chatListContainer: {
    backgroundColor: COLORS.secondary, // Nền hồng nhạt
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 8,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  chatAvatarContainer: {
    width: 50,
    height: 50,
  },
  chatAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  chatStatusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.secondary, // Nền hồng nhạt
  },
  chatTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  chatLastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: "flex-start", // Đặt ở trên cùng
    marginTop: 4,
  },
});