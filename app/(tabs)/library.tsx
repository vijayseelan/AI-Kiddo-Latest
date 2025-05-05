import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native";
import { BookOpen, Clock, CheckCircle, Heart, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { useBooksStore } from "@/store/books-store";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { 
  getAllAIGeneratedContent, 
  deleteAIGeneratedContent 
} from "@/services/database";
import { supabase } from "@/lib/supabase";
import { Book } from "@/types/book";
import BookCard from "@/components/BookCard";
import Button from "@/components/Button";
import ContentGeneratorModal from "@/components/ContentGeneratorModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

// New color palette
const colorPalette = {
  peach: '#faac96',     // RGB: (250, 172, 150)
  mint: '#90dec8',      // RGB: (144, 222, 200)
  lavender: '#9d8bed',  // RGB: (157, 139, 237)
  yellow: '#f8c75e',    // RGB: (248, 199, 94)
  green: '#78d9ad',     // RGB: (120, 217, 173)
  purple: '#cb97e0',    // RGB: (203, 151, 224)
  deepNavy: '#023047'   // Keeping this color for text
};

// For backward compatibility
const designColors = {
  sunflower: colorPalette.yellow,
  orange: colorPalette.peach,
  blue: colorPalette.lavender,
  skyBlue: colorPalette.mint,
  deepNavy: colorPalette.deepNavy
};

type FilterType = "all" | "reading" | "completed" | "favorites";

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showGenerator, setShowGenerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const { user } = useUserStore();
  const { favorites } = useBooksStore();
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  // Function to fetch content
  const fetchContent = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log('[Library] Auth user:', authUser);
    
    if (authUser?.id) {
      setIsLoading(true);
      try {
        console.log('[Library] Fetching content for user:', authUser.id);
        const { contents, error } = await getAllAIGeneratedContent(authUser.id);
        if (error) {
          console.error('[Library] Error fetching content:', error);
        } else {
          console.log('[Library] Fetched content:', contents);
          setGeneratedContent(contents);
        }
      } catch (error) {
        console.error('[Library] Error in fetchContent:', error);
      }
      setIsLoading(false);
    } else {
      console.log('[Library] No authenticated user found');
    }
  };

  // Function to handle deletion of content
  const handleDeleteContent = async (contentId: string) => {
    console.log(`[Library] Attempting to delete content: ${contentId}`);
    // Optional: Add a loading indicator state for deletion
    const { success, error } = await deleteAIGeneratedContent(contentId);
    if (success) {
      console.log(`[Library] Successfully deleted content: ${contentId}`);
      // Remove the deleted item from the local state
      setGeneratedContent(prevContent => 
        prevContent.filter(content => content.id !== contentId)
      );
      // Optional: Show a success message (e.g., using a toast notification)
    } else {
      console.error(`[Library] Failed to delete content: ${contentId}`, error);
      // Optional: Show an error message
      Alert.alert('Error', 'Failed to delete content. Please try again.');
    }
    // Optional: Stop loading indicator
  };

  // Fetch content when component mounts and when generator modal closes
  useEffect(() => {
    fetchContent();
  }, [showGenerator]);

  const getFilteredContent = () => {
    switch (activeFilter) {
      case "reading":
        return generatedContent.filter(
          (content) => 
            user.readingProgress[content.id] && 
            user.readingProgress[content.id].completionPercentage < 100
        );
      case "completed":
        return generatedContent.filter(
          (content) => 
            user.readingProgress[content.id] && 
            user.readingProgress[content.id].completionPercentage === 100
        );
      case "favorites":
        return generatedContent.filter((content) => content.is_favorite);
      default:
        return generatedContent;
    }
  };

  const filteredContent = getFilteredContent();

  const renderFilter = (type: FilterType, label: string, icon: React.ReactNode) => (
    <Pressable
      style={[
        styles.filterButton,
        activeFilter === type && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(type)}
    >
      {icon}
      <Text
        style={[
          styles.filterText,
          activeFilter === type && styles.activeFilterText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Main gradient background */}
      <LinearGradient
        colors={[
          colorPalette.mint,
          colorPalette.peach,
          colorPalette.yellow,
          colorPalette.lavender
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainGradient}
      />
      
      {/* Accent gradient overlay */}
      <LinearGradient
        colors={[
          'transparent',
          colorPalette.green,
          'transparent',
          colorPalette.purple
        ]}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentGradient}
      />
      
      {/* Blur effect overlay */}
      <BlurView intensity={80} tint="light" style={styles.blurOverlay} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>My Library</Text>
        <Button 
          title="Create" 
          onPress={() => setShowGenerator(true)}
          variant="primary"
          size="small"
          icon={<Plus size={16} color="white" />}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilter(
            "all",
            "All",
            <BookOpen
              size={18}
              color={activeFilter === "all" ? colorPalette.deepNavy : colorPalette.lavender}
            />
          )}
          {renderFilter(
            "reading",
            "Reading",
            <Clock
              size={18}
              color={activeFilter === "reading" ? colorPalette.deepNavy : colorPalette.lavender}
            />
          )}
          {renderFilter(
            "completed",
            "Completed",
            <CheckCircle
              size={18}
              color={activeFilter === "completed" ? designColors.deepNavy : designColors.blue}
            />
          )}
          {renderFilter(
            "favorites",
            "Favorites",
            <Heart
              size={18}
              color={activeFilter === "favorites" ? designColors.deepNavy : designColors.blue}
            />
          )}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={designColors.orange} />
            <Text style={styles.loadingText}>Loading your content...</Text>
          </View>
        ) : filteredContent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Your library is empty</Text>
              <Text style={styles.emptyText}>
                Create your first content by clicking the Create button above!
              </Text>
              <Button 
                title="Create Content" 
                onPress={() => setShowGenerator(true)}
                variant="primary"
                size="medium"
                icon={<Plus size={16} color="white" />}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredContent}
            renderItem={({ item }) => (
              <BookCard
                key={item.id}
                book={{
                  id: item.id,
                  title: item.title,
                  author: 'AI Kiddo',
                  description: item.description || '',
                  readingLevel: item.reading_level,
                  coverUrl: item.image_url,
                  audioUrl: item.audio_url,
                  generatedContent: item
                } as Book}
                progress={user.readingProgress[item.id]?.completionPercentage || 0}
                onDelete={handleDeleteContent}
              />
            )}
            numColumns={2}
            style={styles.grid}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ContentGeneratorModal 
        visible={showGenerator} 
        onClose={() => setShowGenerator(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container and background styles
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // New gradient styles
  mainGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  accentGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
    zIndex: 2,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  // Content styles
  content: {
    flex: 1,
    zIndex: 10,
  },
  grid: {
    flex: 1,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  gridContent: {
    paddingVertical: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Header styles
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: colorPalette.deepNavy,
  },
  // Filters styles
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
    zIndex: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 24,
    backgroundColor: 'white',
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  activeFilterButton: {
    backgroundColor: designColors.sunflower,
  },
  filterText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colorPalette.lavender,
  },
  activeFilterText: {
    color: colorPalette.deepNavy,
    fontFamily: 'Poppins-SemiBold',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colorPalette.deepNavy,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 10,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    width: '90%',
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colorPalette.deepNavy,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    color: colorPalette.lavender,
    marginBottom: spacing.lg,
  },
});