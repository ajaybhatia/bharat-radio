import { View, Text, StyleSheet, Linking, ScrollView, Pressable } from 'react-native';
import { Colors } from '../../theme/colors';
import { Github, Twitter, Globe, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AboutScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary + '22', 'transparent']}
        style={styles.gradient}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>BR</Text>
          </View>
          <Text style={styles.appName}>Bharat Radio</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <View style={styles.card}>
            <Text style={styles.description}>
              Bharat Radio is a premium radio streaming application designed for the best listening experience of Indian radio stations. 
              We provide a curated list of high-quality streams with a modern, glassmorphic UI.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Info</Text>
          <View style={styles.card}>
            <Text style={styles.devName}>Ajay Bhatia</Text>
            <Text style={styles.devRole}>Full Stack Developer & AI Enthusiast</Text>
            
            <View style={styles.socialLinks}>
              <Pressable onPress={() => openLink('https://github.com/ajaybhatia')} style={styles.socialButton}>
                <Github size={20} color={Colors.text} />
              </Pressable>
              <Pressable onPress={() => openLink('https://twitter.com/ajaybhatia')} style={styles.socialButton}>
                <Twitter size={20} color={Colors.text} />
              </Pressable>
              <Pressable onPress={() => openLink('https://ajaybhatia.me')} style={styles.socialButton}>
                <Globe size={20} color={Colors.text} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with <Heart size={14} color={Colors.secondary} fill={Colors.secondary} /> in India
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  logoText: {
    color: Colors.background,
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  version: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  description: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  devName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  devRole: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
