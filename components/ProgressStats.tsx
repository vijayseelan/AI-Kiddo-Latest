import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, Flame, Mic } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";

// Colors from design.md for claymorphic design
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

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
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: designColors.skyBlue }]}>
            <BookOpen size={22} color={designColors.deepNavy} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{booksRead}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: designColors.skyBlue }]}>
            <Clock size={22} color={designColors.deepNavy} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{minutesRead}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: designColors.skyBlue }]}>
            <Flame size={22} color={designColors.deepNavy} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: designColors.skyBlue }]}>
            <Mic size={22} color={designColors.deepNavy} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{pronunciationAccuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: 'white',
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: designColors.deepNavy,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: designColors.blue,
  },
});