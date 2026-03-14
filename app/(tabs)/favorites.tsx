import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart } from 'lucide-react-native';
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

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 100;
const TITLE_ORIGINAL_SIZE = 34;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, setCurrentStation } = usePlayerStore();
  const scrollY = useSharedValue(0);

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
      isFavorite={true}
    />
  ), [setCurrentStation, router, toggleFavorite]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerWrapper, headerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, headerBlurStyle, { zIndex: 1 }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <LinearGradient
          colors={[Colors.secondary + '11', 'transparent']}
          style={styles.gradient}
        />
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.headerTitle, titleStyle]}>Library</Animated.Text>
        </View>
      </Animated.View>

      <AnimatedFlashList
        data={favorites}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={82}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Heart size={64} color={Colors.surfaceLight} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Your favorite stations will appear here</Text>
          </View>
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
  centerContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
  listContent: {
    paddingTop: HEADER_MAX_HEIGHT + 10,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
