import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search as SearchIcon } from 'lucide-react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { usePlayerStore, Station } from '../../store/playerStore';
import StationCard from '../../components/StationCard';
import { useRouter } from 'expo-router';
import { fetchStations } from '../../api/radioBrowser';

const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 100;
const TITLE_ORIGINAL_SIZE = 34;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentStation, favorites, toggleFavorite } = usePlayerStore();
  const scrollY = useSharedValue(0);

  const searchStations = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const results = await fetchStations({ 
        name: text || undefined, 
        limit: 50,
        // If query is empty, maybe just fetch top voted global stations
      });
      setStations(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load: top global stations
    searchStations('');
  }, [searchStations]);

  useEffect(() => {
    if (!query) {
      searchStations('');
      return;
    }

    const timer = setTimeout(() => {
      searchStations(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchStations]);

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
      [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) * 0.5],
      [TITLE_ORIGINAL_SIZE, 20],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) * 0.5],
      [1, 0.9],
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

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const isFavorite = useCallback((stationId: string) => {
    return favorites.some(fav => fav.id === stationId);
  }, [favorites]);

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

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerWrapper, headerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, headerBlurStyle, { zIndex: 1 }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <LinearGradient
          colors={[Colors.secondary + '22', 'transparent']}
          style={styles.gradient}
        />
        <View style={styles.headerContent}>
          <Animated.Text style={[styles.title, titleStyle]}>Browse</Animated.Text>
          <View style={styles.searchContainer}>
            <SearchIcon size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Stations, Genres, Languages"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>
        </View>
      </Animated.View>

      <AnimatedFlashList
        data={stations}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={82}
        ListEmptyComponent={
          loading ? (
             <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : query.length > 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No matching stations found for &quot;{query}&quot;</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <SearchIcon size={48} color={Colors.surfaceLight} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>Search over 30,000 stations from around the world</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  title: {
    color: Colors.text,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text,
    fontSize: 16,
  },
  listContent: {
    paddingTop: HEADER_MAX_HEIGHT + 10,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
