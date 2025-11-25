import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { matchService } from '../../../services/matchService';
import { chatService } from '../../../services/chatService';
import { discoveryService } from '../../../services/discoveryService';

type ProfilePhoto = { url: string } | string;

type BasicProfile = {
	id: string;
	name?: string;
	age?: number;
	bio?: string;
	interests?: string[];
	photos?: ProfilePhoto[];
	distanceKm?: number;
};

type MatchDetail = {
	id: string; // matchId
	matchedAt?: string;
	user: BasicProfile;
};

export default function MatchDetailScreen() {
	const router = useRouter();
	const { id, type, initial } = useLocalSearchParams();
	const isMatchType = (type as string) === 'match';

	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [match, setMatch] = useState<MatchDetail | null>(null);
	const [likedProfile, setLikedProfile] = useState<BasicProfile | null>(null);

	// Parse any initial data passed via params (JSON string)
	useEffect(() => {
		if (initial) {
			try {
				const parsed = JSON.parse(String(initial));
				if (isMatchType) {
					setMatch(parsed);
				} else {
					setLikedProfile(parsed);
				}
			} catch {
				// ignore
			}
		}
	}, [initial, isMatchType]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setError(null);
				if (isMatchType) {
					if (!match) {
						setLoading(true);
						const res = await matchService.getMatchById(String(id));
						const m = res?.data?.match || res?.match || res?.data;
						if (mounted) setMatch(m);
					} else {
						if (mounted) setLoading(false);
					}
				} else {
					if (!likedProfile) {
						setLoading(true);
						try {
							const res = await discoveryService.getLikedSwiped(100);
							const list = res?.data?.profiles || res?.profiles || [];
							const found = list.find((p: any) => String(p?.id || p?._id) === String(id));
							if (mounted) setLikedProfile(found || null);
						} catch (e: any) {
							if (mounted) setError(e?.message || 'Failed to load liked profile');
						}
					} else {
						if (mounted) setLoading(false);
					}
				}
			} catch (e: any) {
				if (mounted) setError(e?.message || 'Failed to load details');
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [id, isMatchType, match, likedProfile]);

	const profile: BasicProfile | null = useMemo(() => {
		if (isMatchType) return match?.user || null;
		return likedProfile;
	}, [isMatchType, match, likedProfile]);

	const photos: string[] = useMemo(() => {
		const list = (profile?.photos || []) as ProfilePhoto[];
		return list
			.map((p) => (typeof p === 'string' ? p : p?.url))
			.filter(Boolean) as string[];
	}, [profile?.photos]);

	const [photoIndex, setPhotoIndex] = useState(0);
	const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
	const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
		if (viewableItems?.length) {
			setPhotoIndex(viewableItems[0].index ?? 0);
		}
	}).current;

	const getTitle = () => {
		if (!profile) return 'Profile';
		const age = profile.age ? `, ${profile.age}` : '';
		return `${profile.name || 'Profile'}${age}`;
	};

	const handleChat = async () => {
		if (!isMatchType || !match?.id || !profile) return;
		try {
			setLoading(true);
			const res = await chatService.createConversation(match.id);
			const conv = res?.data?.conversation || res?.conversation || res?.data;
			if (conv?.id) {
				// Get photos array properly
				const photos = (profile.photos || []) as ProfilePhoto[];
				const photoUrl = photos
					.map((p) => (typeof p === 'string' ? p : p?.url))
					.filter(Boolean)[0] || '';

				// Navigate with matched user's info (not self)
				router.push({
					pathname: '/(main)/(messages)/[chatId]',
					params: { 
						chatId: String(conv.id), 
						matchId: String(match.id),
						userId: String(profile.id),
						userName: profile.name || 'User',
						userAge: profile.age?.toString() || '',
						avatar: photoUrl,
					},
				});
			} else {
				Alert.alert('Error', 'Failed to open conversation');
			}
		} catch (e: any) {
			Alert.alert('Error', e?.message || 'Failed to create conversation');
		} finally {
			setLoading(false);
		}
	};

	const handleUnmatch = () => {
		if (!isMatchType || !match?.id) return;
		Alert.alert('Unmatch', 'Are you sure you want to unmatch?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Unmatch',
				style: 'destructive',
				onPress: async () => {
					try {
						await matchService.unmatch(match.id);
						Alert.alert('Unmatched', 'You have unmatched successfully.');
						router.back();
					} catch (e: any) {
						Alert.alert('Error', e?.message || 'Failed to unmatch');
					}
				},
			},
		]);
	};

	const handleSuperLike = () => {
		Alert.alert('Super Like', 'Super Like action will be added later.');
	};

	const handleUndoLike = () => {
		Alert.alert('Undo Like', 'Undo Like action will be added later.');
	};

	if (loading) {
		return (
			<LinearGradient
				colors={['#0E0F13', '#1A1C22', '#0E0F13']}
				style={styles.centered}
			>
				<ActivityIndicator size="large" color="#FF6B9D" />
				<Text style={styles.muted}>Loading...</Text>
			</LinearGradient>
		);
	}

	if (error) {
		return (
			<LinearGradient
				colors={['#0E0F13', '#1A1C22', '#0E0F13']}
				style={styles.centered}
			>
				<MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B6B" />
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
					<Text style={styles.primaryButtonText}>Go Back</Text>
				</TouchableOpacity>
			</LinearGradient>
		);
	}

	if (!profile) {
		return (
			<LinearGradient
				colors={['#0E0F13', '#1A1C22', '#0E0F13']}
				style={styles.centered}
			>
				<MaterialCommunityIcons name="account-off" size={64} color="#A0A3AD" />
				<Text style={styles.muted}>Profile not found.</Text>
				<TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
					<Text style={styles.primaryButtonText}>Go Back</Text>
				</TouchableOpacity>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient
			colors={['#0E0F13', '#1A1C22', '#0E0F13']}
			style={styles.container}
		>
			<Stack.Screen options={{ 
				title: getTitle(),
				headerStyle: { backgroundColor: '#1A1C22' },
				headerTintColor: '#FFFFFF',
			}} />
			<ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
				{/* Photos carousel */}
				{photos.length > 0 ? (
					<View style={styles.carouselContainer}>
						<FlatList
							data={photos}
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							keyExtractor={(item, idx) => `${item}-${idx}`}
							renderItem={({ item }) => (
								<View>
									<Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
									<LinearGradient
										colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
										style={styles.photoGradient}
									/>
								</View>
							)}
							onViewableItemsChanged={onViewableItemsChanged}
							viewabilityConfig={viewConfig}
						/>
						<View style={styles.dots}>
							{photos.map((_, i) => (
								<View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
							))}
						</View>
					</View>
				) : (
					<View style={[styles.carouselContainer, styles.photoPlaceholder]}>
						<MaterialCommunityIcons name="image-off" size={64} color="#3A3D4A" />
						<Text style={styles.muted}>No photos</Text>
					</View>
				)}

				{/* Info */}
				<View style={styles.infoBox}>
					<View style={styles.nameRowContainer}>
						<Text style={styles.nameRow}>
							{profile.name || 'Unknown'} 
						</Text>
						{profile.age && (
							<Text style={styles.ageText}>{profile.age}</Text>
						)}
					</View>
					{profile.distanceKm != null && (
						<View style={styles.distanceRow}>
							<Ionicons name="location" size={16} color="#FF6B9D" />
							<Text style={styles.distance}>{profile.distanceKm} km away</Text>
						</View>
					)}
					{!!profile.bio && (
						<View style={styles.bioContainer}>
							<MaterialCommunityIcons name="text" size={20} color="#FF6B9D" />
							<Text style={styles.bio}>{profile.bio}</Text>
						</View>
					)}
					{!!profile.interests?.length && (
						<View>
							<View style={styles.sectionHeader}>
								<MaterialCommunityIcons name="heart" size={20} color="#FF6B9D" />
								<Text style={styles.sectionTitle}>Interests</Text>
							</View>
							<View style={styles.chipsRow}>
								{profile.interests.slice(0, 12).map((tag, i) => (
									<LinearGradient
										key={`${tag}-${i}`}
										colors={['#FF6B9D', '#C92A6D']}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.chip}
									>
										<Text style={styles.chipText}>{tag}</Text>
									</LinearGradient>
								))}
							</View>
						</View>
					)}
				</View>

				{/* Actions */}
				<View style={styles.actionsRow}>
					{isMatchType ? (
						<>
							<TouchableOpacity style={{ flex: 1 }} onPress={handleChat}>
								<LinearGradient
									colors={['#FF6B9D', '#C92A6D']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.primaryButton}
								>
									<Ionicons name="chatbubble" size={20} color="#FFFFFF" />
									<Text style={styles.primaryButtonText}>Chat</Text>
								</LinearGradient>
							</TouchableOpacity>
							<View style={{ width: 12 }} />
							<TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleUnmatch}>
								<MaterialCommunityIcons name="account-remove" size={20} color="#FF6B6B" />
								<Text style={[styles.secondaryButtonText, { color: '#FF6B6B' }]}>Unmatch</Text>
							</TouchableOpacity>
						</>
					) : (
						<>
							<TouchableOpacity style={{ flex: 1 }} onPress={handleSuperLike}>
								<LinearGradient
									colors={['#4FC3F7', '#1E88E5']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.primaryButton}
								>
									<MaterialCommunityIcons name="star" size={20} color="#FFFFFF" />
									<Text style={styles.primaryButtonText}>Super Like</Text>
								</LinearGradient>
							</TouchableOpacity>
							<View style={{ width: 12 }} />
							<TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleUndoLike}>
								<Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
								<Text style={styles.secondaryButtonText}>Undo Like</Text>
							</TouchableOpacity>
						</>
					)}
				</View>
			</ScrollView>
		</LinearGradient>
	);
}

const { width } = Dimensions.get('window');
const PHOTO_H = Math.round(width * 1.2);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	muted: {
		color: '#A0A3AD',
		marginTop: 12,
		fontSize: 16,
	},
	errorText: {
		color: '#FF6B6B',
		marginTop: 12,
		marginBottom: 24,
		fontSize: 16,
		textAlign: 'center',
	},
	carouselContainer: {
		width: '100%',
		height: PHOTO_H,
		backgroundColor: '#1A1C22',
	},
	photo: {
		width,
		height: PHOTO_H,
	},
	photoGradient: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: PHOTO_H * 0.4,
	},
	photoPlaceholder: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	dots: {
		position: 'absolute',
		bottom: 20,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 6,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255,255,255,0.35)',
		marginHorizontal: 3,
	},
	dotActive: {
		backgroundColor: '#FF6B9D',
		width: 24,
	},
	infoBox: {
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	nameRowContainer: {
		flexDirection: 'row',
		alignItems: 'baseline',
		marginBottom: 8,
	},
	nameRow: {
		color: '#FFFFFF',
		fontSize: 28,
		fontWeight: '700',
	},
	ageText: {
		color: '#A0A3AD',
		fontSize: 24,
		fontWeight: '600',
		marginLeft: 8,
	},
	distanceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
		marginBottom: 16,
	},
	distance: {
		color: '#A0A3AD',
		marginLeft: 6,
		fontSize: 14,
	},
	bioContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 16,
		backgroundColor: 'rgba(255, 107, 157, 0.1)',
		padding: 12,
		borderRadius: 12,
		borderLeftWidth: 3,
		borderLeftColor: '#FF6B9D',
	},
	bio: {
		color: '#D8DAE0',
		flex: 1,
		marginLeft: 10,
		lineHeight: 22,
		fontSize: 15,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 12,
	},
	sectionTitle: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '700',
		marginLeft: 8,
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		rowGap: 10,
	},
	chip: {
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	chipText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: '600',
	},
	actionsRow: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		marginTop: 24,
	},
	primaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		paddingVertical: 16,
		gap: 8,
		shadowColor: '#FF6B9D',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	secondaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(58, 61, 74, 0.5)',
		borderWidth: 1,
		borderColor: '#3A3D4A',
		borderRadius: 12,
		paddingVertical: 16,
		gap: 8,
	},
	secondaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
});

