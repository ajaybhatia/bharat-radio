import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Heart, Info, Radio, Search } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import NowPlayingBar from '../../components/NowPlayingBar';
import { Colors } from '../../theme/colors';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Listen Now',
            tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: 'About',
            tabBarIcon: ({ color, size }) => <Info size={size} color={color} />,
          }}
        />
      </Tabs>
      <NowPlayingBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
});
