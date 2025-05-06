import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, Flame, Mic } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";

// New color palette for claymorphic design
const colorPalette = {
  peach: '#faac96',     // RGB: (250, 172, 150)
  mint: '#90dec8',      // RGB: (144, 222, 200)
  lavender: '#9d8bed',  // RGB: (157, 139, 237)
  yellow: '#f8c75e',    // RGB: (248, 199, 94)
  green: '#78d9ad',     // RGB: (120, 217, 173)
  purple: '#cb97e0',    // RGB: (203, 151, 224)
  deepNavy: '#023047',  // Keeping this color for text
  white: '#ffffff',
  lightGray: '#f5f5f5'
};

// For backward compatibility
const designColors = {
  sunflower: colorPalette.yellow,
  orange: colorPalette.peach,
  blue: colorPalette.lavender,
  skyBlue: colorPalette.mint,
  deepNavy: colorPalette.deepNavy
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
    <View style={styles.outerContainer}>
      {/* Shadow layer for stronger 3D effect */}
      <View style={styles.shadowLayer} />
      <View style={styles.statsContainer}>
        <View style={styles.statsContent}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: colorPalette.mint }]}>
                <View style={styles.iconInnerShadow} />
                <BookOpen size={22} color={colorPalette.deepNavy} style={styles.icon} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{booksRead}</Text>
                <Text style={styles.statLabel}>Books</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: colorPalette.yellow }]}>
                <View style={styles.iconInnerShadow} />
                <Clock size={22} color={colorPalette.deepNavy} style={styles.icon} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{minutesRead}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsRow, styles.lastRow]}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: colorPalette.peach }]}>
                <View style={styles.iconInnerShadow} />
                <Flame size={22} color={colorPalette.deepNavy} style={styles.icon} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: colorPalette.lavender }]}>
                <View style={styles.iconInnerShadow} />
                <Mic size={22} color={colorPalette.deepNavy} style={styles.icon} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{pronunciationAccuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 0, // Remove horizontal padding to match cardContainer width
    paddingVertical: spacing.md,
    // Add perspective to enhance 3D effect
    transform: [{ perspective: 1000 }],
    position: 'relative',
    width: '100%', // Ensure full width
  },
  shadowLayer: {
    position: 'absolute',
    top: spacing.md + 6,
    left: 6, // Adjusted to match new container padding
    right: 6, // Adjusted to match new container padding
    bottom: spacing.md - 10,
    backgroundColor: 'rgba(2, 48, 71, 0.2)',
    borderRadius: 28,
    transform: [{ rotateX: '2deg' }],
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  statsContainer: {
    borderRadius: 28,
    backgroundColor: colorPalette.white,
    // Primary shadow for edge definition
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    // Thick border for clay-like appearance
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
    overflow: 'hidden',
    // Subtle rotation for 3D effect
    transform: [{ rotateX: '2deg' }, { translateY: -4 }],
    zIndex: 2,
  },
  // Inner shadows removed as requested
  statsContent: {
    padding: spacing.lg,
    zIndex: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  lastRow: {
    marginBottom: 0,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    // Enhanced claymorphism for icons
    shadowColor: colorPalette.deepNavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: colorPalette.white,
    position: 'relative',
    overflow: 'hidden',
  },
  iconInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  icon: {
    zIndex: 2,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: colorPalette.deepNavy,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colorPalette.lavender,
  },
});