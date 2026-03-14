import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pause, Play, X } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { Colors } from '../theme/colors';

export default function NowPlayingBar() {
  const router = useRouter();
  const { currentStation, isPlaying, setIsPlaying, stopPlayer } = usePlayerStore();

  if (!currentStation) return null;

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const handleDismiss = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopPlayer();
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push('/player');
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrapper,
        { transform: [{ scale: pressed ? 0.98 : 1 }] }
      ]}
      onPress={handlePress}
    >
      <BlurView intensity={90} tint="dark" style={styles.container}>
        <View style={styles.content}>
          <Pressable onPress={handleDismiss} style={styles.dismissButton}>
            <X size={20} color={Colors.textMuted} />
          </Pressable>
          
          <View style={styles.imageContainer}>
            {currentStation.favicon ? (
              <Image
                source={{ uri: currentStation.favicon }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>{currentStation.name.substring(0, 1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{currentStation.name}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={28} color={Colors.text} fill={Colors.text} />
            ) : (
              <Play size={28} color={Colors.text} fill={Colors.text} />
            )}
          </Pressable>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 64,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dismissButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
