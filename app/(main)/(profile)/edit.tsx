import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform, // Đã thêm
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
import * as ImagePicker from "expo-image-picker"; // Đã thêm
import * as Location from "expo-location"; // Đã thêm

// SỬA ĐƯỜNG DẪN IMPORT
import { authService } from "../../../services/authService";
import { userService } from "../../../services/userService"; 

// --- Bảng màu ---
const COLORS = {
  primary: "#b21e46",
  primaryLight: "#cc5073",
  secondary: "#fae0e7",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  lightGray: "#F3F4F6", 
};

// --- Component Row Tái sử dụng ---
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
const Pill = ({ label }: { label: string }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
    <TouchableOpacity>
      <Feather name="x" size={14} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

// --- Component Dropdown Giả ---
const DropdownSelector = ({ label, icon }: { label: string, icon: React.ReactNode }) => (
  <TouchableOpacity style={styles.dropdown}>
    {icon}
    <Text style={styles.dropdownText}>{label}</Text>
    <Feather name="chevron-down" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

// --- Màn hình chính ---
export default function EditProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State upload ảnh
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false); // State cập nhật vị trí
  
  // State cho các trường có thể chỉnh sửa
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState(""); // Chỉ dùng để hiển thị city
  const [pronouns, setPronouns] = useState("");

  // State cho các trường khác
  const [completion, setCompletion] = useState(0);
  // const [images, setImages] = useState<string[]>([]); // Sửa: Dùng user.photos
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  // Hàm lấy profile, sẽ được gọi lại sau khi upload ảnh
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getMyProfile(); 

      if (response.success) { 
        const data = response.data.user; 
        setUser(data);
        
        // Set state cho các trường chỉnh sửa
        setName(data.name || "");
        setBio(data.bio || "");
        setOccupation(data.occupation || "");
        setEducation(data.education || "");
        setCompany(data.company || "");
        // Hiển thị city nếu location là object, nếu không thì hiển thị string
        setLocation(data.location?.city || (typeof data.location === 'string' ? data.location : ""));
        setPronouns(data.pronouns || "");
        
        // Set state cho các trường giao diện
        // setImages(data.photos || []); // Không cần state 'images' riêng
        setInterests(data.interests || []); 
        setLanguages(data.languages || []); 
        
        // Tính toán % hoàn thành
        const fields = [data.bio, data.occupation, data.education, data.location, data.pronouns, data.name];
        const totalFields = fields.length + (data.photos?.length > 0 ? 1 : 0) + (data.interests?.length > 0 ? 1 : 0);
        const filledFields = fields.filter(f => f).length + (data.photos?.length > 0 ? 1 : 0) + (data.interests?.length > 0 ? 1 : 0);
        setCompletion(Math.round((filledFields / totalFields) * 100));

      }
    } catch (error: any) {
      console.error("Fetch profile error:", error);
      Alert.alert("Error", error.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };
  
  // Lấy dữ liệu profile khi vào màn hình
  useEffect(() => {
    fetchProfile();
  }, []);

  // Hàm cập nhật profile
  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      // Bỏ 'location' ra khỏi payload này, vì nó được xử lý riêng
      const payload = { name, bio, occupation, education, company, pronouns };
      const response = await userService.updateProfile(payload); 
      
      if (response.success) { 
        Alert.alert("Success", "Profile updated successfully");
        const updatedUser = response.data.user; 
        setUser(prevUser => ({ ...prevUser, ...updatedUser })); // Cập nhật state user
      } else {
        Alert.alert("Error", response.message || "Update failed"); 
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      Alert.alert("Error", error.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // --- HÀM MỚI: Xử lý chọn và upload ảnh ---
  const handleUploadPhoto = async () => {
    // 1. Hỏi quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your photos.');
      return;
    }

    // 2. Mở thư viện ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    // 3. Xử lý ảnh đã chọn
    const asset = result.assets[0];
    console.log("File size:", asset.fileSize);
    const photoData = {
      uri: asset.uri,
      // Lấy tên file gốc (ví dụ: 'IMG_1234.JPG')
      name: asset.fileName || asset.uri.split('/').pop() || 'photo.jpg',
      // Lấy MimeType chuẩn (ví dụ: 'image/jpeg')
      type: asset.mimeType || 'image/jpeg', 
    };

    // 4. Upload
    try {
      setIsUploading(true);
      const response = await userService.uploadPhoto(photoData as any);

      if (response.success) {
        Alert.alert('Success', 'Photo uploaded successfully');
        // Tải lại profile để cập nhật danh sách ảnh
        await fetchProfile(); 
      } else {
        Alert.alert('Upload failed', response.message || 'Could not upload photo');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // --- HÀM MỚI: Xử lý cập nhật vị trí ---
  const handleUpdateLocation = async () => {
    // 1. Hỏi quyền
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need your location to update your profile.');
      return;
    }

    try {
      setIsUpdatingLocation(true);
      // 2. Lấy tọa độ
      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = locationData.coords;

      // 3. Dịch ngược tọa độ
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (address.length === 0) {
        throw new Error('Could not determine address from coordinates.');
      }
      
      const { city, region, country } = address[0];
      const payload = {
        city: city || "Unknown",
        state: region || "Unknown",
        country: country || "Unknown",
        coordinates: [longitude, latitude], // [long, lat]
      };

      // 4. Gọi API
      const response = await userService.updateLocation(payload);

      if (response.success) {
        Alert.alert('Success', 'Location updated successfully');
        // Cập nhật state hiển thị
        setLocation(response.data.location.city);
        // Cập nhật user state
        setUser(prevUser => ({ ...prevUser, location: response.data.location }));
      } else {
        Alert.alert('Update failed', response.message || 'Could not update location');
      }

    } catch (error: any) {
      console.error('Update location error:', error);
      Alert.alert('Error', error.message || 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  };


  // --- UI Màn hình chờ loading ---
  if (loading && !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  // Lấy danh sách ảnh từ state 'user'
  const photos = user?.photos || [];
  const mainPhoto = photos.find((p: any) => p.isMain) || photos[0];
  const subPhotos = photos.filter((p: any) => p !== mainPhoto).slice(0, 5); // Lấy 5 ảnh phụ
  
  // Tạo mảng 6 slot cho UI (1 chính, 5 phụ)
  const photoSlots = [
    mainPhoto,
    ...subPhotos,
    ...Array(Math.max(0, 6 - photos.length)).fill(null) // Lấp đầy slot trống
  ];

  const mainPhotoSlot = photoSlots[0];
  const subPhotoSlots = photoSlots.slice(1); // Lấy 5 slot phụ


  return (
    <>
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
            Add up to 6 photos. The first photo is your main photo.
          </Text>
          
          {/* Lớp phủ loading khi upload ảnh */}
          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          <View style={styles.photoGrid}>
            {/* Ảnh chính */}
            <TouchableOpacity 
              style={styles.mainPhotoContainer} 
              onPress={handleUploadPhoto}
              disabled={isUploading}
            >
              <Image
                source={{
                  uri: mainPhotoSlot?.url || "https://placehold.co/400x600/fae0e7/b21e46?text=Add+Photo",
                }}
                style={styles.mainPhoto}
              />
              {!mainPhotoSlot && (
                  <View style={styles.addPhotoOverlay}>
                    <Feather name="plus" size={30} color={COLORS.primary} />
                  </View>
              )}
              {/* TODO: Thêm nút X để xóa hoặc đổi ảnh chính */}
            </TouchableOpacity>

            {/* 5 Ảnh phụ */}
            <View style={styles.subPhotoContainer}>
              {subPhotoSlots.map((photo, index) => (
                <TouchableOpacity 
                  style={styles.addPhotoBox} 
                  key={index}
                  onPress={handleUploadPhoto}
                  disabled={isUploading}
                >
                  {photo ? (
                    <Image source={{ uri: photo.url }} style={styles.subPhoto} />
                  ) : (
                    <Feather name="plus" size={24} color={COLORS.textSecondary} />
                  )}
                  {/* TODO: Thêm nút X để xóa ảnh */}
                </TouchableOpacity>
              ))}
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
            placeholder="Share a few words about yourself, your interests, and what you're looking for..."
            placeholderTextColor={COLORS.textSecondary}
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* --- My Details --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My details</Text>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Pronouns" value={pronouns} onChangeText={setPronouns} />
          <TextInput style={styles.input} placeholder="Occupation" value={occupation} onChangeText={setOccupation} />
          <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} />
          <TextInput style={styles.input} placeholder="Education" value={education} onChangeText={setEducation} />
          
          {/* Phần Vị trí */}
          <Text style={styles.inputLabel}>Location</Text>
          <View style={styles.locationInputContainer}>
            <TextInput 
              style={styles.locationInput} 
              placeholder="Your current city" 
              value={location} 
              onChangeText={setLocation}
              editable={false} // Không cho sửa tay, chỉ cập nhật bằng nút
            />
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={handleUpdateLocation}
              disabled={isUpdatingLocation}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Most people also want to know: --- */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>
            Most people also want to know:
          </Text>
          <ProfileRow
            icon={<MaterialCommunityIcons name="ruler" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Height"
            value={user?.height}
          />
          <ProfileRow
            icon={<MaterialCommunityIcons name="smoking" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Smoking"
            value={user?.smoking}
          />
          <ProfileRow
            icon={<Entypo name="drink" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Drinking"
            value={user?.drinking}
          />
          <ProfileRow
            icon={<MaterialCommunityIcons name="paw" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Pets"
            value={user?.pets}
          />
          <ProfileRow
            icon={<FontAwesome5 name="child" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Children"
            value={user?.children}
          />
          <ProfileRow
            icon={<MaterialCommunityIcons name="zodiac-aquarius" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Zodiac sign"
            value={user?.zodiac}
          />
          <ProfileRow
            icon={<SimpleLineIcons name="user" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Religion"
            value={user?.religion}
          />
        </View>

        {/* --- I enjoy --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I enjoy</Text>
          <Text style={styles.sectionSubtitle}>
            Add your interests to find like-minded connections.
          </Text>
          <DropdownSelector label="Add interests..." icon={<AntDesign name="tago" size={16} color={COLORS.textSecondary} style={styles.rowIcon} />} />
          <View style={styles.pillContainer}>
            {interests.map((item) => (
              <Pill label={item} key={item} />
            ))}
          </View>
        </View>

        {/* --- I communicate in --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I communicate in</Text>
          <DropdownSelector label="Add languages..." icon={<Entypo name="globe" size={16} color={COLORS.textSecondary} style={styles.rowIcon} />} />
          <View style={styles.pillContainer}>
            {languages.map((item) => (
              <Pill label={item} key={item} />
            ))}
          </View>
        </View>

        {/* --- Linked accounts --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked accounts</Text>
          <ProfileRow
            icon={<AntDesign name="instagram" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Instagram"
          />
          <ProfileRow
            icon={<AntDesign name="facebook-square" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Facebook"
          />
          <ProfileRow
            icon={<AntDesign name="twitter" size={20} color={COLORS.textSecondary} style={styles.rowIcon}/>}
            label="Twitter"
          />
        </View>
        
        {/* --- Nút Update --- */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={updating || isUploading || isUpdatingLocation}>
          <Text style={styles.updateButtonText}>{updating ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>

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
  // --- Loading Overlay (MỚI) ---
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
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
    overflow: 'hidden',
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  // --- Photos (Đã cập nhật) ---
  photoGrid: {
    flexDirection: "row",
    height: 420, // Tăng chiều cao để chứa 6 ảnh
  },
  mainPhotoContainer: {
    flex: 0.6, // Tỷ lệ ảnh chính
    paddingRight: 8,
    position: 'relative',
    height: '100%',
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  addPhotoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subPhotoContainer: {
    flex: 0.4, // Tỷ lệ ảnh phụ
    flexDirection: "column",
    flexWrap: 'wrap', // Cho phép xuống hàng
    justifyContent: "flex-start",
    alignContent: 'space-between',
    height: '100%',
  },
  addPhotoBox: {
    width: "100%",
    height: '32%', // Chia 3 cho mỗi cột
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderStyle: "dashed",
    overflow: 'hidden',
    marginBottom: '2%', // Khoảng cách giữa các box
  },
  subPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // --- About Me & Inputs ---
  textInput: {
    height: 120,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  // --- Location Input (MỚI) ---
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    paddingLeft: 4,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  locationButton: {
    padding: 12,
  },
  // --- Profile Row ---
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  rowIcon: {
    marginRight: 16,
    width: 20,
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
  // --- Dropdown Selector ---
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
  // --- Pill ---
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  // --- Update Button ---
  updateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});