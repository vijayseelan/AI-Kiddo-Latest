import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { useThemeStore } from "@/store/theme-store";
import Button from "@/components/Button";

// Sample avatar options
const avatarOptions = [
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { activeChild, updateChildProfile } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [readingLevel, setReadingLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeChild) {
      setName(activeChild.name);
      setAge(activeChild.age.toString());
      setSelectedAvatar(activeChild.avatar);
      setReadingLevel(activeChild.readingLevel);
    }
  }, [activeChild]);

  const handleUpdateProfile = async () => {
    if (!activeChild) return;
    
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name for the profile");
      return;
    }

    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert("Error", "Please enter a valid age");
      return;
    }

    setIsLoading(true);
    
    try {
      await updateChildProfile(activeChild.id, {
        name: name.trim(),
        age: Number(age),
        avatar: selectedAvatar,
        readingLevel,
      });
      
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeChild) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>No active profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDarkMode ? colors.background : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Choose an Avatar</Text>
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar && styles.selectedAvatarOption
                ]}
                onPress={() => setSelectedAvatar(avatar)}
              >
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Profile Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Name</Text>
            <TextInput
              style={[
                styles.input, 
                isDarkMode && styles.inputDark
              ]}
              placeholder="Enter name"
              placeholderTextColor={isDarkMode ? "rgba(255, 255, 255, 0.5)" : colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Age</Text>
            <TextInput
              style={[
                styles.input, 
                isDarkMode && styles.inputDark
              ]}
              placeholder="Enter age"
              placeholderTextColor={isDarkMode ? "rgba(255, 255, 255, 0.5)" : colors.textLight}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Reading Level</Text>
            <View style={styles.readingLevelOptions}>
              {["beginner", "intermediate", "advanced"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.readingLevelOption,
                    isDarkMode && styles.readingLevelOptionDark,
                    readingLevel === level && styles.selectedReadingLevelOption,
                  ]}
                  onPress={() => setReadingLevel(level as any)}
                >
                  <Text
                    style={[
                      styles.readingLevelText,
                      isDarkMode && styles.textDark,
                      readingLevel === level && styles.selectedReadingLevelText,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Update Profile"
          onPress={handleUpdateProfile}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  textDark: {
    color: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  avatarSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  avatarOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedAvatarOption: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputDark: {
    backgroundColor: "#2A2A2A",
    color: colors.background,
  },
  readingLevelOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readingLevelOption: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  readingLevelOptionDark: {
    backgroundColor: "#2A2A2A",
  },
  selectedReadingLevelOption: {
    backgroundColor: colors.primary,
  },
  readingLevelText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  selectedReadingLevelText: {
    color: "white",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});