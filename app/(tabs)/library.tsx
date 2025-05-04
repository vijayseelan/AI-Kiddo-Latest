import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  FlatList,
  ActivityIndicator
} from "react-native";
import { BookOpen, Clock, CheckCircle, Heart, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { useBooksStore } from "@/store/books-store";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getAllAIGeneratedContent } from "@/services/database";
import { supabase } from "@/lib/supabase";
import { Book } from "@/types/book";
import BookCard from "@/components/BookCard";
import Button from "@/components/Button";
import ContentGeneratorModal from "@/components/ContentGeneratorModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

// Design system colors
const designColors = {
  sunflower: "#ffb703",
  orange: "#fb8500",
  blue: "#219ebc",
  skyBlue: "#8ecae6",
  deepNavy: "#023047"
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
      {/* Gradient background layers - similar to HomeScreen */}
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />
      
      {/* Blur effect overlay */}
      <BlurView intensity={100} tint="light" style={styles.blurOverlay} />

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
              color={activeFilter === "all" ? designColors.deepNavy : designColors.blue}
            />
          )}
          {renderFilter(
            "reading",
            "Reading",
            <Clock
              size={18}
              color={activeFilter === "reading" ? designColors.deepNavy : designColors.blue}
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
    backgroundColor: designColors.skyBlue,
    position: 'relative',
    overflow: 'hidden',
  },
  // Gradient background layers - from HomeScreen
  gradientBg1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.skyBlue,
    zIndex: 1,
  },
  gradientBg2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '60%',
    backgroundColor: designColors.blue,
    opacity: 0.3,
    transform: [{ skewX: '-45deg' }, { translateX: 100 }],
    zIndex: 2,
  },
  gradientBg3: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '40%',
    backgroundColor: designColors.sunflower,
    opacity: 0.5,
    transform: [{ skewY: '15deg' }, { translateY: 50 }],
    zIndex: 3,
  },
  gradientBg4: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    width: '70%',
    height: '30%',
    backgroundColor: designColors.orange,
    opacity: 0.3,
    transform: [{ skewY: '-20deg' }, { translateX: -50 }],
    zIndex: 4,
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
    color: designColors.deepNavy,
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
    color: designColors.blue,
  },
  activeFilterText: {
    color: designColors.deepNavy,
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
    color: designColors.deepNavy,
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
    color: designColors.deepNavy,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    color: designColors.blue,
    marginBottom: spacing.lg,
  },
});