import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Feather,
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6", // Màu nền cho input
  gray: "#E5E7EB",
  blueCheck: "#3B82F6",
};

// --- Dữ liệu giả (dựa trên ID) ---
const getChatData = (chatId: string) => {
  // Sau này, bạn sẽ dùng 'chatId' để fetch API
  return {
    id: "ava-jones",
    name: "Ava Jones",
    age: 25,
    pronouns: "she/ her/ hers",
    occupation: "Business Analyst at Tech",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D&auto=format&fit=crop&w=761&q=80",
  };
};

// --- Component Tin nhắn (của mình) ---
const MyMessageBubble = ({ text, time }: { text: string; time: string }) => (
  <View style={styles.myMessageContainer}>
    <View style={styles.myMessageBubble}>
      <Text style={styles.myMessageText}>{text}</Text>
    </View>
    <Text style={styles.messageTime}>{time}</Text>
  </View>
);

// --- Màn hình chính ---
export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const user = getChatData(chatId || "");
  const [message, setMessage] = useState("");

  // Hàm này sẽ điều hướng đến trang video call
  const onVideoCallPress = () => {
   router.push("video-call");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Tinh chỉnh offset
    >
      <StatusBar style="dark" />

      {/* --- Cấu hình Header --- */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            // Header Title tùy chỉnh
            <View style={styles.headerTitleContainer}>
              <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName}>
                  {user.name}, {user.age}{" "}
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={COLORS.blueCheck}
                  />
                </Text>
                <View style={styles.headerSubtitleRow}>
                  <Text style={styles.headerSubtitle}>{user.pronouns}</Text>
                  <Text style={[styles.headerSubtitle, { marginLeft: 8 }]}>
                    <FontAwesome name="briefcase" size={12} /> {user.occupation}
                  </Text>
                </View>
              </View>
              {/* Nút xem profile */}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push(`/discover/${user.id}`)}
              >
                <Feather name="chevron-right" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ),
          headerTitleAlign: "left",
          headerTitleStyle: { flex: 1 },
          // Header Right (Video, More)
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={onVideoCallPress}>
                <Feather name="video" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 16 }}>
                <Feather name="more-vertical" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* --- 1. Nội dung Chat --- */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <Text style={styles.dateSeparator}>Today</Text>
        <MyMessageBubble text="Hi there!" time="08:42 PM - Sent" />

        {/* Thêm các tin nhắn khác ở đây */}
      </ScrollView>

      {/* --- 2. Banner Mini-game --- */}
      <View style={styles.banner}>
        <Ionicons
          name="game-controller-outline"
          size={20}
          color={COLORS.primary}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>
            Invite your match to play a mini-game.
          </Text>
          <Text style={styles.bannerSubtitle}>
            Break the ice and find out if you both sync on a deeper level.
          </Text>
        </View>
      </View>

      {/* --- 3. Ô nhập tin nhắn --- */}
      <View style={styles.inputContainer}>
        {/* Hàng 1: Text Input */}
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons
              name="happy-outline"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {/* Hàng 2: Action Icons */}
        <View style={styles.actionRow}>
          <View style={styles.actionIconsLeft}>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="mic-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // --- Header Styles ---
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1, // Để chiếm không gian
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary, // Đổi màu
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  // --- Chat Body Styles ---
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateSeparator: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary, // Đổi màu
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4, // Góc bo
    maxWidth: "80%",
  },
  myMessageText: {
    color: COLORS.white,
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  // --- Banner Styles ---
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary, // Đổi màu
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary, // Đổi màu
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // --- Input Styles ---
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16, // Safe area
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  textInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100, // Giới hạn chiều cao khi gõ nhiều
  },
  emojiButton: {
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  actionIconsLeft: {
    flexDirection: "row",
  },
  actionIcon: {
    marginRight: 16,
  },
  sendButton: {
    // Thêm style cho nút send nếu muốn
  },
});