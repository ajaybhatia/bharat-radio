import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import * as Haptics from 'expo-haptics';

export interface Station {
  id: string;
  name: string;
  url: string;
  favicon: string;
  tags: string[];
  state: string;
  language: string;
}

interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  recentlyPlayed: Station[];
  sleepTimerRemaining: number | null;
  volume: number;
  isInitialized: boolean;
  setCurrentStation: (station: Station) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleFavorite: (station: Station) => void;
  setVolume: (volume: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  loadFavorites: () => Promise<void>;
  loadRecentlyPlayed: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  stopPlayer: () => Promise<void>;
}

const safeTrackPlayer = async (action: () => Promise<any>, state: PlayerState) => {
  if (!state.isInitialized) {
    return;
  }
  try {
    return await action();
  } catch (error: any) {
    if (!error?.message?.includes('not initialized')) {
      console.error('TrackPlayer error:', error);
    }
  }
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStation: null,
  isPlaying: false,
  favorites: [],
  recentlyPlayed: [],
  sleepTimerRemaining: null,
  volume: 1.0,
  isInitialized: false,

  setInitialized: (initialized) => set({ isInitialized: initialized }),

  setCurrentStation: async (station) => {
    const { recentlyPlayed } = get();
    const newRecents = [
      station,
      ...recentlyPlayed.filter(s => s.id !== station.id)
    ].slice(0, 10);
    
    set({ currentStation: station, isPlaying: true, recentlyPlayed: newRecents });
    
    await safeTrackPlayer(async () => {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: station.id,
        url: station.url,
        title: station.name,
        artist: `${station.language} • ${station.state}`,
        artwork: station.favicon,
      });
      await TrackPlayer.play();
    }, get());

    try {
      await AsyncStorage.setItem('recentlyPlayed', JSON.stringify(newRecents));
    } catch (e) {
      console.error('Failed to save recently played', e);
    }
  },
  
  setIsPlaying: async (isPlaying) => {
    set({ isPlaying });
    await safeTrackPlayer(async () => {
      if (isPlaying) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
    }, get());
  },
  
  toggleFavorite: async (station) => {
    const { favorites } = get();
    const isFav = favorites.some((s) => s.id === station.id);
    let newFavorites;
    
    if (isFav) {
      newFavorites = favorites.filter((s) => s.id !== station.id);
    } else {
      newFavorites = [...favorites, station];
    }
    
    set({ favorites: newFavorites });
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  },

  setVolume: async (volume) => {
    set({ volume });
    await safeTrackPlayer(async () => {
      await TrackPlayer.setVolume(volume);
    }, get());
  },

  loadFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        set({ favorites: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  },

  loadRecentlyPlayed: async () => {
    try {
      const stored = await AsyncStorage.getItem('recentlyPlayed');
      if (stored) {
        set({ recentlyPlayed: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load recently played', e);
    }
  },

  setSleepTimer: (minutes) => {
    const { setIsPlaying } = get();
    
    if ((global as any).sleepTimerInterval) {
      clearInterval((global as any).sleepTimerInterval);
      (global as any).sleepTimerInterval = null;
    }

    if (minutes === null) {
      set({ sleepTimerRemaining: null });
      return;
    }

    set({ sleepTimerRemaining: minutes });

    (global as any).sleepTimerInterval = setInterval(() => {
      const remaining = get().sleepTimerRemaining;
      if (remaining === null) {
        clearInterval((global as any).sleepTimerInterval);
        return;
      }

      if (remaining <= 1) {
        set({ sleepTimerRemaining: null });
        clearInterval((global as any).sleepTimerInterval);
        setIsPlaying(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        set({ sleepTimerRemaining: remaining - 1 });
      }
    }, 60000);
  },

  stopPlayer: async () => {
    set({ currentStation: null, isPlaying: false });
    await safeTrackPlayer(async () => {
      await TrackPlayer.reset();
    }, get());
  }
}));
