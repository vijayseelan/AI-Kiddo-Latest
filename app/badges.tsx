import React from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import BadgeCard from "@/components/BadgeCard";

export default function BadgesScreen() {
  const router = useRouter();
  const { activeChild } = useUserStore();
  
  const handleBack = () => {
    router.back();
  };
  
  // Group badges by earned vs. locked
  const earnedBadges = activeChild?.badges || [];
  
  // Mock locked badges
  const lockedBadges = [
    {
      id: "locked1",
      name: "Reading Champion",
      description: "Read 20 books",
      icon: "book-open",
      dateEarned: ""
    },
    {
      id: "locked2",
      name: "Perfect Pronunciation",
      description: "Achieve 95% pronunciation accuracy",
      icon: "mic",
      dateEarned: ""
    },
    {
      id: "locked3",
      name: "Vocabulary Master",
      description: "Learn 100 new words",
      icon: "sparkles",
      dateEarned: ""
    },
    {
      id: "locked4",
      name: "Reading Marathon",
      description: "Read for 1000 minutes",
      icon: "clock",
      dateEarned: ""
    }
  ].filter(lockedBadge => 
    !earnedBadges.some(earnedBadge => earnedBadge.name === lockedBadge.name)
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Your Achievements</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgesGrid}>
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </View>
          </View>
        )}
        
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges to Earn</Text>
            <View style={styles.badgesGrid}>
              {lockedBadges.map((badge) => (
                <View key={badge.id} style={styles.lockedBadgeContainer}>
                  <BadgeCard 
                    badge={{
                      ...badge,
                      dateEarned: new Date().toISOString() // Dummy date for display
                    }}
                  />
                  <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedText}>Locked</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to Earn Badges</Text>
          <Text style={styles.infoText}>
            Complete reading activities, practice pronunciation, and maintain your reading streak to earn badges. 
            Each badge represents an achievement in your reading journey!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  lockedBadgeContainer: {
    position: "relative",
    opacity: 0.7,
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});