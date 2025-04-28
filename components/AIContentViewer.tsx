import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useThemeStore } from '@/store/theme-store';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AIContentItem } from '@/services/database';

interface AIContentViewerProps {
  items: AIContentItem[];
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function AIContentViewer({ items, currentPage, onNext, onPrevious }: AIContentViewerProps): JSX.Element {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

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
          if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>No content available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={onPrevious}
          style={[styles.navButton, { backgroundColor: theme.card }, currentPage === 0 && styles.disabledButton ]}
          disabled={currentPage === 0}
        >
          <ChevronLeft size={24} color={currentPage === 0 ? theme.textLight : colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.pageIndicator, { color: theme.text }]}>
          {currentPage + 1} / {totalPages}
        </Text>

        <TouchableOpacity
          onPress={onNext}
          style={[styles.navButton, { backgroundColor: theme.card }, currentPage === items.length - 1 && styles.disabledButton ]}
          disabled={currentPage === items.length - 1}
        >
          <ChevronRight size={24} color={currentPage === items.length - 1 ? theme.textLight : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Text */}
        <Text style={[styles.text, { color: theme.text }]}>{currentItem.text}</Text>

        {/* Image */}
        {currentItem.image_url ? (
          <Image
            source={{ uri: currentItem.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.card }]}>
            <Text style={[styles.placeholderText, { color: theme.textLight }]}>
              No image available
            </Text>
          </View>
        )}

        {/* Audio Button */}
        {currentItem.audio_url && (
          <TouchableOpacity
            onPress={playSound}
            style={[styles.audioButton, { backgroundColor: theme.card }]}
          >
            {isPlaying ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Volume2 size={24} color={theme.text} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  image: {
    width: width * 0.8,
    height: height * 0.3,
    borderRadius: spacing.md,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: height * 0.3,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
  audioButton: {
    padding: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.lg,
  },
});
