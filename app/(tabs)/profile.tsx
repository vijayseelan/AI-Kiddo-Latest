import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  Pressable,
  TouchableOpacity,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Settings, Award, BookOpen, Clock, Calendar, BarChart3, LogOut } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAuth } from "@/hooks/useAuth";
import { getActiveChild, type Child } from "@/services/database";
import Button from "@/components/Button";
import SettingsModal from "@/components/SettingsModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { parent } = useUserStore();
  const { signOut, user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const [activeChild, setActiveChild] = useState<Child | null>(null);

  useEffect(() => {
    if (user?.id) {
      getActiveChild(user.id).then(child => {
        setActiveChild(child);
      });
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation is handled by AuthProvider
    } catch (error) {
      Alert.alert('Logout Failed', 'Please try again.');
    }
  };

  const handleAssessment = () => {
    router.push("/assessment");
  };

  const handleViewBadges = () => {
    router.push("/badges");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Settings size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Parent Account Section */}
        <View style={[styles.parentSection, { backgroundColor: theme.card }]}>
          <View style={styles.parentInfo}>
            <Text style={[styles.parentName, { color: theme.text }]}>{user?.user_metadata?.name || 'Parent'}</Text>
            <Text style={[styles.parentEmail, { color: theme.textMuted }]}>{user?.email}</Text>
            <Text style={[styles.parentType, { color: theme.textMuted }]}>Parent Account</Text>
          </View>
        </View>

        {!activeChild && (
          <View style={[styles.activeChildSection, { backgroundColor: theme.cardAlt }]}>
            <Text style={[styles.noChildText, { color: theme.textMuted }]}>No active child profile</Text>
            <TouchableOpacity onPress={() => router.push('/add-profile')}>
              <Text style={[styles.addChildLink, { color: colors.primary }]}>Add a child profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeChild ? (
          <>
            <LinearGradient
              colors={[colors.primaryGradient[0], colors.primaryGradient[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.profileHeader}
            >
              <Image
                source={{ uri: activeChild.avatar }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{activeChild.name}</Text>
                <Text style={styles.age}>Age: {activeChild.age}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {activeChild.reading_level.charAt(0).toUpperCase() +
                      activeChild.reading_level.slice(1)}{" "}
                    Reader
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Reading Stats</Text>
              <View style={[styles.statsGrid, { backgroundColor: theme.card }]}>
                <View style={styles.statItem}>
                  <BookOpen size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{activeChild.totalBooksRead}</Text>
                  <Text style={[styles.statLabel, { color: theme.textLight }]}>Books Read</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={24} color={colors.secondary} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{activeChild.totalMinutesRead}</Text>
                  <Text style={[styles.statLabel, { color: theme.textLight }]}>Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Calendar size={24} color={colors.tertiary} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{activeChild.streakDays}</Text>
                  <Text style={[styles.statLabel, { color: theme.textLight }]}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <BarChart3 size={24} color={colors.accent1} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{activeChild.pronunciationAccuracy}%</Text>
                  <Text style={[styles.statLabel, { color: theme.textLight }]}>Accuracy</Text>
                </View>
              </View>
            </View>

            {activeChild.badges && activeChild.badges.length > 0 && (
              <View style={styles.badgesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Achievements</Text>
                  <TouchableOpacity onPress={handleViewBadges}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.badgesContainer, { backgroundColor: theme.card }]}>
                  {activeChild.badges.slice(0, 3).map((badge) => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <View style={[styles.badgeIconContainer, { backgroundColor: isDarkMode ? colors.darkBackgroundLight : colors.primaryLight }]}>
                        <Award size={24} color={colors.primary} />
                      </View>
                      <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
                      <Text style={[styles.badgeDate, { color: theme.textLight }]}>
                        {formatDate(badge.earnedAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.actionsSection}>
              <Button
                title="Take Reading Assessment"
                onPress={handleAssessment}
                style={styles.assessmentButton}
              />
            </View>
          </>
        ) : (
          <View style={styles.noProfileContainer}>
            <Text style={[styles.noProfileText, { color: theme.text }]}>
              No active profile selected. Please add a profile or select one from
              settings.
            </Text>
            <Button
              title="Add Profile"
              onPress={() => router.push("/add-profile")}
              style={styles.addProfileButton}
            />
          </View>
        )}

        <View style={styles.parentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Parent Account</Text>
          <View style={[styles.parentInfo, { backgroundColor: theme.card }]}>
            <View style={styles.parentHeader}>
              <View>
                <Text style={[styles.parentName, { color: theme.text }]}>{parent?.name}</Text>
                <Text style={[styles.parentEmail, { color: theme.textLight }]}>{parent?.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: isDarkMode ? colors.darkBackgroundLight : colors.backgroundLight }]}
                onPress={handleLogout}
              >
                <LogOut size={18} color={theme.text} />
                <Text style={[styles.logoutText, { color: theme.text }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  profileInfo: {
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  levelText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  statsSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    width: "50%",
    alignItems: "center",
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  badgesSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: "600",
  },
  badgesContainer: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  badgeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  badgeDate: {
    fontSize: 12,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  assessmentButton: {
    marginBottom: spacing.md,
  },
  noProfileContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  noProfileText: {
    textAlign: "center",
    marginBottom: spacing.lg,
    fontSize: 16,
  },
  addProfileButton: {
    width: "100%",
  },
  parentSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  parentInfo: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  parentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  parentName: {
    fontSize: 18,
    fontWeight: '600',
  },
  parentEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  parentType: {

    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 14,
  },
});