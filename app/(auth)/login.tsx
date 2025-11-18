import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from "../../services/authService";

// Animated Cupid Component - Baby angel with bow and arrow
const AnimatedCupid = () => {
  const armAnim = useRef(new Animated.Value(0)).current;
  const legAnim = useRef(new Animated.Value(0)).current;
  const wingAnim = useRef(new Animated.Value(0)).current;
  const bowAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Halo floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Arm movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(armAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(armAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Leg movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(legAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(legAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wing flapping
    Animated.loop(
      Animated.sequence([
        Animated.timing(wingAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(wingAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bow pulling
    Animated.loop(
      Animated.sequence([
        Animated.timing(bowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(bowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [armAnim, legAnim, wingAnim, bowAnim, haloAnim]);

  const leftArmRotate = armAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  const rightArmRotate = armAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  const leftLegRotate = legAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const rightLegRotate = legAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg'],
  });

  const wingScale = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const bowPull = bowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const haloFloat = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  const haloRotate = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={styles.cupidContainer}>
      {/* Floating Halo - golden ring above head */}
      <Animated.View
        style={[
          styles.halo,
          {
            transform: [
              { translateY: haloFloat },
              { rotate: haloRotate },
            ],
          },
        ]}
      >
        <View style={styles.haloInner} />
      </Animated.View>
      {/* Wings - behind body */}
      <Animated.View style={[styles.wingsContainer, { transform: [{ scale: wingScale }] }]}>
        <View style={styles.leftWing}>
          {/* Wing feathers - layered effect */}
          <View style={[styles.wingFeatherLarge, { top: 0, left: 0 }]} />
          <View style={[styles.wingFeatherMedium, { top: 16, left: 4 }]} />
          <View style={[styles.wingFeatherSmall, { top: 32, left: 8 }]} />
        </View>
        <View style={styles.rightWing}>
          {/* Wing feathers - layered effect */}
          <View style={[styles.wingFeatherLarge, { top: 0, right: 0 }]} />
          <View style={[styles.wingFeatherMedium, { top: 16, right: 4 }]} />
          <View style={[styles.wingFeatherSmall, { top: 32, right: 8 }]} />
        </View>
      </Animated.View>

      {/* Head - baby face */}
      <View style={styles.cupidHead}>
        <View style={styles.face}>
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <View style={styles.eye}>
              <View style={styles.eyeball} />
            </View>
            <View style={styles.eye}>
              <View style={styles.eyeball} />
            </View>
          </View>
          {/* Smile */}
          <View style={styles.smile} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.cupidBody}>
        {/* Chest/torso */}
        <View style={styles.torso} />
        
        {/* Left arm with bow */}
        <Animated.View style={[styles.leftArm, { transform: [{ rotate: leftArmRotate }] }]}>
          <View style={styles.arm} />
          <View style={styles.hand}>
            <View style={styles.bow}>
              {/* Bow limbs */}
              <View style={styles.bowUpperLimb} />
              <View style={styles.bowLowerLimb} />
              {/* Bow riser (handle) */}
              <View style={styles.bowRiser} />
              {/* Bow string */}
              <View style={styles.bowString} />
            </View>
          </View>
        </Animated.View>

        {/* Right arm pulling arrow */}
        <Animated.View style={[styles.rightArm, { transform: [{ rotate: rightArmRotate }, { translateX: bowPull }] }]}>
          <View style={styles.arm} />
          <View style={styles.hand}>
            <View style={styles.arrow}>
              <View style={styles.arrowShaft} />
              <View style={styles.arrowHead} />
              <MaterialCommunityIcons name="heart" size={16} color="#FF1744" style={styles.arrowHeart} />
            </View>
          </View>
        </Animated.View>

        {/* Left leg */}
        <Animated.View style={[styles.leftLeg, { transform: [{ rotate: leftLegRotate }] }]}>
          <View style={styles.leg} />
          <View style={styles.foot} />
        </Animated.View>

        {/* Right leg */}
        <Animated.View style={[styles.rightLeg, { transform: [{ rotate: rightLegRotate }] }]}>
          <View style={styles.leg} />
          <View style={styles.foot} />
        </Animated.View>
      </View>

      {/* Floating hearts around cupid */}
      <MaterialCommunityIcons name="heart" size={24} color="#FFB6C1" style={styles.floatingHeart1} />
      <MaterialCommunityIcons name="heart" size={20} color="#FFB6C1" style={styles.floatingHeart2} />
      <MaterialCommunityIcons name="heart" size={16} color="#FFB6C1" style={styles.floatingHeart3} />
    </View>
  );
};

const COLORS = {
  primary: "#b21e46",
  secondary: "#fae0e7",
  accent: "#cc5073",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
  console.log("Login button pressed");
  setLoading(true);

  try {
    const result = await authService.login(email, password);
    console.log("Login result:", result);

    if (Platform.OS === 'web') {
      window.alert(result.message);
    } else {
      Alert.alert("Success", result.message, [
        { text: "OK", onPress: () => router.replace("/(main)") },
      ]);
    }

    router.replace("/(main)");
  } catch (error: any) {
    console.log("Login failed:", error.message);

    if (Platform.OS === 'web') {
      window.alert(error.message);
    } else {
      Alert.alert("Error", error.message || "Login failed");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#fef5f7', '#fce9ed']}
        style={styles.gradientBackground}
      >
        <AnimatedCupid />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: 120,
            },
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#fefefe']}
            style={styles.formCard}
          >
            <Text style={styles.subtitle}>Login to continue</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              loading && styles.loginButtonDisabled,
              pressed && styles.loginButtonPressed,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </Pressable>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </Pressable>
          </View>
          </LinearGradient>
        </Animated.View>
      </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradientBackground: {
    flex: 1,
  },
  cupidContainer: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 10,
    alignItems: 'center',
    width: 200,
    height: 240,
  },
  // Halo
  halo: {
    position: 'absolute',
    top: -30,
    width: 80,
    height: 24,
    borderWidth: 6,
    borderColor: '#FFD700',
    borderRadius: 40,
    backgroundColor: 'transparent',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  haloInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 2,
    borderColor: '#FFF4CC',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  // Wings
  wingsContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    width: 160,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  leftWing: {
    position: 'relative',
    width: 60,
    height: 70,
    transform: [{ rotate: '-25deg' }],
  },
  rightWing: {
    position: 'relative',
    width: 60,
    height: 70,
    transform: [{ rotate: '25deg' }],
  },
  wingFeatherLarge: {
    position: 'absolute',
    width: 44,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  wingFeatherMedium: {
    position: 'absolute',
    width: 36,
    height: 28,
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: '#F5F5F5',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  wingFeatherSmall: {
    position: 'absolute',
    width: 28,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  // Head
  cupidHead: {
    position: 'relative',
    zIndex: 3,
    alignItems: 'center',
  },
  face: {
    width: 56,
    height: 56,
    backgroundColor: '#FFE4E1',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 32,
    marginTop: 12,
  },
  eye: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeball: {
    width: 6,
    height: 6,
    backgroundColor: '#4169E1',
    borderRadius: 4,
  },
  smile: {
    width: 20,
    height: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF69B4',
    marginTop: 4,
  },
  // Body
  cupidBody: {
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
    marginTop: 4,
  },
  torso: {
    width: 48,
    height: 56,
    backgroundColor: '#FFE4E1',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  // Arms
  leftArm: {
    position: 'absolute',
    top: 10,
    left: -16,
    transformOrigin: 'top',
  },
  rightArm: {
    position: 'absolute',
    top: 10,
    right: -16,
    transformOrigin: 'top',
  },
  arm: {
    width: 16,
    height: 40,
    backgroundColor: '#FFE4E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  hand: {
    width: 20,
    height: 20,
    backgroundColor: '#FFE4E1',
    borderRadius: 10,
    marginTop: -4,
    marginLeft: -2,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  // Bow and Arrow
  bow: {
    width: 40,
    height: 56,
    position: 'relative',
    left: -20,
    top: -16,
  },
  bowUpperLimb: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 6,
    height: 24,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    transform: [{ rotate: '-15deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  bowLowerLimb: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    width: 6,
    height: 24,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    transform: [{ rotate: '15deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  bowRiser: {
    position: 'absolute',
    top: 22,
    left: 14,
    width: 10,
    height: 12,
    backgroundColor: '#654321',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  bowString: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 2,
    height: 44,
    backgroundColor: '#D2B48C',
    borderRadius: 1,
  },
  arrow: {
    width: 50,
    height: 6,
    position: 'relative',
    left: 10,
    top: 4,
  },
  arrowShaft: {
    width: 40,
    height: 4,
    backgroundColor: '#8B4513',
    position: 'absolute',
    left: 0,
  },
  arrowHead: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#C0C0C0',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowHeart: {
    position: 'absolute',
    right: -12,
    top: -6,
  },
  // Legs
  leftLeg: {
    position: 'absolute',
    bottom: -30,
    left: 12,
    transformOrigin: 'top',
  },
  rightLeg: {
    position: 'absolute',
    bottom: -30,
    right: 12,
    transformOrigin: 'top',
  },
  leg: {
    width: 14,
    height: 28,
    backgroundColor: '#FFE4E1',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  foot: {
    width: 16,
    height: 12,
    backgroundColor: '#FFE4E1',
    borderRadius: 8,
    marginTop: -4,
    marginLeft: -1,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  // Floating hearts
  floatingHeart1: {
    position: 'absolute',
    top: 30,
    right: -20,
    opacity: 0.7,
  },
  floatingHeart2: {
    position: 'absolute',
    top: 70,
    left: -16,
    opacity: 0.6,
  },
  floatingHeart3: {
    position: 'absolute',
    bottom: 20,
    right: -10,
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#b21e46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});