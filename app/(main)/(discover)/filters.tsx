import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  ActivityIndicator,
  Modal,            // Mới
  TextInput,        // Mới
  FlatList,         // Mới
  Keyboard,         // Mới
  TouchableWithoutFeedback // Mới
} from "react-native";
import { router } from "expo-router";
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { discoveryService } from '../../../services/discoveryService';

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  secondary: "#fae0e7",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  gray: "#E5E7EB",
  backdrop: "rgba(0,0,0,0.5)", // Màu nền tối cho Modal
};

// --- Dữ liệu mẫu (Thực tế có thể lấy từ API) ---
const AVAILABLE_LANGUAGES = [
  "Vietnamese", "English", "Spanish", "French", "German", 
  "Japanese", "Korean", "Chinese", "Russian", "Italian", 
  "Portuguese", "Thai", "Indonesian"
];

// --- Component Checkbox Row ---
type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};
const CheckboxRow: React.FC<CheckboxRowProps> = ({ label, checked, onToggle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={handlePress} activeOpacity={0.7}>
      <Text style={[styles.checkboxLabel, checked && { color: COLORS.primary, fontWeight: '600' }]}>
        {label}
      </Text>
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

// --- Component Pill Ngôn ngữ ---
const LanguagePill = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  }, []);

  const handleRemove = () => {
    Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onRemove());
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
  const [genders, setGenders] = useState({ male: false, female: true, nonbinary: false });
  const [ageRange, setAgeRange] = useState([18, 80]);
  const [distance, setDistance] = useState([10]);
  const [expandRange, setExpandRange] = useState(true);
  const [languages, setLanguages] = useState<string[]>(["English", "Vietnamese"]); // Mặc định có tiếng Việt
  const [loading, setLoading] = useState(false);

  // --- State cho Modal Language ---
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  // --- Logic ---
  const toggleGender = (key: "male" | "female" | "nonbinary") => {
    setGenders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeLanguage = (langToRemove: string) => {
    setLanguages((prev) => prev.filter((lang) => lang !== langToRemove));
  };

  const addLanguage = (langToAdd: string) => {
    if (!languages.includes(langToAdd)) {
      setLanguages(prev => [...prev, langToAdd]);
    }
    // Không đóng modal ngay để user chọn nhiều cái
  };

  const isLanguageSelected = (lang: string) => languages.includes(lang);

  const filteredLanguages = useMemo(() => {
    return AVAILABLE_LANGUAGES.filter(lang => 
      lang.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handleClearAll = () => {
    setGenders({ male: false, female: false, nonbinary: false });
    setAgeRange([18, 80]);
    setDistance([10]);
    setExpandRange(true);
    setLanguages([]);
    discoveryService.clearFilters();
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const selectedGenders = Object.keys(genders).filter((key) => genders[key as keyof typeof genders]);
      const filters: any = { ageMin: ageRange[0], ageMax: ageRange[1] };
      if (selectedGenders.length === 1) filters.gender = selectedGenders[0];
      if (distance[0]) filters.distance = distance[0];
      if (languages.length > 0) filters.languages = languages.join(',');

      await discoveryService.filterProfiles(filters);
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
      <LinearGradient colors={['#ffffff', '#fef5f7', '#fef9fa']} style={styles.gradientBackground}>
        <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 1. Gender */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="gender-male-female" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Preferred gender?</Text>
              </View>
              <View style={styles.card}>
                <CheckboxRow label="Male" checked={genders.male} onToggle={() => toggleGender("male")} />
                <View style={styles.divider} />
                <CheckboxRow label="Female" checked={genders.female} onToggle={() => toggleGender("female")} />
                <View style={styles.divider} />
                <CheckboxRow label="Nonbinary" checked={genders.nonbinary} onToggle={() => toggleGender("nonbinary")} />
              </View>
            </View>

            {/* 2. Age */}
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
                  onValuesChange={setAgeRange}
                  min={18} max={80} step={1} allowOverlap={false} snapped
                  selectedStyle={{ backgroundColor: COLORS.primary }}
                  unselectedStyle={{ backgroundColor: COLORS.gray }}
                  markerStyle={styles.markerStyle}
                  containerStyle={{ height: 30 }}
                />
              </View>
            </View>

            {/* 3. Distance */}
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
                  onValuesChange={setDistance}
                  min={1} max={80} step={1}
                  selectedStyle={{ backgroundColor: COLORS.primary }}
                  unselectedStyle={{ backgroundColor: COLORS.gray }}
                  markerStyle={styles.markerStyle}
                  containerStyle={{ height: 30 }}
                />
                <View style={styles.divider} />
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Expand range automatically if no matches.</Text>
                  <Switch
                    trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                    onValueChange={setExpandRange}
                    value={expandRange}
                  />
                </View>
              </View>
            </View>

            {/* 4. Languages (ĐÃ CẢI THIỆN) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="language-outline" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Languages:</Text>
              </View>
              
              {/* Nút mở Modal */}
              <TouchableOpacity 
                style={styles.dropdown} 
                onPress={() => {
                  setSearchText("");
                  setModalVisible(true);
                }}
              >
                <Text style={styles.dropdownText}>
                  {languages.length > 0 ? "Add more languages..." : "Select languages"}
                </Text>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              {/* Danh sách Pills */}
              <View style={styles.pillContainer}>
                {languages.map((lang) => (
                  <LanguagePill key={lang} label={lang} onRemove={() => removeLanguage(lang)} />
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll} disabled={loading}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.applyButton, loading && styles.applyButtonDisabled]} onPress={handleApplyFilters} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* --- LANGUAGE MODAL --- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
             <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Languages</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} style={{marginRight: 8}} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search language..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = isLanguageSelected(item);
                return (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => {
                      if (isSelected) removeLanguage(item);
                      else addLanguage(item);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={22} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No languages found.</Text>
              }
            />
             <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  gradientBackground: { flex: 1 },
  animatedContainer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.primary, marginLeft: 8 },
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
  // Checkbox
  checkboxRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  checkboxLabel: { fontSize: 16, color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.gray, marginHorizontal: 16 },
  // Sliders
  sliderCard: { padding: 16 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sliderLabelText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  markerStyle: { backgroundColor: COLORS.white, borderColor: COLORS.primary, borderWidth: 2, height: 24, width: 24 },
  // Toggle
  toggleRow: { flexDirection: "row", alignItems: "center", paddingTop: 16 },
  toggleLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, marginRight: 12 },
  // Languages
  dropdown: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, 
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary,
    borderStyle: 'dashed' // Tạo kiểu nút thêm mới
  },
  dropdownText: { flex: 1, fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  pillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  pill: { marginRight: 8, marginBottom: 8, borderRadius: 20, overflow: 'hidden', elevation: 2 },
  pillGradient: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12 },
  pillText: { fontSize: 14, color: COLORS.primary, fontWeight: "600", marginRight: 6 },
  // Footer
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray, padding: 20, paddingBottom: 30 },
  clearButton: { flex: 0.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lightGray, paddingVertical: 16, borderRadius: 30, marginRight: 10 },
  clearButtonText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary, marginLeft: 6 },
  applyButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 30, marginLeft: 10, elevation: 5 },
  applyButtonDisabled: { opacity: 0.6 },
  applyButtonText: { fontSize: 16, fontWeight: "700", color: COLORS.white, marginLeft: 6 },
  
  // --- Modal Styles ---
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.backdrop },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%', // Chiếm 70% màn hình
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, marginBottom: 16
  },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray
  },
  modalItemText: { fontSize: 16, color: COLORS.text },
  modalItemTextSelected: { color: COLORS.primary, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
  modalDoneBtn: {
    marginTop: 10, backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center'
  },
  modalDoneText: { color: COLORS.white, fontWeight: '700', fontSize: 16 }
});