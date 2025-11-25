import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import MultiSlider from "@ptomasroos/react-native-multi-slider"; // Thư viện slider
import { discoveryService } from '../../../services/discoveryService';

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

const AVAILABLE_LANGUAGES = [
  "Vietnam",
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Italian",
  "Russian",
  "Portuguese",
];

// --- Component Checkbox Row với Animation ---
type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};
const CheckboxRow: React.FC<CheckboxRowProps> = ({
  label,
  checked,
  onToggle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity 
      style={styles.checkboxRow} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.checkboxLabel}>{label}</Text>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialCommunityIcons
          name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={checked ? COLORS.primary : COLORS.gray}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- Component Pill Ngôn ngữ với Animation ---
const LanguagePill = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleRemove = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onRemove());
  };

  return (
    <Animated.View style={[styles.pill, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[COLORS.secondary, '#fce9ed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pillGradient}
      >
        <Text style={styles.pillText}>{label}</Text>
        <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

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
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  // State cho loading
  const [loading, setLoading] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Hàm xử lý toggle Genders
  const toggleGender = (key: "male" | "female" | "nonbinary") => {
    setGenders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Hàm thêm ngôn ngữ
  const addLanguage = (language: string) => {
    if (!languages.includes(language)) {
      setLanguages((prev) => [...prev, language]);
    }
    setLanguageModalVisible(false);
  };

  // Hàm xóa Ngôn ngữ
  const removeLanguage = (langToRemove: string) => {
    setLanguages((prev) => prev.filter((lang) => lang !== langToRemove));
  };

  // Hàm clear all filters
  const handleClearAll = () => {
    setGenders({ male: false, female: false, nonbinary: false });
    setAgeRange([18, 80]);
    setDistance([10]);
    setExpandRange(true);
    setLanguages([]);
    
    // Clear filters in service
    discoveryService.clearFilters();
  };

  // Hàm apply filters
  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      // Build filter object
      const selectedGenders = Object.keys(genders).filter(
        (key) => genders[key as keyof typeof genders]
      );

      const filters: any = {
        ageMin: ageRange[0],
        ageMax: ageRange[1],
      };

      // Add gender if selected (API expects single gender string)
      if (selectedGenders.length === 1) {
        filters.gender = selectedGenders[0];
      }

      // Add distance
      if (distance[0]) {
        filters.distance = distance[0];
      }

      // Add languages if any
      if (languages.length > 0) {
        filters.languages = languages.join(',');
      }

      // Call API - this will emit 'filtersApplied' event
      await discoveryService.filterProfiles(filters);
      
      // Navigate back - index screen will reload automatically
      router.back();
    } catch (error: any) {
      console.error('Filter error:', error);
      alert(error.message || 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#fef5f7', '#fef9fa']}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
        {/* --- 1. Preferred Gender --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="gender-male-female" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>What is your preferred gender?</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Age range:</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Distance:</Text>
          </View>
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
            <View style={styles.sectionHeader}>
              <Ionicons name="language-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Languages:</Text>
            </View>
            <TouchableOpacity style={styles.dropdown} onPress={() => setLanguageModalVisible(true)}>
              <Text style={styles.dropdownText}>Select languages</Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.pillContainer}>
              {languages.map((lang) => (
                <LanguagePill key={lang} label={lang} onRemove={() => removeLanguage(lang)} />
              ))}
            </View>
          </View>
          </ScrollView>
          
          {/* --- Modal Chọn Ngôn Ngữ --- */}
      <Modal visible={isLanguageModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Language</Text>
            <FlatList
              data={AVAILABLE_LANGUAGES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.languageItem} onPress={() => addLanguage(item)}>
                  <Text style={styles.languageText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </Animated.View>

      {/* --- Footer Buttons --- */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearAll}
          disabled={loading}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.clearButtonText}>Clear all</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyButton, loading && styles.applyButtonDisabled]}
          onPress={handleApplyFilters}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.applyButtonText}>Apply filters</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </LinearGradient>
    </View>

    
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
  animatedContainer: {
    flex: 1,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: '#b21e46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#b21e46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 14,
    color: COLORS.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 16,
    borderRadius: 30,
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginLeft: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginLeft: 6,
  },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: COLORS.white, margin: 20, borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  languageItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray },
  languageText: { fontSize: 16, color: COLORS.text },
  closeButton: { marginTop: 10, alignItems: "center" },
  closeButtonText: { fontSize: 16, color: COLORS.primary, fontWeight: "bold" }
});