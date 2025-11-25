import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons, // Thêm MaterialIcons
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
// Có thể thêm import { BlurView } from 'expo-blur'; nếu muốn nút điều khiển trong suốt mờ

const { width, height } = Dimensions.get('window');

// --- Bảng màu Cải tiến ---
const COLORS = {
  primary: "#E94057", // Đỏ hồng hiện đại
  endCall: "#FF3B30", // Đỏ tươi cho nút kết thúc
  white: "#FFFFFF",
  textSecondary: "#E5E7EB", 
  darkOverlay: "rgba(0, 0, 0, 0.4)", 
  lightOverlay: "rgba(255, 255, 255, 0.2)", // Trắng mờ cho control buttons
  connectedBorder: "#4CD964", // Xanh lá cây
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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Thêm trạng thái loa ngoài
  const [callDuration, setCallDuration] = useState(0);

  // Giả lập kết nối sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Bộ đếm thời gian
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
    // Dùng cùng một ảnh cho cả Background và Avatar. Thêm ảnh placeholder nếu không có.
    profilePhoto: avatar || "https://picsum.photos/seed/person1/700/1000",
    avatar: avatar || "https://picsum.photos/seed/person2/120/120", 
  };

  // Giả lập ảnh Self-View (video của chính mình)
  const selfVideoUri = "https://picsum.photos/seed/selfie/200/300";

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call Ended';
      default:
        return 'Connecting...';
    }
  };
  
  // --- RENDERING ---
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Ảnh nền (Video của đối phương) --- */}
      <ImageBackground
        source={{ uri: user.profilePhoto }}
        style={styles.backgroundImage}
        blurRadius={callStatus === 'calling' ? 10 : 0} // Chỉ làm mờ khi đang gọi
      >
        {/* Lớp phủ làm tối ảnh */}
        <View style={[styles.overlay, callStatus === 'connected' && { backgroundColor: 'transparent' }]} />

        {/* Màn hình đen khi Video Off */}
        {isVideoOff && callStatus === 'connected' && (
            <View style={styles.videoOffScreen}>
                <MaterialIcons name="videocam-off" size={60} color={COLORS.lightOverlay} />
            </View>
        )}

        {/* --- 1. Top Controls (Nút điều khiển trên cùng) và Self-View --- */}
        <View style={styles.topContainer}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="chevron-down" size={28} color={COLORS.white} style={styles.shadowText} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="more-vertical" size={28} color={COLORS.white} style={styles.shadowText} />
            </TouchableOpacity>
          </View>
          
          {/* --- Self View (Video của chính mình) --- */}
          {callStatus === 'connected' && (
            <View style={styles.selfViewContainer}>
              <Image 
                source={{ uri: selfVideoUri }} 
                style={styles.selfViewImage}
              />
            </View>
          )}
        </View>

        {/* --- 2. Thông tin người gọi (Chỉ hiển thị khi đang Calling) --- */}
        {callStatus === 'calling' && (
          <View style={styles.centerContainer}>
            <View style={styles.avatarOuter}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            </View>
            <Text style={styles.nameText}>
              {user.name}{user.age ? `, ${user.age}` : ''}
            </Text>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <View style={styles.callingAnimation}>
              <MaterialCommunityIcons name="phone-ring" size={20} color={COLORS.textSecondary} />
            </View>
          </View>
        )}

        {/* --- 2B. Thông tin Connected (Thấp hơn một chút) --- */}
        {callStatus === 'connected' && (
          <View style={styles.connectedInfo}>
             <Text style={styles.nameTextSmall}>
              {user.name}{user.age ? `, ${user.age}` : ''}
            </Text>
            <Text style={styles.statusTextConnected}>{getStatusText()}</Text>
          </View>
        )}

        {/* --- 3. Nút điều khiển dưới cùng --- */}
        <View style={styles.bottomControls}>
          {/* Mute/Unmute */}
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? "mic-off" : "mic"} 
              size={28} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
          
          {/* Video On/Off */}
          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <MaterialCommunityIcons
              name={isVideoOff ? "video-off" : "video"}
              size={28}
              color={COLORS.white}
            />
          </TouchableOpacity>
          
          {/* Switch Camera */}
          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons
              name="camera-flip"
              size={28}
              color={COLORS.white}
            />
          </TouchableOpacity>
          
          {/* Speaker On/Off */}
          <TouchableOpacity 
            style={[styles.controlButton, !isSpeakerOn && styles.controlButtonActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
             <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-off"}
              size={28}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {/* End Call */}
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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Giữ lớp phủ tối khi đang calling
  },
  videoOffScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowText: {
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // --- TOP CONTAINER & SELF VIEW ---
  topContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  selfViewContainer: {
    width: 100, 
    height: 140, 
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: '#000',
  },
  selfViewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // --- CENTER (Calling) ---
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.lightOverlay, 
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 20,
    ...Platform.select({
      ios: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
      android: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
    })
  },
  statusText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...Platform.select({
      ios: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, },
      android: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, },
    })
  },
  callingAnimation: {
    marginTop: 16,
    opacity: 0.8,
  },

  // --- CONNECTED INFO (Bottom Center) ---
  connectedInfo: {
    position: 'absolute',
    bottom: height / 4, // Đặt thông tin thấp hơn một chút
    width: '100%',
    alignItems: 'center',
  },
  nameTextSmall: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    ...Platform.select({
      ios: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
      android: { textShadowColor: "rgba(0, 0, 0, 0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
    })
  },
  statusTextConnected: {
    fontSize: 18,
    color: COLORS.connectedBorder,
    fontWeight: '600',
    marginTop: 4,
  },

  // --- BOTTOM CONTROLS ---
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.darkOverlay, 
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === "ios" ? 40 : 15, 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  controlButton: {
    width: 56, // Giảm kích thước để chứa được nhiều nút hơn
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightOverlay, 
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary, // Màu sáng hơn cho trạng thái ON (ví dụ: mic on, video on)
  },
  endCallButton: {
    backgroundColor: COLORS.endCall, // Đỏ tươi nổi bật
    marginLeft: 10,
  },
});