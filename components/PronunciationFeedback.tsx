import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Volume2, Check, X, AlertCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { PronunciationFeedback as PronunciationFeedbackType } from "@/types/user";

interface PronunciationFeedbackProps {
  feedback: PronunciationFeedbackType;
  onPronounce?: (word: string) => void;
}

export default function PronunciationFeedback({ 
  feedback, 
  onPronounce 
}: PronunciationFeedbackProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return colors.success;
    if (accuracy >= 75) return "#FFC107"; // amber
    return colors.error;
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 90) return <Check size={16} color="white" />;
    if (accuracy >= 75) return <AlertCircle size={16} color="white" />;
    return <X size={16} color="white" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.word}>{feedback.word}</Text>
        <Pressable 
          style={styles.pronounceButton}
          onPress={() => onPronounce && onPronounce(feedback.word)}
        >
          <Volume2 size={18} color={colors.primary} />
        </Pressable>
      </View>
      
      <View style={styles.feedbackRow}>
        <View 
          style={[
            styles.accuracyBadge, 
            { backgroundColor: getAccuracyColor(feedback.accuracy) }
          ]}
        >
          {getAccuracyIcon(feedback.accuracy)}
          <Text style={styles.accuracyText}>{feedback.accuracy}%</Text>
        </View>
        
        {feedback.suggestion && (
          <Text style={styles.suggestion}>{feedback.suggestion}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  word: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  pronounceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accuracyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  accuracyText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
  suggestion: {
    flex: 1,
    fontSize: 14,
    color: colors.textLight,
  },
});