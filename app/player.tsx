import { View, Text, StyleSheet, Pressable, Dimensions, Share as RNShare } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause, Volume2, VolumeX, Timer, Share } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { usePlayerStore } from '../store/playerStore';
import { useEffect } from 'react';
import { Colors } from '../theme/colors';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.8;

export default function PlayerScreen() {
  const router = useRouter();
  const { 
    currentStation, 
    isPlaying, 
    setIsPlaying, 
    volume, 
    setVolume, 
    sleepTimerRemaining, 
    setSleepTimer 
  } = usePlayerStore();
  const artworkScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(isPlaying ? 1 : 0.8, { damping: 15 });
  }, [isPlaying, artworkScale]);

  const animatedArtworkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
  };

  const handleSleepTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sleepTimerRemaining === null) setSleepTimer(15);
    else if (sleepTimerRemaining === 15) setSleepTimer(30);
    else if (sleepTimerRemaining === 30) setSleepTimer(45);
    else if (sleepTimerRemaining === 45) setSleepTimer(60);
    else setSleepTimer(null);
  };

  const handleShare = async () => {
    if (!currentStation) return;
    try {
      await RNShare.share({
        message: `Check out ${currentStation.name} on Bharat Radio! Listen here: ${currentStation.url}`,
        title: currentStation.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!currentStation) return null;

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <View style={StyleSheet.absoluteFill}>
        {currentStation.favicon ? (
          <Image
            source={{ uri: currentStation.favicon }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={100}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface }]} />
        )}
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.dismissButton}>
            <View style={styles.dismissBar} />
          </Pressable>
        </View>

        <View style={styles.artworkContainer}>
          <Animated.View style={[styles.artworkWrapper, animatedArtworkStyle]}>
            {currentStation.favicon ? (
              <Image
                source={{ uri: currentStation.favicon }}
                style={styles.artwork}
                contentFit="cover"
                transition={500}
              />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder]}>
                <Text style={styles.placeholderText}>
                  {currentStation.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Info & Controls */}
        <View style={styles.bottomSection}>
          <View style={styles.infoContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{currentStation.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {currentStation.language} • {currentStation.state}
              </Text>
            </View>
            <View style={styles.sideControls}>
              <Pressable onPress={handleSleepTimer} style={styles.iconButton}>
                <Timer size={22} color={sleepTimerRemaining ? Colors.primary : "rgba(255,255,255,0.6)"} />
                {sleepTimerRemaining && (
                  <Text style={styles.timerText}>{sleepTimerRemaining}m</Text>
                )}
              </Pressable>
              <Pressable onPress={handleShare} style={styles.iconButton}>
                <Share size={22} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>
          </View>

          {/* Progress (Modern Style) */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '100%' }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>0:00</Text>
              <Text style={[styles.timeText, { color: '#FF3B30' }]}>LIVE</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.mainControls}>
            <Pressable onPress={handlePlayPause} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              {isPlaying ? (
                <Pause size={64} color="#FFF" fill="#FFF" />
              ) : (
                <Play size={64} color="#FFF" fill="#FFF" />
              )}
            </Pressable>
          </View>

          {/* Volume */}
          <View style={styles.volumeContainer}>
            <Pressable onPress={() => handleVolumeChange(0)}>
              <VolumeX size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#FFF"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor="#FFF"
            />
            <Pressable onPress={() => handleVolumeChange(1)}>
              <Volume2 size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
  },
  dismissButton: {
    padding: 20,
  },
  dismissBar: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  artworkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  artworkPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  placeholderText: {
    color: '#FFF',
    fontSize: 80,
    fontWeight: 'bold',
    opacity: 0.2,
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  sideControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  timerText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -4,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 12,
    height: 40,
  },
});
