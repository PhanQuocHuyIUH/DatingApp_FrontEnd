import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Import icons
import { FontAwesome, Ionicons } from "@expo/vector-icons";

// --- Bảng màu mới ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  accent: "#cc5073", // Màu nhấn
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  black: "#000000",
  facebook: "#1877F2",
};
// ----------------------

export default function AuthIndexScreen() {
  const handleLogin = () => {
    router.replace("/(main)");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Phần logo và tiêu đề */}
      <View style={styles.headerContainer}>
        <View style={styles.logoSuperOuter}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <FontAwesome name="heart" size={50} color={COLORS.white} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>Chilling Date</Text>
        <Text style={styles.slogan}>
          Where Hearts Connect, Love Finds Its Sync.
        </Text>
      </View>

      {/* Phần các nút đăng nhập */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleLogin}
        >
          <FontAwesome
            name="apple"
            size={22}
            color={COLORS.white}
            style={styles.icon}
          />
          <Text style={[styles.buttonText, styles.appleButtonText]}>
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={handleLogin}
        >
          <FontAwesome
            name="facebook-square"
            size={22}
            color={COLORS.white}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.phoneButton]}
          onPress={handleLogin}
        >
          <Ionicons
            name="keypad-outline"
            size={22}
            color={COLORS.white}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Use phone number</Text>
        </TouchableOpacity>
      </View>

      {/* Phần footer text */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          By signing up you agree to our{" "}
          <Text style={styles.linkText}>Terms and Conditions</Text>
        </Text>
        <Text style={styles.footerText}>
          See how we use your data in our{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32, // Tăng lề hai bên
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    width: "100%",
  },
  // --- Logo Styles ---
  logoSuperOuter: {
    // Vòng 1 (Ngoài cùng - MỚI)
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.secondary, // Màu hồng nhạt
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Di chuyển marginBottom ra ngoài cùng
  },
  logoOuter: {
    // Vòng 2 (Ở giữa)
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accent, // Thêm vòng màu trắng để tách biệt
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    // Vòng 3 (Trong cùng)
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary, // Màu đỏ đô
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  // --- Button Styles ---
  buttonContainer: {
    width: "90%",
    marginTop: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  appleButton: {
    backgroundColor: COLORS.black,
  },
  appleButtonText: {
    color: COLORS.white,
  },
  facebookButton: {
    backgroundColor: COLORS.facebook, // Giữ màu gốc của Facebook
  },
  phoneButton: {
    backgroundColor: COLORS.primary, // Màu đỏ đô
  },
  // --- Footer Styles ---
  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: "underline",
    fontWeight: "600",
    color: COLORS.primary,
  },
});
