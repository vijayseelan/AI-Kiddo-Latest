import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Pressable, ActivityIndicator, Animated, ScrollView, Dimensions, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Volume2, Pause, ImageOff, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { spacing } from '@/constants/spacing';
import { useThemeColors } from '@/hooks/useThemeColors';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface GeneratedItem {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  imageError?: string;
  audioError?: string;
  isProcessingImage: boolean;
  isProcessingAudio: boolean;
}

interface AIGeneratedContentProps {
  items: GeneratedItem[];
}

const GeneratedItemDisplay: React.FC<{ item: GeneratedItem }> = ({ item }) => {
  const theme = useThemeColors();
  const { playAudio, stopAudio, isPlaying: isThisAudioPlaying, loadingState: audioLoadingState, currentAudioUrl } = useAudioPlayer();

  const handlePlayAudio = () => {
    if (!item.audioUrl) return;
    if (isThisAudioPlaying && currentAudioUrl === item.audioUrl) {
      stopAudio();
    } else {
      playAudio(item.audioUrl);
    }
  };

  const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: theme.card,
      borderRadius: spacing.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: '100%',
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    imageContainer: {
      width: 80,
      height: 80,
      borderRadius: spacing.sm,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    textContainer: {
      flex: 1,
    },
    itemText: {
      ...typography.body,
      color: theme.text,
      marginBottom: spacing.sm,
    },
    audioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    audioButton: {
      padding: spacing.xs,
      backgroundColor: theme.primary,
      borderRadius: 20,
    },
    errorText: {
      fontSize: 12,
      color: theme.error,
      fontStyle: 'italic',
      marginLeft: spacing.sm,
    },
    loadingIndicator: {
      marginRight: spacing.sm,
    }
  });

  return (
    <View style={styles.itemContainer}>
      <View style={styles.contentRow}>
        <View style={styles.imageContainer}>
          {item.isProcessingImage ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <ImageOff size={32} color={theme.textMuted} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.itemText}>{item.text}</Text>
          {item.imageError && (
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <AlertCircle size={14} color={theme.error} />
              <Text style={styles.errorText}>Image: {item.imageError}</Text>
            </View>
          )}

          {(item.isProcessingAudio || item.audioUrl || item.audioError) && (
            <View style={styles.audioRow}>
              {item.isProcessingAudio ? (
                <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.primary} />
              ) : item.audioUrl ? (
                <Pressable onPress={() => { console.log('Audio button pressed for item:', item.id); handlePlayAudio(); }} style={styles.audioButton}>
                  {isThisAudioPlaying && currentAudioUrl === item.audioUrl ? (
                    <Pause size={20} color={theme.background} />
                  ) : (
                    <Volume2 size={20} color={theme.background} />
                  )}
                </Pressable>
              ) : null}
              
              {item.audioError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1}}>
                  <AlertCircle size={14} color={theme.error} />
                  <Text style={styles.errorText} numberOfLines={1} ellipsizeMode="tail">Audio: {item.audioError}</Text>
                </View>
              )}
              {audioLoadingState === 'loading' && currentAudioUrl === item.audioUrl && (
                <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.primary} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default function AIGeneratedContent({ items }: AIGeneratedContentProps) {
  const theme = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    scrollViewContent: {
      padding: spacing.md,
      alignItems: 'center',
    },
    noItemsText: {
      ...typography.body,
      color: theme.textMuted,
      marginTop: spacing.xl,
    }
  });

  if (!items || items.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.noItemsText}>No content generated yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      {items.map((item) => (
        <GeneratedItemDisplay key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
