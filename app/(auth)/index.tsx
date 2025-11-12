import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#b21e46",
  secondary: "#fae0e7",
  accent: "#cc5073",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  black: "#000000",
  facebook: "#1877F2",
};

export default function AuthIndexScreen() {
  const handleAppleLogin = () => {
    Alert.alert("Coming Soon", "Apple login will be implemented soon");
  };

  const handleFacebookLogin = () => {
    Alert.alert("Coming Soon", "Facebook login will be implemented soon");
  };

  const handlePhoneLogin = () => {
    // Chuyển đến màn hình login với email/password
    router.push("/(auth)/login");
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
          onPress={handleAppleLogin}
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
          onPress={handleFacebookLogin}
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
          onPress={handlePhoneLogin}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={COLORS.white}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Sign in with Email</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.registerButtonText}>Create New Account</Text>
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
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    width: "100%",
  },
  logoSuperOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.facebook,
  },
  phoneButton: {
    backgroundColor: COLORS.primary,
  },
  registerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
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
