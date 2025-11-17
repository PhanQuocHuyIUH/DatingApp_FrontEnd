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
		if (!isMatchType || !match?.id) return;
		try {
			setLoading(true);
			const res = await chatService.createConversation(match.id);
			const conv = res?.data?.conversation || res?.conversation || res?.data;
			if (conv?.id) {
				const other = conv.participants?.find?.((p: any) => String(p._id) !== String((profile as any)?.id || (profile as any)?._id));
				const header = other ? {
					userName: other.name,
					userAge: other.age,
					avatar: (other.photos?.find?.((ph:any)=>ph.isMain && ph.url)?.url) || (other.photos?.[0]?.url) || undefined,
				} : {};
				router.push({
					pathname: '/(main)/(messages)/[chatId]',
					params: { chatId: String(conv.id), matchId: String(match.id), ...header },
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
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#FF5A5F" />
				<Text style={styles.muted}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
					<Text style={styles.primaryButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!profile) {
		return (
			<View style={styles.centered}>
				<Text style={styles.muted}>Profile not found.</Text>
				<TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
					<Text style={styles.primaryButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Stack.Screen options={{ title: getTitle() }} />
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
								<Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
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
						<Text style={styles.muted}>No photos</Text>
					</View>
				)}

				{/* Info */}
				<View style={styles.infoBox}>
					<Text style={styles.nameRow}>
						{profile.name || 'Unknown'} {profile.age ? `· ${profile.age}` : ''}
					</Text>
					{profile.distanceKm != null && (
						<Text style={styles.distance}>{profile.distanceKm} km away</Text>
					)}
					{!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
					{!!profile.interests?.length && (
						<View style={styles.chipsRow}>
							{profile.interests.slice(0, 12).map((tag, i) => (
								<View key={`${tag}-${i}`} style={styles.chip}>
									<Text style={styles.chipText}>{tag}</Text>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Actions */}
				<View style={styles.actionsRow}>
					{isMatchType ? (
						<>
							<TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleChat}>
								<Text style={styles.primaryButtonText}>Chat</Text>
							</TouchableOpacity>
							<View style={{ width: 12 }} />
							<TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleUnmatch}>
								<Text style={styles.secondaryButtonText}>Unmatch</Text>
							</TouchableOpacity>
						</>
					) : (
						<>
							<TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleSuperLike}>
								<Text style={styles.primaryButtonText}>Super Like</Text>
							</TouchableOpacity>
							<View style={{ width: 12 }} />
							<TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleUndoLike}>
								<Text style={styles.secondaryButtonText}>Undo Like</Text>
							</TouchableOpacity>
						</>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const { width } = Dimensions.get('window');
const PHOTO_H = Math.round(width * 1.2);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0E0F13',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#0E0F13',
	},
	muted: {
		color: '#A0A3AD',
		marginTop: 8,
	},
	errorText: {
		color: '#FF6B6B',
		marginBottom: 12,
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
	photoPlaceholder: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	dots: {
		position: 'absolute',
		bottom: 12,
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
		backgroundColor: '#FFFFFF',
	},
	infoBox: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	nameRow: {
		color: '#FFFFFF',
		fontSize: 22,
		fontWeight: '700',
	},
	distance: {
		color: '#A0A3AD',
		marginTop: 4,
	},
	bio: {
		color: '#D8DAE0',
		marginTop: 12,
		lineHeight: 20,
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		rowGap: 8,
		marginTop: 12,
	},
	chip: {
		backgroundColor: '#1F2230',
		borderRadius: 16,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	chipText: {
		color: '#C9CBD3',
		fontSize: 12,
	},
	actionsRow: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		marginTop: 16,
	},
	primaryButton: {
		backgroundColor: '#FF5A5F',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#3A3D4A',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
});

