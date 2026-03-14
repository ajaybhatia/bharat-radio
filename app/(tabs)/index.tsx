import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  Pressable, 
  Text as RNText 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { fetchStations } from '../../api/radioBrowser';
import StationCard from '../../components/StationCard';
import { Station, usePlayerStore } from '../../store/playerStore';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'bollywood', name: 'Bollywood' },
  { id: 'devotional', name: 'Devotional' },
  { id: 'news', name: 'News' },
  { id: 'pop', name: 'Pop' },
  { id: 'classic', name: 'Classic' },
];

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 100;
const TITLE_ORIGINAL_SIZE = 34;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

const RecentPlayedSection = React.memo(({ recentlyPlayed, onStationPress }: { 
  recentlyPlayed: Station[], 
  onStationPress: (station: Station) => void 
}) => {
  if (recentlyPlayed.length === 0) return null;
  return (
    <View style={styles.section}>
      <RNText style={styles.sectionTitle}>Recently Played</RNText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentScroll}
      >
        {recentlyPlayed.map((station) => (
          <Pressable 
            key={station.id} 
            style={styles.recentCard}
            onPress={() => onStationPress(station)}
          >
            <View style={styles.recentImageContainer}>
              {station.favicon ? (
                <Image 
                  source={{ uri: station.favicon }} 
                  style={styles.recentImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.recentPlaceholder}>
                  <RNText style={styles.recentPlaceholderText}>
                    {station.name.substring(0, 1)}
                  </RNText>
                </View>
              )}
            </View>
            <RNText style={styles.recentName} numberOfLines={1}>
              {station.name}
            </RNText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const CategorySection = React.memo(({ selectedCategory, onCategoryPress }: {
  selectedCategory: string,
  onCategoryPress: (id: string) => void
}) => (
  <View style={styles.section}>
    <RNText style={styles.sectionTitle}>Browse Genres</RNText>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScroll}
    >
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() => onCategoryPress(cat.id)}
          style={[
            styles.categoryChip,
            selectedCategory === cat.id && styles.categoryChipActive
          ]}
        >
          <RNText style={[
            styles.categoryText,
            selectedCategory === cat.id && styles.categoryTextActive
          ]}>
            {cat.name}
          </RNText>
        </Pressable>
      ))}
    </ScrollView>
  </View>
));

export default function DiscoverScreen() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);
  
  const { 
    setCurrentStation, 
    favorites, 
    toggleFavorite, 
    recentlyPlayed, 
    loadRecentlyPlayed 
  } = usePlayerStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadStations = useCallback(async (tag?: string) => {
    setLoading(true);
    const isIndianCategory = ['bollywood', 'devotional', 'news'].includes(tag || '');
    
    // Fetch global stations for 'All', 'Pop', 'Classic' etc.
    // Fetch Indian stations only for specific local categories.
    const stations = await fetchStations({
      limit: 100,
      tag: tag === 'all' ? undefined : tag,
      country: isIndianCategory ? 'India' : undefined
    });

    setStations(stations);
    setLoading(false);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // Don't clear stations here to avoid blinking/jumping
    loadStations(categoryId);
  }, [loadStations]);

  useEffect(() => {
    loadStations();
    loadRecentlyPlayed();
  }, [loadRecentlyPlayed, loadStations]);

  const isFavorite = useCallback((stationId: string) => {
    return favorites.some(fav => fav.id === stationId);
  }, [favorites]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height };
  });

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [TITLE_ORIGINAL_SIZE, 18],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) * 0.5],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    return { fontSize, opacity };
  });

  const headerBlurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const renderItem: ListRenderItem<Station> = useCallback(({ item }) => (
    <StationCard 
      station={item} 
      onPress={() => {
        setCurrentStation(item);
        router.push('/player');
      }}
      onFavoritePress={() => toggleFavorite(item)}
      isFavorite={isFavorite(item.id)}
    />
  ), [setCurrentStation, router, toggleFavorite, isFavorite]);
  const ListHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <RecentPlayedSection 
        recentlyPlayed={recentlyPlayed} 
        onStationPress={(station) => {
          setCurrentStation(station);
          router.push('/player');
        }}
      />
      <CategorySection 
        selectedCategory={selectedCategory} 
        onCategoryPress={handleCategoryPress} 
      />
      <RNText style={[styles.sectionTitle, { marginBottom: 12 }]}>Trending Now</RNText>
      {loading && stations.length > 0 && (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
    </View>
  ), [recentlyPlayed, selectedCategory, handleCategoryPress, setCurrentStation, router, loading, stations.length]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerWrapper, headerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, headerBlurStyle, { zIndex: 1 }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <LinearGradient
          colors={[Colors.primary + '22', 'transparent']}
          style={styles.gradient}
        />
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.headerTitle, titleStyle]}>Listen Now</Animated.Text>
        </View>
      </Animated.View>

      <AnimatedFlashList
        data={stations}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => loading ? (
          <View style={styles.listLoadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : null}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={82}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  listHeader: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  recentScroll: {
    paddingHorizontal: 15,
  },
  recentCard: {
    width: 120,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  recentImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 40,
    fontWeight: 'bold',
  },
  recentName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  categoryScroll: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.background,
  },
  listContent: {
    paddingTop: HEADER_MAX_HEIGHT + 10,
    paddingBottom: 100,
  },
  listLoadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
