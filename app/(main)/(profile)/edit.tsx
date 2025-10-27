import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
  Entypo,
  SimpleLineIcons,
  FontAwesome5,
  AntDesign,
} from "@expo/vector-icons";

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  primaryLight: "#cc5073", // Đỏ đô nhạt
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  lightGray: "#F3F4F6", // Màu nền cho input, add button
};

// --- Component Row Tái sử dụng ---
// Dùng cho "My details", "Most people...", "Linked accounts"
type ProfileRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  label,
  value,
  onPress,
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    {icon}
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || "Add"}</Text>
    <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

// --- Component Pill Tái sử dụng ---
// Dùng cho "I enjoy", "I communicate in"
const Pill = ({ label }: { label: string }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
    <TouchableOpacity>
      <Feather name="x" size={14} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

// --- Component Dropdown Giả ---
// Dùng cho "I enjoy", "I communicate in"
const DropdownSelector = ({ label, icon }: { label: string, icon: React.ReactNode }) => (
  <TouchableOpacity style={styles.dropdown}>
    {icon}
    <Text style={styles.dropdownText}>{label}</Text>
    <Feather name="chevron-down" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

// --- Màn hình chính ---
export default function EditProfileScreen() {
  const completion = 45; // 45%

  return (
    <>
      {/* Đặt tiêu đề cho header của Stack */}
      <Stack.Screen options={{ title: "Edit Profile" }} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* --- Profile Completion --- */}
        <View style={styles.section}>
          <Text style={styles.completionText}>
            Profile completion: {completion}%
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${completion}%` }]}
            />
          </View>
        </View>

        {/* --- Photos --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>
            The main photo is how you appear to others on the swipe view.
          </Text>
          <View style={styles.photoGrid}>
            {/* Ảnh chính */}
            <View style={styles.mainPhotoContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG9tby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
                }}
                style={styles.mainPhoto}
              />
            </View>
            {/* 3 ô add ảnh */}
            <View style={styles.subPhotoContainer}>
              <TouchableOpacity style={styles.addPhotoBox}>
                <Feather name="plus" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoBox}>
                <Feather name="plus" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoBox}>
                <Feather name="plus" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- About Me --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About me</Text>
          <Text style={styles.sectionSubtitle}>
            Make it easy for others to get a sense of who you are.
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Share a few words about yourself, your interests, and what you're looking for in a connection..."
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* --- My Details --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My details</Text>
          <ProfileRow
            icon={
              <MaterialCommunityIcons
                name="file-document-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Occupation"
          />
          <ProfileRow
            icon={
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Gender & Pronouns"
            value="Male"
          />
          <ProfileRow
            icon={
              <FontAwesome
                name="graduation-cap"
                size={18}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Education"
          />
          <ProfileRow
            icon={
              <Entypo
                name="location-pin"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Location"
            value="NV 89104"
          />
        </View>

        {/* --- Most people also want to know: --- */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>
            Most people also want to know:
          </Text>
          <ProfileRow
            icon={
              <MaterialCommunityIcons
                name="ruler"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Height"
          />
          <ProfileRow
            icon={
              <MaterialCommunityIcons
                name="smoking"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Smoking"
          />
          <ProfileRow
            icon={
              <Entypo
                name="drink"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Drinking"
          />
          <ProfileRow
            icon={
              <MaterialCommunityIcons
                name="paw"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Pets"
          />
          <ProfileRow
            icon={
              <FontAwesome5
                name="child"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Children"
          />
          <ProfileRow
            icon={
              <MaterialCommunityIcons
                name="zodiac-aquarius"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Zodiac sign"
          />
          <ProfileRow
            icon={
              <SimpleLineIcons
                name="user"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Religion"
          />
        </View>

        {/* --- I enjoy --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I enjoy</Text>
          <Text style={styles.sectionSubtitle}>
            Adding your interest is a great way to find like-minded
            connections.
          </Text>
          <DropdownSelector label="Sci-fi movies" icon={<AntDesign name="tago" size={16} color={COLORS.textSecondary} style={styles.rowIcon} />} />
          <View style={styles.pillContainer}>
            <Pill label="Coffee brewing" />
            <Pill label="Trekking" />
          </View>
        </View>

        {/* --- I communicate in --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I communicate in</Text>
          <DropdownSelector label="English" icon={<Entypo name="globe" size={16} color={COLORS.textSecondary} style={styles.rowIcon} />} />
          <View style={styles.pillContainer}>
            <Pill label="Finnish" />
          </View>
        </View>

        {/* --- Linked accounts --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked accounts</Text>
          <ProfileRow
            icon={
              <AntDesign
                name="instagram"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Instagram"
          />
          <ProfileRow
            icon={
              <AntDesign
                name="facebook-square"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Facebook"
          />
          <ProfileRow
            icon={
              <AntDesign
                name="twitter"
                size={20}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            label="Twitter"
          />
        </View>
      </ScrollView>
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  // --- Completion Bar ---
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary, // Màu đỏ đô
    borderRadius: 4,
  },
  // --- Photos ---
  photoGrid: {
    flexDirection: "row",
    height: 320,
  },
  mainPhotoContainer: {
    flex: 0.65, // Chiếm 65%
    paddingRight: 8,
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  subPhotoContainer: {
    flex: 0.35, // Chiếm 35%
    flexDirection: "column",
    justifyContent: "space-between",
  },
  addPhotoBox: {
    width: "100%",
    aspectRatio: 1, // Để nó thành hình vuông
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderStyle: "dashed",
  },
  // --- About Me ---
  textInput: {
    height: 120,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: "top", // Cho Android
  },
  // --- Profile Row (Component) ---
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  rowIcon: {
    marginRight: 16,
    width: 20, // Đảm bảo icon chiếm không gian cố định
    textAlign: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  rowValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  // --- Dropdown Selector (Component) ---
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  // --- Pill (Component) ---
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary, // Màu hồng nhạt
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 14,
    color: COLORS.primary, // Màu đỏ đô
    fontWeight: '600',
    marginRight: 6,
  },
});