import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { ChevronLeft, ChevronRight, Volume2, Pause } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useThemeStore } from '@/store/theme-store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AIContentItem } from '@/services/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AIContentViewerProps {
  items: AIContentItem[];
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function AIContentViewer({ items, currentPage, onNext, onPrevious }: AIContentViewerProps): JSX.Element {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const currentItem = items[currentPage];
  const totalPages = items.length;

  // Handle audio playback
  async function playSound() {
    try {
      if (isPlaying) {
        await sound?.stopAsync();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else if (currentItem.audio_url) {
        console.log('Loading sound:', currentItem.audio_url);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentItem.audio_url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        // Listen for playback status
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsLoading(false);
            if (!status.isPlaying && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }

  // Clean up sound when changing pages
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  if (!currentItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text, fontFamily: 'Poppins-Medium' }]}>No content available</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Immersive Image Header */}
      <View style={styles.imageContainer}>
        {currentItem.image_url ? (
          <ImageBackground
            source={{ uri: currentItem.image_url }}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            

          </ImageBackground>
        ) : (
          <View style={[styles.headerImage, { backgroundColor: isDarkMode ? '#023047' : '#8ecae6' }]}>
            <LinearGradient
              colors={['transparent', isDarkMode ? '#023047' : '#8ecae6']}
              style={styles.imageGradient}
            />
            

            
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          </View>
        )}
      </View>

      {/* Content Card */}
      <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
        {/* Text */}
        <Text style={[styles.text, { color: theme.text }]}>{currentItem.text}</Text>

        {/* Audio Button */}
        {currentItem.audio_url && (
          <TouchableOpacity
            onPress={playSound}
            style={[styles.audioButton, { backgroundColor: isDarkMode ? '#023047' : '#8ecae6' }]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : isPlaying ? (
              <Pause size={24} color="white" />
            ) : (
              <Volume2 size={24} color="white" />
            )}
          </TouchableOpacity>
        )}
        
        {/* Navigation Controls at Bottom */}
        <View style={styles.bottomNavigationContainer}>
          <TouchableOpacity
            onPress={onPrevious}
            style={[styles.bottomNavButton, currentPage === 0 && styles.disabledButton]}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={24} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>

          <Text style={[styles.bottomPageIndicator, { color: theme.text }]}>
            {currentPage + 1} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={onNext}
            style={[styles.bottomNavButton, currentPage === items.length - 1 && styles.disabledButton]}
            disabled={currentPage === items.length - 1}
          >
            <ChevronRight size={24} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    width: '100%',
    height: height * 0.45, // 45% of screen height for image
  },
  headerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  bottomNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
  },
  bottomNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.3,
  },
  bottomPageIndicator: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    textAlign: 'center',
  },
  contentCard: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    // Add shadow for card effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  audioButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    // Add shadow for button
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
