import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

interface ReadingProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ReadingProgressBar({
  progress,
  showPercentage = true,
  height = 8,
  color = colors.primary,
  backgroundColor = colors.border,
}: ReadingProgressBarProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.progressBar,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.progress,
            {
              width: `${progress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>{progress}% Complete</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  progressBar: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});