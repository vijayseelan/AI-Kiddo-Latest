import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import { Mic, Volume2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { checkPronunciation } from "@/services/pronunciation";

interface WordPronunciationCardProps {
  word: string;
  imageUrl: string;
  onResult?: (result: { accuracy: number; correct: boolean }) => void;
}

export default function WordPronunciationCard({
  word,
  imageUrl,
  onResult,
}: WordPronunciationCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ accuracy: number; correct: boolean } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

  const handleStartRecording = async () => {
    setIsRecording(true);
    setShowResult(false);
    
    // Simulate recording for 2 seconds
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(async () => {
        // Get pronunciation check result
        const pronunciationResult = await checkPronunciation(word);
        setResult(pronunciationResult);
        setShowResult(true);
        setIsProcessing(false);
        
        // Call the onResult callback if provided
        if (onResult) {
          onResult(pronunciationResult);
        }
      }, 1000);
    }, 2000);
  };

  const handlePlaySound = () => {
    // Simulate playing the word pronunciation
    console.log(`Playing pronunciation for: ${word}`);
  };

  const getResultColor = () => {
    if (!result) return theme.text;
    if (result.accuracy >= 80) return colors.success;
    if (result.accuracy >= 50) return colors.warning;
    return colors.error;
  };

  const getResultText = () => {
    if (!result) return "";
    if (result.accuracy >= 80) return "Great job!";
    if (result.accuracy >= 50) return "Almost there!";
    return "Try again!";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.contentContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        
        <View style={styles.wordContainer}>
          <Text style={[styles.word, { color: theme.text }]}>{word}</Text>
          
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.soundButton, { backgroundColor: isDarkMode ? theme.backgroundLight : colors.backgroundLight }]} 
              onPress={handlePlaySound}
            >
              <Volume2 size={20} color={theme.text} />
            </Pressable>
            
            <Pressable
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
                isProcessing && styles.micButtonProcessing,
              ]}
              onPress={handleStartRecording}
              disabled={isRecording || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Mic size={24} color="white" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
      
      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, { color: getResultColor() }]}>
            {getResultText()} ({result?.accuracy}% accuracy)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  wordContainer: {
    flex: 1,
  },
  word: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  micButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  micButtonRecording: {
    backgroundColor: colors.error,
    transform: [{ scale: 1.1 }],
  },
  micButtonProcessing: {
    backgroundColor: colors.warning,
  },
  resultContainer: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  resultText: {
    fontSize: 16,
    fontWeight: "600",
  },
});