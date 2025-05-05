import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "@/types/book";
import { books as mockBooks } from "@/mocks/books";
import { 
  supabase, 
  fetchBooks, 
  fetchBookById, 
  fetchBooksByCategory,
  addFavorite,
  removeFavorite,
  fetchFavorites
} from "@/lib/supabase";

interface BooksState {
  books: Book[];
  recentlyViewed: string[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAllBooks: () => Promise<void>;
  fetchBookDetails: (bookId: string) => Promise<Book | null>;
  fetchBooksByCategory: (categoryId: string) => Promise<Book[]>;
  addToRecentlyViewed: (bookId: string) => void;
  toggleFavorite: (bookId: string, childId?: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  loadFavorites: (childId: string) => Promise<void>;
  addBook: (book: Book) => void;
}

export const useBooksStore = create<BooksState>()(
  persist(
    (set, get) => ({
      books: mockBooks,
      recentlyViewed: [],
      favorites: [],
      isLoading: false,
      error: null,
      
      fetchAllBooks: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await fetchBooks();
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return;
          }
          
          // Transform data to Book objects
          const books: Book[] = data?.map((book: any) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.cover_url,
            description: book.description,
            ageRange: book.age_range,
            readingLevel: book.reading_level,
            categories: book.categories || [],
            pages: book.pages || [],
            isNew: book.is_new || false,
            isPopular: book.is_popular || false,
            isRecommended: book.is_recommended || false,
            publishedDate: book.published_date,
            language: book.language || "English",
          })) || [];
          
          set({ books, isLoading: false });
        } catch (error) {
          console.error("Fetch books error:", error);
          set({ isLoading: false, error: "Failed to fetch books" });
        }
      },
      
      fetchBookDetails: async (bookId) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await fetchBookById(bookId);
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return null;
          }
          
          if (!data) {
            set({ isLoading: false });
            return null;
          }
          
          // Transform data to Book object
          const book: Book = {
            id: data.id,
            title: data.title,
            author: data.author,
            coverUrl: data.cover_url,
            description: data.description,
            ageRange: data.age_range,
            readingLevel: data.reading_level,
            categories: data.categories || [],
            pages: data.pages || [],
            isNew: data.is_new || false,
            isPopular: data.is_popular || false,
            isRecommended: data.is_recommended || false,
            publishedDate: data.published_date,
            language: data.language || "English",
          };
          
          set({ isLoading: false });
          return book;
        } catch (error) {
          console.error("Fetch book details error:", error);
          set({ isLoading: false, error: "Failed to fetch book details" });
          return null;
        }
      },
      
      fetchBooksByCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await fetchBooksByCategory(categoryId);
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return [];
          }
          
          // Transform data to Book objects
          const books: Book[] = data?.map((book: any) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.cover_url,
            description: book.description,
            ageRange: book.age_range,
            readingLevel: book.reading_level,
            categories: book.categories || [],
            pages: book.pages || [],
            isNew: book.is_new || false,
            isPopular: book.is_popular || false,
            isRecommended: book.is_recommended || false,
            publishedDate: book.published_date,
            language: book.language || "English",
          })) || [];
          
          set({ isLoading: false });
          return books;
        } catch (error) {
          console.error("Fetch books by category error:", error);
          set({ isLoading: false, error: "Failed to fetch books by category" });
          return [];
        }
      },
      
      addToRecentlyViewed: (bookId) => 
        set((state) => {
          // Remove the book if it's already in the list
          const filtered = state.recentlyViewed.filter(id => id !== bookId);
          // Add the book to the beginning of the list
          return { 
            recentlyViewed: [bookId, ...filtered].slice(0, 10) // Keep only the 10 most recent
          };
        }),
      
      toggleFavorite: async (bookId, childId) => {
        try {
          const isFavorite = get().favorites.includes(bookId);
          
          if (childId) {
            // If childId is provided, update in Supabase
            if (isFavorite) {
              await removeFavorite(childId, bookId);
            } else {
              await addFavorite(childId, bookId);
            }
          }
          
          // Update local state
          set((state) => {
            if (isFavorite) {
              return { favorites: state.favorites.filter(id => id !== bookId) };
            } else {
              return { favorites: [...state.favorites, bookId] };
            }
          });
        } catch (error) {
          console.error("Toggle favorite error:", error);
        }
      },
      
      isFavorite: (bookId) => get().favorites.includes(bookId),
      
      loadFavorites: async (childId) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await fetchFavorites(childId);
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return;
          }
          
          // Extract book IDs from the data
          const favoriteBookIds = data?.map((favorite: any) => favorite.book_id) || [];
          
          set({ favorites: favoriteBookIds, isLoading: false });
        } catch (error) {
          console.error("Load favorites error:", error);
          set({ isLoading: false, error: "Failed to load favorites" });
        }
      },

      addBook: (book) => {
        set((state) => ({
          books: [book, ...state.books]
        }));
      }
    }),
    {
      name: "books-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these fields
        books: state.books,
        recentlyViewed: state.recentlyViewed,
        favorites: state.favorites,
      }),
    }
  )
);