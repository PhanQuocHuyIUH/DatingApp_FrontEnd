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
  Modal,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Bảng màu Hiện đại ---
const COLORS = {
  primary: "#E94057", // Đỏ hồng hiện đại
  primaryLight: "#F27121", // Cam nhẹ (cho gradient)
  text: "#111827",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  lightGray: "#F3F4F6", // Nền nhẹ
  gray: "#E5E7EB", // Border
  backdrop: "rgba(0,0,0,0.4)",
  activePill: "#FCE8EC", // Màu nền nhẹ cho pill
};

// --- Dữ liệu mẫu ---
const AVAILABLE_LANGUAGES = [
  "Vietnamese", "English", "Spanish", "French", "German",
  "Japanese", "Korean", "Chinese", "Russian", "Italian",
  "Portuguese", "Thai", "Indonesian"
];

// --- Component Header Tùy chỉnh ---
const CustomHeader = ({ onClear, onBack, loading }: { onClear: () => void, onBack: () => void, loading: boolean }) => (
  <View style={headerStyles.headerContainer}>
    <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
      <Ionicons name="close-outline" size={30} color={COLORS.text} />
    </TouchableOpacity>
    <Text style={headerStyles.headerTitle}>Discovery Filters</Text>
    <TouchableOpacity onPress={onClear} disabled={loading} style={headerStyles.clearButton}>
      <Text style={headerStyles.clearButtonText}>Clear All</Text>
    </TouchableOpacity>
  </View>
);

// --- Component Tùy chọn Giới tính (Biến Checkbox thành Pill) ---
type GenderPillProps = {
  label: string;
  icon: string;
  checked: boolean;
  onToggle: () => void;
};
const GenderPill: React.FC<GenderPillProps> = ({ label, icon, checked, onToggle }) => {
  return (
    <TouchableOpacity 
      style={[styles.genderPill, checked ? styles.genderPillActive : styles.genderPillInactive]} 
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={20} 
        color={checked ? COLORS.white : COLORS.textSecondary} 
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.genderPillText, checked ? styles.genderPillTextActive : styles.genderPillTextInactive]}>
        {label}
      </Text>
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
      <View style={styles.pillContent}>
        <Text style={styles.pillText}>{label}</Text>
        <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// --- Màn hình chính ---
export default function FiltersScreen() {
  const insets = useSafeAreaInsets();
  const [genders, setGenders] = useState({ male: true, female: true, nonbinary: false });
  const [ageRange, setAgeRange] = useState([18, 80]);
  const [distance, setDistance] = useState([10]);
  const [expandRange, setExpandRange] = useState(true);
  const [languages, setLanguages] = useState<string[]>(["English", "Vietnamese"]);
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
      if (selectedGenders.length >= 1) filters.gender = selectedGenders.join(','); // Cho phép chọn nhiều
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
      <CustomHeader 
        onClear={handleClearAll} 
        onBack={() => router.back()} 
        loading={loading}
      />
      
      <LinearGradient colors={[COLORS.white, COLORS.lightGray]} style={styles.gradientBackground}>
        <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* 1. Gender (CẢI TIẾN THÀNH PILL) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="gender-male-female" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>I'm interested in:</Text>
              </View>
              <View style={styles.genderPillContainer}>
                <GenderPill label="Men" icon="gender-male" checked={genders.male} onToggle={() => toggleGender("male")} />
                <GenderPill label="Women" icon="gender-female" checked={genders.female} onToggle={() => toggleGender("female")} />
                <GenderPill label="Nonbinary" icon="gender-transgender" checked={genders.nonbinary} onToggle={() => toggleGender("nonbinary")} />
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
                  <Text style={styles.sliderLabelText}>{ageRange[1]} {ageRange[1] === 80 ? '+' : ''}</Text>
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
                <Text style={styles.sectionTitle}>Max Distance:</Text>
              </View>
              <View style={[styles.card, styles.sliderCard]}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>{distance[0]} km</Text>
                  <Text style={styles.sliderLabelText}>80 km {distance[0] === 80 ? '+' : ''}</Text>
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

            {/* 4. Languages */}
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
                  {languages.length > 0 ? `Selected: ${languages.length} languages` : "Select languages"}
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

        {/* Footer Buttons (Chỉ còn nút Apply) */}
        <View style={[styles.footer, {paddingBottom: 20 + insets.bottom}]}>
          <TouchableOpacity 
            style={[styles.applyButton, loading && styles.applyButtonDisabled]} 
            onPress={handleApplyFilters} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.applyButtonText}>Show Matches</Text>
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

// --- Header Styles ---
const headerStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  gradientBackground: { flex: 1 },
  animatedContainer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 30 }, // Tăng khoảng cách giữa các phần
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, // Tăng khoảng cách
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginLeft: 8 }, // Màu chữ đậm và to hơn
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    // Bỏ border và dùng shadow nhẹ
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  // --- Gender Pills (Thay thế Checkbox) ---
  genderPillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  genderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    margin: 4,
    borderWidth: 1,
  },
  genderPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderPillInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray,
  },
  genderPillText: {
    fontSize: 16,
    fontWeight: '600',
  },
  genderPillTextActive: {
    color: COLORS.white,
  },
  genderPillTextInactive: {
    color: COLORS.textSecondary,
  },

  // Sliders
  sliderCard: { padding: 16 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sliderLabelText: { fontSize: 18, fontWeight: "700", color: COLORS.primary }, // Màu sắc nổi bật hơn
  markerStyle: { backgroundColor: COLORS.white, borderColor: COLORS.primary, borderWidth: 3, height: 26, width: 26, borderRadius: 13, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 4 },
  
  // Toggle
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginHorizontal: 0, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingTop: 16 },
  toggleLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, marginRight: 12 },
  
  // Languages
  dropdown: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.activePill,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray,
  },
  dropdownText: { flex: 1, fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  pillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  pill: { marginRight: 8, marginBottom: 8, borderRadius: 20, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: COLORS.gray },
  pillContent: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.activePill },
  pillText: { fontSize: 14, color: COLORS.primary, fontWeight: "600", marginRight: 6 },
  
  // Footer
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray, paddingHorizontal: 20, paddingTop: 15, elevation: 10 },
  applyButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 30, elevation: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  applyButtonDisabled: { opacity: 0.7 },
  applyButtonText: { fontSize: 18, fontWeight: "700", color: COLORS.white, marginLeft: 8 }, // To và đậm hơn
  
  // --- Modal Styles ---
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.backdrop },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%', // Chiếm 75% màn hình
    padding: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text }, // To hơn
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
  modalItemTextSelected: { color: COLORS.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 },
  modalDoneBtn: {
    marginTop: 20, backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center'
  },
  modalDoneText: { color: COLORS.white, fontWeight: '700', fontSize: 18 }
});