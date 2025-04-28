import React from "react";
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { categories, getBooksByCategory } from "@/mocks/books";
import BookCard from "@/components/BookCard";

export default function CategoryScreen() {
  const router = useRouter();
  // Get the category ID from the URL params
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((c) => c.id === id);
  const books = getBooksByCategory(id);

  // Set the header title to the category name
  React.useEffect(() => {
    if (category) {
      router.setParams({
        title: category.name
      });
    }
  }, [category]);


  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Category not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.name} Books</Text>
        <Text style={styles.subtitle}>{books.length} books available</Text>
      </View>

      {books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={({ item }) => <BookCard book={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.booksGrid}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No books found</Text>
          <Text style={styles.emptyStateDescription}>
            We couldn't find any books in this category.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: spacing.xs,
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
    color: colors.text,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: colors.text,
  },
});