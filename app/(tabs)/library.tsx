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
        { backgroundColor: isDarkMode ? theme.card : colors.card },
        activeFilter === type && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(type)}
    >
      {icon}
      <Text
        style={[
          styles.filterText,
          { color: isDarkMode ? theme.textLight : colors.textLight },
          activeFilter === type && styles.activeFilterText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Library</Text>
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
              color={activeFilter === "all" ? colors.primary : theme.textLight}
            />
          )}
          {renderFilter(
            "reading",
            "Reading",
            <Clock
              size={18}
              color={activeFilter === "reading" ? colors.primary : theme.textLight}
            />
          )}
          {renderFilter(
            "completed",
            "Completed",
            <CheckCircle
              size={18}
              color={activeFilter === "completed" ? colors.primary : theme.textLight}
            />
          )}
          {renderFilter(
            "favorites",
            "Favorites",
            <Heart
              size={18}
              color={activeFilter === "favorites" ? colors.primary : theme.textLight}
            />
          )}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading your content...</Text>
          </View>
        ) : filteredContent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No content found. Create your first content by clicking the Create button above!
            </Text>
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
  content: {
    flex: 1,
  },
  grid: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  gridContent: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  activeFilterText: {
    color: colors.primary,
    fontWeight: "600",
  },
  booksGrid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});