import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { memo } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Station } from '../store/playerStore';
import { Heart } from 'lucide-react-native';
import { Image } from 'expo-image';

interface StationCardProps {
  station: Station;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
}

const StationCard = ({ station, onPress, onFavoritePress, isFavorite }: StationCardProps) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress();
  };

  return (
    <Animated.View entering={FadeInRight.duration(400)}>
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          { opacity: pressed ? 0.7 : 1 }
        ]} 
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          {station.favicon ? (
            <Image 
              source={{ uri: station.favicon }} 
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
               <Text style={styles.placeholderText}>{station.name.substring(0,2).toUpperCase()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{station.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {station.language} • {station.state}
          </Text>
        </View>
        
        <Pressable 
          style={({ pressed }) => [
            styles.favoriteButton,
            { opacity: pressed ? 0.6 : 1 }
          ]} 
          onPress={handleFavorite}
        >
          <Heart 
            size={22} 
            color={isFavorite ? Colors.secondary : Colors.textMuted} 
            fill={isFavorite ? Colors.secondary : 'transparent'} 
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default memo(StationCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    width: 58,
    height: 58,
    borderRadius: 8,
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
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  favoriteButton: {
    padding: 8,
  },
});
