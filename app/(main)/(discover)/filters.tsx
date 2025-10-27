import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { router } from "expo-router";
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider"; // Thư viện slider

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46", // Đỏ đô
  secondary: "#fae0e7", // Hồng nhạt
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6", // Màu nền cho input, pill
  gray: "#E5E7EB",
};

// --- Component Checkbox Row ---
type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};
const CheckboxRow: React.FC<CheckboxRowProps> = ({
  label,
  checked,
  onToggle,
}) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
    <Text style={styles.checkboxLabel}>{label}</Text>
    <MaterialCommunityIcons
      name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
      size={24}
      color={checked ? COLORS.primary : COLORS.gray}
    />
  </TouchableOpacity>
);

// --- Component Pill Ngôn ngữ ---
const LanguagePill = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
    <TouchableOpacity onPress={onRemove}>
      <Feather name="x" size={14} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

// --- Màn hình chính ---
export default function FiltersScreen() {
  // State cho Genders
  const [genders, setGenders] = useState({
    male: false,
    female: true,
    nonbinary: false,
  });
  // State cho Tuổi
  const [ageRange, setAgeRange] = useState([18, 80]);
  // State cho Khoảng cách
  const [distance, setDistance] = useState([10]); // Slider đơn
  // State cho Toggle
  const [expandRange, setExpandRange] = useState(true);
  // State cho Ngôn ngữ
  const [languages, setLanguages] = useState(["English", "Spanish"]);

  // Hàm xử lý toggle Genders
  const toggleGender = (key: "male" | "female" | "nonbinary") => {
    setGenders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Hàm xóa Ngôn ngữ
  const removeLanguage = (langToRemove: string) => {
    setLanguages((prev) => prev.filter((lang) => lang !== langToRemove));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. Preferred Gender --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is your preferred gender?</Text>
          <View style={styles.card}>
            <CheckboxRow
              label="Male"
              checked={genders.male}
              onToggle={() => toggleGender("male")}
            />
            <View style={styles.divider} />
            <CheckboxRow
              label="Female"
              checked={genders.female}
              onToggle={() => toggleGender("female")}
            />
            <View style={styles.divider} />
            <CheckboxRow
              label="Nonbinary"
              checked={genders.nonbinary}
              onToggle={() => toggleGender("nonbinary")}
            />
          </View>
        </View>

        {/* --- 2. Age Range --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age range:</Text>
          <View style={[styles.card, styles.sliderCard]}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>{ageRange[0]}</Text>
              <Text style={styles.sliderLabelText}>{ageRange[1]}</Text>
            </View>
            <MultiSlider
              values={[ageRange[0], ageRange[1]]}
              onValuesChange={(values) => setAgeRange(values)}
              min={18}
              max={80}
              step={1}
              allowOverlap={false}
              snapped
              selectedStyle={{ backgroundColor: COLORS.primary }}
              unselectedStyle={{ backgroundColor: COLORS.gray }}
              markerStyle={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.primary,
                borderWidth: 2,
                height: 24,
                width: 24,
              }}
              containerStyle={{ height: 30 }}
            />
          </View>
        </View>

        {/* --- 3. Distance --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance:</Text>
          <View style={[styles.card, styles.sliderCard]}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>{distance[0]} km</Text>
              <Text style={styles.sliderLabelText}>80 km</Text>
            </View>
            <MultiSlider
              values={distance}
              onValuesChange={(values) => setDistance(values)}
              min={1}
              max={80}
              step={1}
              selectedStyle={{ backgroundColor: COLORS.primary }}
              unselectedStyle={{ backgroundColor: COLORS.gray }}
              markerStyle={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.primary,
                borderWidth: 2,
                height: 24,
                width: 24,
              }}
              containerStyle={{ height: 30 }}
            />
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                Show profiles within a 15-km range when run out of matches.
              </Text>
              <Switch
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
                onValueChange={setExpandRange}
                value={expandRange}
              />
            </View>
          </View>
        </View>

        {/* --- 4. Languages --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages:</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select languages</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <View style={styles.pillContainer}>
            {languages.map((lang) => (
              <LanguagePill
                key={lang}
                label={lang}
                onRemove={() => removeLanguage(lang)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- Footer Buttons --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear all</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.back()} // Đóng modal
        >
          <Text style={styles.applyButtonText}>Apply filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Đủ chỗ cho footer
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary, // Đổi màu tiêu đề cho nổi bật
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  // --- Checkbox ---
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 16,
  },
  // --- Sliders ---
  sliderCard: {
    padding: 16,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sliderLabelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  // --- Toggle ---
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 12,
    lineHeight: 20,
  },
  // --- Languages ---
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    marginRight: 6,
  },
  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    padding: 20,
    paddingBottom: 30, // Thêm padding cho safe area
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary, // Màu đỏ đô
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginLeft: 10,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});