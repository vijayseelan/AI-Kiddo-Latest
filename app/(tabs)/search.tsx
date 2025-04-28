import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  FlatList,
  TouchableOpacity
} from "react-native";
import { Search, X } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { books, categories } from "@/mocks/books";
import BookCard from "@/components/BookCard";
import CategoryCard from "@/components/CategoryCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const filteredBooks = books.filter((book) => {
    const matchesSearch = searchQuery
      ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = activeCategory
      ? book.categories && book.categories.includes(
          categories.find((c) => c.id === activeCategory)?.name || ""
        )
      : true;
    
    return matchesSearch && matchesCategory;
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleCategory = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme.text }]}>Discover Books</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Search size={20} color={theme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by title or author"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X
              size={20}
              color={theme.textLight}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {searchQuery
            ? `Results for "${searchQuery}"`
            : activeCategory
            ? `${categories.find((c) => c.id === activeCategory)?.name} Books`
            : "All Books"}
        </Text>
        
        {filteredBooks.length > 0 ? (
          <FlatList
            data={filteredBooks}
            renderItem={({ item }) => <BookCard book={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={[
              styles.booksGrid,
              { paddingBottom: insets.bottom + 80 }
            ]}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No books found</Text>
            <Text style={[styles.emptyStateDescription, { color: theme.textLight }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  clearIcon: {
    padding: spacing.xs,
  },
  categoriesSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
  },
  resultsSection: {
    flex: 1,
    marginTop: spacing.lg,
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
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});