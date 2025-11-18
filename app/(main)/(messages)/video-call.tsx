import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  white: "#FFFFFF",
  textSecondary: "#E5E7EB", // Trắng mờ
  darkTransparent: "rgba(0, 0, 0, 0.4)", // Nền cho control
};

export default function VideoCallScreen() {
  const { userName, userAge, avatar } = useLocalSearchParams<{
    userName?: string;
    userAge?: string;
    avatar?: string;
  }>();

  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Simulate call connecting after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    router.back();
  };

  const user = {
    name: userName || "User",
    age: userAge,
    profilePhoto: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    avatar: avatar || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%D&auto=format&fit=crop&w=761&q=80",
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call Ended';
      default:
        return 'Calling...';
    }
  };
  return (
    <View style={styles.container}>
      {/* Đổi chữ trên thanh status bar sang màu trắng */}
      <StatusBar style="light" />

      {/* --- Cấu hình Stack (đã làm trong _layout) --- */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Ảnh nền (được làm mờ) --- */}
      <ImageBackground
        source={{ uri: user.profilePhoto }}
        style={styles.backgroundImage}
        blurRadius={10} // Độ mờ
      >
        {/* Lớp phủ làm tối ảnh */}
        <View style={styles.overlay} />

        {/* --- 1. Nút điều khiển trên cùng --- */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="chevron-down" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="more-vertical" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* --- 2. Thông tin người gọi --- */}
        <View style={styles.centerContainer}>
          <View style={[styles.avatarOuter, callStatus === 'connected' && styles.avatarConnected]}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            {callStatus === 'connected' && (
              <View style={styles.connectedBadge}>
                <MaterialCommunityIcons name="phone" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.nameText}>
            {user.name}{user.age ? `, ${user.age}` : ''}
          </Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {callStatus === 'calling' && (
            <View style={styles.callingAnimation}>
              <MaterialCommunityIcons name="phone-ring" size={20} color={COLORS.textSecondary} />
            </View>
          )}
        </View>

        {/* --- 3. Nút điều khiển dưới cùng --- */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <MaterialCommunityIcons
              name={isVideoOff ? "video-off-outline" : "video-outline"}
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? "mic-off-outline" : "mic-outline"} 
              size={30} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons
              name="camera-flip-outline"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <MaterialCommunityIcons
              name="phone-hangup"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Làm tối ảnh nền
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Đẩy xuống dưới notch
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.secondary, // Màu hồng nhạt
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
    position: 'relative',
  },
  avatarConnected: {
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  connectedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  callingAnimation: {
    marginTop: 16,
    opacity: 0.8,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.darkTransparent, // Nền đen mờ
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // Đẩy lên trên thanh home
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Trắng mờ
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary,
  },
  endCallButton: {
    backgroundColor: COLORS.primary, // Màu đỏ đô
  },
});