import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { StatusBar } from 'expo-status-bar';
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { PlaybackService } from '../service';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => PlaybackService);

async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
    ],
  });
}

export default function RootLayout() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { setInitialized, loadFavorites, loadRecentlyPlayed } = usePlayerStore();

  useEffect(() => {
    let unmounted = false;

    async function init() {
      // Small delay for native bridge stability (especially on New Arch)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      try {
        await setupPlayer();
        if (!unmounted) {
          setInitialized(true);
        }
      } catch (error: any) {
        if (error?.message?.includes('already initialized') || error?.message?.includes('setupPlayer twice')) {
          if (!unmounted) setInitialized(true);
        }
      } finally {
        if (!unmounted) {
          setIsPlayerReady(true);
          await loadFavorites();
          await loadRecentlyPlayed();
          await SplashScreen.hideAsync();
        }
      }
    }

    init();

    return () => {
      unmounted = true;
    };
  }, []);

  if (!isPlayerReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="player" 
          options={{ 
            presentation: 'modal', 
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }} 
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
