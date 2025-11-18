import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { userService } from "../../../services/userService";

const COLORS = {
  primary: "#FF6B9D",
  primaryDark: "#C92A6D",
  primaryLight: "#FFB4D5",
  secondary: "#FEF3F7",
  accent: "#FFD93D",
  text: "#2D3748",
  textSecondary: "#718096",
  white: "#FFFFFF",
  gray: "#E2E8F0",
  lightGray: "#F7FAFC",
  gradient1: ["#FF6B9D", "#C92A6D"],
  gradient2: ["#FFB4D5", "#FF6B9D"],
  success: "#48BB78",
  error: "#F56565",
  warning: "#ED8936",
  shadow: "rgba(201, 42, 109, 0.3)",
};

// Toast Notification Component
type ToastProps = {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
};
const ToastNotification: React.FC<ToastProps> = ({ visible, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, opacity, onHide]);

  if (!visible) return null;

  const backgroundColor = type === 'success' ? COLORS.success : type === 'error' ? COLORS.error : COLORS.warning;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'alert-circle';

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { backgroundColor, transform: [{ translateY }], opacity },
      ]}
    >
      <Feather name={icon} size={20} color={COLORS.white} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

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
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowIconContainer}>{icon}</View>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || "Add"}</Text>
    <Feather name="chevron-right" size={20} color={COLORS.primary} />
  </TouchableOpacity>
);

const Pill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
    <TouchableOpacity onPress={onRemove} style={styles.pillRemove}>
      <Feather name="x" size={12} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

const DropdownSelector = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.dropdown} onPress={onPress}>
    {icon}
    <Text style={styles.dropdownText}>{label}</Text>
    <Feather name="chevron-down" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

type AddItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: string) => void;
  title: string;
  placeholder: string;
};
const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAddItem,
  title,
  placeholder,
}) => {
  const [item, setItem] = useState("");
  const handleAdd = () => {
    if (item.trim()) {
      onAddItem(item.trim());
      setItem("");
      onClose();
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={item}
            onChangeText={setItem}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.modalButton, styles.addButton]}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type PronounSelectorModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
  options: string[];
  currentValue: string;
  title: string;
};
const PronounSelectorModal: React.FC<PronounSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  options,
  currentValue,
  title,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option: string) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pronounOption,
                currentValue === option && styles.pronounOptionSelected,
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.pronounOptionText,
                  currentValue === option && styles.pronounOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.modalButton,
              styles.cancelButton,
              { marginTop: 10, width: "100%" },
            ]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function EditProfileScreen() {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

  const [name, setName] = useState("");

  const [bio, setBio] = useState("");

  const [occupation, setOccupation] = useState("");

  const [education, setEducation] = useState("");

  const [company, setCompany] = useState("");

  const [location, setLocation] = useState("");

  const [pronouns, setPronouns] = useState("");

  const [completion, setCompletion] = useState(0);

  const [interests, setInterests] = useState<string[]>([]);

  const [languages, setLanguages] = useState<string[]>([]);

  const [isInterestModalVisible, setInterestModalVisible] = useState(false);

  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const [isPronounModalVisible, setPronounModalVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await userService.getMyProfile();
      type UserProfileResponse = { success: boolean; data: { user: any } };
      const typedResponse = response as UserProfileResponse;
      if (typedResponse.success) {
        const data = typedResponse.data.user;
        setUser(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setOccupation(data.occupation || "");
        setEducation(data.education || "");
        setCompany(data.company || "");
        setLocation(
          data.location?.city ||
            (typeof data.location === "string" ? data.location : "")
        );
        setPronouns(data.pronouns || "");
        setInterests(data.interests || []);
        setLanguages(data.languages || []);
        const fields = [
          data.bio,
          data.occupation,
          data.education,
          data.location,
          data.pronouns,
          data.name,
        ];
        const totalFields =
          fields.length +
          (data.photos?.length > 0 ? 1 : 0) +
          (data.interests?.length > 0 ? 1 : 0);
        const filledFields =
          fields.filter((f: any) => f).length +
          (data.photos?.length > 0 ? 1 : 0) +
          (data.interests?.length > 0 ? 1 : 0);
        setCompletion(Math.round((filledFields / totalFields) * 100));
      }
    } catch (error: any) {
      console.error("Fetch profile error:", error);

      Alert.alert("Error", error.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);

      const payload = {
        name,

        bio,

        occupation,

        education,

        company,

        pronouns,

        interests,

        languages,
      };

      const response = await userService.updateProfile(payload);
      type UpdateProfileResponse = {
        success: boolean;
        data: { user: any };
        message?: string;
      };
      const typedResponse = response as UpdateProfileResponse;
      if (typedResponse.success) {
        showToast("Profile updated successfully! 🎉", "success");
        const updatedUser = typedResponse.data.user;
        setUser((prevUser: any) => ({ ...prevUser, ...updatedUser }));
      } else {
        showToast(typedResponse.message || "Update failed", "error");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);

      showToast(error.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need permission to access your photos."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    const photoData = {
      uri: asset.uri,
      name: asset.fileName || asset.uri.split("/").pop() || "photo.jpg",
      type: asset.mimeType || "image/jpeg",
    };
    try {
      setIsUploading(true);
      type UploadPhotoResponse = { success: boolean; message?: string };
      const response = (await userService.uploadPhoto(
        photoData as any
      )) as UploadPhotoResponse;
      if (response.success) {
        showToast("Photo uploaded successfully! 📸", "success");
        await fetchProfile();
      } else {
        showToast(response.message || "Could not upload photo", "error");
      }
    } catch (error: any) {
      showToast(error.message || "An error occurred during upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need your location to update your profile."
      );
      return;
    }
    try {
      setIsUpdatingLocation(true);
      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = locationData.coords;
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length === 0) {
        throw new Error("Could not determine address from coordinates.");
      }
      const { city, region, country, subregion, district } = address[0];
      const locationCity = city || subregion || district;
      const payload: {
        city?: string;
        state?: string;
        country?: string;
        coordinates: [number, number];
      } = {
        coordinates: [longitude, latitude],
      };
      if (locationCity) payload.city = locationCity;
      if (region) payload.state = region;
      if (country) payload.country = country;
      if (!locationCity) {
        Alert.alert(
          "Location Error",
          "Could not determine your city. Please try again in a different location."
        );
        setIsUpdatingLocation(false);
        return;
      }
      type UpdateLocationResponse = {
        success: boolean;
        data: { location: any };
        message?: string;
      };
      const response = (await userService.updateLocation(
        payload
      )) as UpdateLocationResponse;
      if (response.success) {
        showToast("Location updated successfully! 📍", "success");
        setLocation(response.data.location.city);
        setUser((prevUser: any) => ({
          ...prevUser,
          location: response.data.location,
        }));
      } else {
        showToast(response.message || "Could not update location", "error");
      }
    } catch (error: any) {
      console.error("Update location error:", error);
      showToast(error.message || "Failed to update location", "error");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleAddInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
    }

    setInterestModalVisible(false);
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((interest) => interest !== interestToRemove));
  };

  const handleAddLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      setLanguages([...languages, language]);
    }

    setLanguageModalVisible(false);
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter((language) => language !== languageToRemove));
  };

  if (loading && !user) {
    return (
      <View
        style={{
          flex: 1,

          justifyContent: "center",

          alignItems: "center",

          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const photos = user?.photos || [];

  const mainPhoto = photos.find((p: any) => p.isMain) || photos[0];

  const subPhotos = photos.filter((p: any) => p !== mainPhoto).slice(0, 5);

  const photoSlots = [
    mainPhoto,

    ...subPhotos,

    ...Array(Math.max(0, 6 - photos.length)).fill(null),
  ];

  const mainPhotoSlot = photoSlots[0];

  const subPhotoSlots = photoSlots.slice(1);

  const pronounOptions = ["he/him", "she/her", "they/them", "other"];

  return (
    <>
      <Stack.Screen options={{ title: "Edit Profile" }} />
      
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            <Text style={styles.completionText}>
              Profile completion: {completion}%
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={COLORS.gradient1 as any}
              style={[styles.progressBarFill, { width: `${completion}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>

          <Text style={styles.sectionSubtitle}>
            Add up to 6 photos. The first photo is your main photo.
          </Text>

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          <View style={styles.photoGrid}>
            <TouchableOpacity
              style={styles.mainPhotoContainer}
              onPress={handleUploadPhoto}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    mainPhotoSlot?.url ||
                    "https://placehold.co/400x600/fae0e7/b21e46?text=Add+Photo",
                }}
                style={styles.mainPhoto}
              />
              {mainPhotoSlot && (
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.photoGradient}
                >
                  <View style={styles.mainPhotoIcon}>
                    <Ionicons name="camera" size={24} color={COLORS.white} />
                    <Text style={styles.mainPhotoLabel}>Main Photo</Text>
                  </View>
                </LinearGradient>
              )}
              {!mainPhotoSlot && (
                <LinearGradient
                  colors={COLORS.gradient2 as any}
                  style={styles.addPhotoOverlay}
                >
                  <Ionicons name="person-add" size={40} color={COLORS.white} />
                  <Text style={styles.addPhotoText}>Add Main Photo</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <View style={styles.subPhotoContainer}>
              {subPhotoSlots.map((photo, index) => (
                <TouchableOpacity
                  style={styles.addPhotoBox}
                  key={index}
                  onPress={handleUploadPhoto}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  {photo ? (
                    <>
                      <Image
                        source={{ uri: photo.url }}
                        style={styles.subPhoto}
                      />
                      <View style={styles.subPhotoOverlay}>
                        <Ionicons name="image" size={16} color={COLORS.white} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptyPhotoBox}>
                      <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About me</Text>

          <Text style={styles.sectionSubtitle}>
            Make it easy for others to get a sense of who you are.
          </Text>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Share a few words about yourself, your interests, and what you're looking for..."
            placeholderTextColor={COLORS.textSecondary}
            value={bio}
            onChangeText={setBio}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My details</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setPronounModalVisible(true)}
          >
            <Text
              style={[
                styles.inputText,

                { color: pronouns ? COLORS.text : COLORS.textSecondary },
              ]}
            >
              {pronouns || "Pronouns"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Occupation"
            value={occupation}
            onChangeText={setOccupation}
          />

          <TextInput
            style={styles.input}
            placeholder="Company"
            value={company}
            onChangeText={setCompany}
          />

          <TextInput
            style={styles.input}
            placeholder="Education"
            value={education}
            onChangeText={setEducation}
          />

          <Text style={styles.inputLabel}>Location</Text>

          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.locationInput}
              placeholder="Your current city"
              value={location}
              onChangeText={setLocation}
              editable={false}
            />

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUpdateLocation}
              disabled={isUpdatingLocation}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={24}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

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
            value={user?.height}
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
            value={user?.smoking}
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
            value={user?.drinking}
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
            value={user?.pets}
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
            value={user?.children}
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
            value={user?.zodiac}
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
            value={user?.religion}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I enjoy</Text>

          <Text style={styles.sectionSubtitle}>
            Add your interests to find like-minded connections.
          </Text>

          <DropdownSelector
            label="Add interests..."
            icon={
              <AntDesign
                name="tag"
                size={16}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            onPress={() => setInterestModalVisible(true)}
          />

          <View style={styles.pillContainer}>
            {interests.map((item) => (
              <Pill
                label={item}
                key={item}
                onRemove={() => handleRemoveInterest(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I communicate in</Text>

          <DropdownSelector
            label="Add languages..."
            icon={
              <Entypo
                name="globe"
                size={16}
                color={COLORS.textSecondary}
                style={styles.rowIcon}
              />
            }
            onPress={() => setLanguageModalVisible(true)}
          />

          <View style={styles.pillContainer}>
            {languages.map((item) => (
              <Pill
                label={item}
                key={item}
                onRemove={() => handleRemoveLanguage(item)}
              />
            ))}
          </View>
        </View>

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
                name="facebook"
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

        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={updating || isUploading || isUpdatingLocation}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradient1 as any}
            style={styles.updateButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {updating ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.updateButtonText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <AddItemModal
        visible={isInterestModalVisible}
        onClose={() => setInterestModalVisible(false)}
        onAddItem={handleAddInterest}
        title="Add Interest"
        placeholder="e.g. Hiking, Painting, Coding"
      />

      <AddItemModal
        visible={isLanguageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onAddItem={handleAddLanguage}
        title="Add Language"
        placeholder="e.g. English, Spanish, French"
      />

      <PronounSelectorModal
        visible={isPronounModalVisible}
        onClose={() => setPronounModalVisible(false)}
        onSelect={setPronouns}
        options={pronounOptions}
        currentValue={pronouns}
        title="Select Pronouns"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray, paddingHorizontal: 20 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  completionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },

  photoGrid: { flexDirection: "row", height: 420, marginTop: 16 },
  mainPhotoContainer: {
    flex: 0.6,
    paddingRight: 8,
    position: "relative",
    height: "100%",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'flex-end',
    padding: 12,
  },
  mainPhotoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPhotoLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addPhotoOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  addPhotoText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  subPhotoContainer: {
    flex: 0.4,
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "space-between",
    height: "100%",
  },
  addPhotoBox: {
    width: "100%",
    height: "32%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: "2%",
    position: 'relative',
  },
  subPhoto: { width: "100%", height: "100%", borderRadius: 12 },
  subPhotoOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  emptyPhotoBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: "top",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    paddingLeft: 4,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  locationButton: { padding: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowIcon: { width: 20, textAlign: "center" },
  rowLabel: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  rowValue: { fontSize: 15, color: COLORS.textSecondary, marginRight: 8 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  dropdownText: { flex: 1, fontSize: 16, color: COLORS.text, marginLeft: 8 },
  pillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: 8,
  },
  pillRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: COLORS.lightGray },
  cancelButtonText: { color: COLORS.textSecondary, fontWeight: "bold" },
  addButton: { backgroundColor: COLORS.primary },
  addButtonText: { color: COLORS.white, fontWeight: "bold" },
  updateButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700", marginLeft: 8 },
  pronounOption: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginBottom: 10,
  },
  pronounOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pronounOptionText: { fontSize: 16, color: COLORS.text },
  pronounOptionTextSelected: { color: COLORS.white, fontWeight: "bold" },
  inputText: { fontSize: 16 },
});
