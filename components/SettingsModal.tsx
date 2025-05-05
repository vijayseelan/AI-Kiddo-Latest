import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Switch,
  Alert,
  ScrollView
} from "react-native";
import { 
  X, 
  UserPlus, 
  UserMinus, 
  Moon, 
  Sun, 
  Edit3, 
  LogOut,
  ChevronRight,
  User
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { useThemeStore } from "@/store/theme-store";
import { useRouter } from "expo-router";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { 
    parent, 
    childProfiles, 
    activeChild, 
    logoutParent, 
    deleteChildProfile,
    setActiveChild
  } = useUserStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleAddProfile = () => {
    onClose();
    router.push("/add-profile");
  };

  const handleEditProfile = () => {
    onClose();
    router.push("/edit-profile");
  };

  const handleDeleteProfile = () => {
    if (!activeChild) return;
    
    Alert.alert(
      "Delete Profile",
      `Are you sure you want to delete ${activeChild.name}'s profile? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (activeChild) {
              await deleteChildProfile(activeChild.id);
              onClose();
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logoutParent();
            onClose();
            router.replace("/login");
          }
        }
      ]
    );
  };

  const handleSwitchProfile = (childId: string) => {
    setActiveChild(childId);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
              <View style={styles.header}>
                <Text style={[styles.title, isDarkMode && styles.titleDark]}>Settings</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={isDarkMode ? colors.textLight : colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content}>
                {/* Profiles Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                    Profiles
                  </Text>
                  
                  {childProfiles.map(child => (
                    <TouchableOpacity 
                      key={child.id} 
                      style={[
                        styles.settingItem, 
                        isDarkMode && styles.settingItemDark,
                        activeChild?.id === child.id && styles.activeProfileItem
                      ]}
                      onPress={() => handleSwitchProfile(child.id)}
                    >
                      <View style={styles.settingItemContent}>
                        <User size={20} color={activeChild?.id === child.id ? colors.primary : isDarkMode ? colors.textLight : colors.text} />
                        <Text style={[
                          styles.settingItemText, 
                          isDarkMode && styles.settingItemTextDark,
                          activeChild?.id === child.id && styles.activeProfileText
                        ]}>
                          {child.name}
                        </Text>
                      </View>
                      {activeChild?.id === child.id && (
                        <Text style={styles.activeText}>Active</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity 
                    style={[styles.settingItem, isDarkMode && styles.settingItemDark]} 
                    onPress={handleAddProfile}
                  >
                    <View style={styles.settingItemContent}>
                      <UserPlus size={20} color={isDarkMode ? colors.textLight : colors.text} />
                      <Text style={[styles.settingItemText, isDarkMode && styles.settingItemTextDark]}>
                        Add New Profile
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDarkMode ? colors.textLight : colors.textLight} />
                  </TouchableOpacity>
                </View>

                {/* Current Profile Section */}
                {activeChild && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                      Current Profile: {activeChild.name}
                    </Text>
                    
                    <TouchableOpacity 
                      style={[styles.settingItem, isDarkMode && styles.settingItemDark]} 
                      onPress={handleEditProfile}
                    >
                      <View style={styles.settingItemContent}>
                        <Edit3 size={20} color={isDarkMode ? colors.textLight : colors.text} />
                        <Text style={[styles.settingItemText, isDarkMode && styles.settingItemTextDark]}>
                          Edit Profile
                        </Text>
                      </View>
                      <ChevronRight size={20} color={isDarkMode ? colors.textLight : colors.textLight} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.settingItem, isDarkMode && styles.settingItemDark]} 
                      onPress={handleDeleteProfile}
                    >
                      <View style={styles.settingItemContent}>
                        <UserMinus size={20} color={colors.error} />
                        <Text style={[styles.settingItemText, { color: colors.error }]}>
                          Delete Profile
                        </Text>
                      </View>
                      <ChevronRight size={20} color={isDarkMode ? colors.textLight : colors.textLight} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Appearance Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                    Appearance
                  </Text>
                  
                  <View style={[styles.settingItem, isDarkMode && styles.settingItemDark]}>
                    <View style={styles.settingItemContent}>
                      {isDarkMode ? (
                        <Moon size={20} color={colors.textLight} />
                      ) : (
                        <Sun size={20} color={colors.text} />
                      )}
                      <Text style={[styles.settingItemText, isDarkMode && styles.settingItemTextDark]}>
                        Dark Mode
                      </Text>
                    </View>
                    <Switch
                      value={isDarkMode}
                      onValueChange={toggleDarkMode}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={isDarkMode ? colors.primary : colors.background}
                    />
                  </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                    Account
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.settingItem, isDarkMode && styles.settingItemDark]} 
                    onPress={handleLogout}
                  >
                    <View style={styles.settingItemContent}>
                      <LogOut size={20} color={colors.error} />
                      <Text style={[styles.settingItemText, { color: colors.error }]}>
                        Log Out
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "80%",
  },
  modalContainerDark: {
    backgroundColor: "#1A1A1A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  titleDark: {
    color: colors.background,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionTitleDark: {
    color: colors.background,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemDark: {
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: spacing.md,
    color: colors.text,
  },
  settingItemTextDark: {
    color: colors.background,
  },
  activeProfileItem: {
    backgroundColor: colors.backgroundLight,
  },
  activeProfileText: {
    fontWeight: "600",
    color: colors.primary,
  },
  activeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default SettingsModal;