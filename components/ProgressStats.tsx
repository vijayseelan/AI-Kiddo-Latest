import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, Flame, Mic } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ProgressStatsProps {
  booksRead: number;
  minutesRead: number;
  streakDays: number;
  pronunciationAccuracy: number;
}

export default function ProgressStats({
  booksRead,
  minutesRead,
  streakDays,
  pronunciationAccuracy,
}: ProgressStatsProps) {
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.primaryDark + '30' : colors.primaryLight + '20' }]}>
              <BookOpen size={20} color={colors.primary} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>{booksRead}</Text>
              <Text style={[styles.statLabel, { color: theme.textLight }]}>Books</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.secondaryDark + '30' : colors.secondaryLight + '20' }]}>
              <Clock size={20} color={colors.secondary} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>{minutesRead}</Text>
              <Text style={[styles.statLabel, { color: theme.textLight }]}>Minutes</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.tertiaryDark + '30' : colors.tertiaryLight + '20' }]}>
              <Flame size={20} color={colors.tertiary} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>{streakDays}</Text>
              <Text style={[styles.statLabel, { color: theme.textLight }]}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.accent1 + '30' : colors.accent1 + '20' }]}>
              <Mic size={20} color={colors.accent1} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>{pronunciationAccuracy}%</Text>
              <Text style={[styles.statLabel, { color: theme.textLight }]}>Accuracy</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  statsCard: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
});