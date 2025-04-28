import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Parent, Child, Badge, AssessmentResult, ReadingLevel, PronunciationFeedback } from "@/types/user";
import { currentUser, parentUser, childProfiles } from "@/mocks/users";
import { 
  supabase, 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserProfiles, 
  fetchChildProfile,
  createChildProfile as createSupabaseChildProfile,
  updateChildProfile as updateSupabaseChildProfile,
  deleteChildProfile as deleteSupabaseChildProfile,
  updateReadingProgress as updateSupabaseReadingProgress,
  fetchReadingProgress,
  addFavorite,
  removeFavorite,
  addBadge as addSupabaseBadge,
  saveAssessmentResult as saveSupabaseAssessmentResult
} from "@/lib/supabase";

interface UserState {
  // Parent user state
  parent: Parent | null;
  isParentLoggedIn: boolean;
  
  // Active child profile
  activeChildId: string | null;
  activeChild: Child | null;
  
  // All child profiles
  childProfiles: Child[];
  
  // Legacy user for backward compatibility
  user: User;
  isLoggedIn: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Parent actions
  loginParent: (email: string, password: string) => Promise<boolean>;
  logoutParent: () => Promise<void>;
  updateParent: (parent: Partial<Parent>) => Promise<void>;
  
  // Child profile actions
  createChildProfile: (child: Omit<Child, "id" | "parentId" | "badges">) => Promise<void>;
  updateChildProfile: (childId: string, data: Partial<Child>) => Promise<void>;
  deleteChildProfile: (childId: string) => Promise<void>;
  setActiveChild: (childId: string) => void;
  
  // Reading progress actions
  updateReadingProgress: (childId: string, bookId: string, lastPageRead: number, totalPages: number) => Promise<void>;
  updateBookProgress: (bookId: string, lastPageRead: number, totalPages: number) => Promise<void>; // Legacy method
  addFavoriteBook: (childId: string, bookId: string) => Promise<void>;
  removeFavoriteBook: (childId: string, bookId: string) => Promise<void>;
  
  // Gamification actions
  incrementStreakDays: (childId: string) => Promise<void>;
  incrementBooksRead: (childId: string) => Promise<void>;
  addMinutesRead: (childId: string, minutes: number) => Promise<void>;
  addBadge: (childId: string, badge: Omit<Badge, "id" | "dateEarned">) => Promise<void>;
  
  // Assessment actions
  saveAssessmentResult: (childId: string, result: AssessmentResult) => Promise<void>;
  updatePronunciationAccuracy: (childId: string, accuracy: number) => Promise<void>;
  
  // Legacy actions for backward compatibility
  updateUser: (user: Partial<User>) => void;
  login: () => void;
  logout: () => void;
  
  // Session management
  initializeSession: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      parent: null,
      isParentLoggedIn: false,
      activeChildId: null,
      activeChild: null,
      childProfiles: [],
      
      // Legacy user state
      user: currentUser as User,
      isLoggedIn: false,
      
      // Loading states
      isLoading: false,
      error: null,
      
      // Initialize session from Supabase
      initializeSession: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, error } = await getCurrentUser();
          
          if (error || !user) {
            set({ 
              isLoading: false, 
              isParentLoggedIn: false,
              parent: null,
              activeChildId: null,
              activeChild: null,
              childProfiles: [],
              isLoggedIn: false
            });
            return;
          }
          
          // User is logged in, fetch parent profile
          const parent: Parent = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || "",
            childProfiles: [],
          };
          
          // Fetch child profiles
          const { data: profiles, error: profilesError } = await fetchUserProfiles(user.id);
          
          if (profilesError) {
            set({ 
              isLoading: false, 
              error: "Failed to fetch child profiles",
              parent,
              isParentLoggedIn: true,
              childProfiles: [],
              isLoggedIn: true
            });
            return;
          }
          
          // Transform profiles to Child objects
          const childProfiles: Child[] = profiles?.map((profile: any) => ({
            id: profile.id,
            parentId: profile.parent_id,
            name: profile.name,
            age: profile.age,
            avatar: profile.avatar || "",
            readingLevel: profile.reading_level as ReadingLevel,
            streakDays: profile.streak_days || 0,
            totalBooksRead: profile.total_books_read || 0,
            totalMinutesRead: profile.total_minutes_read || 0,
            favoriteBooks: profile.favorite_books || [],
            badges: profile.badges || [],
            readingProgress: profile.reading_progress || {},
            lastAssessmentDate: profile.last_assessment_date || new Date().toISOString(),
            pronunciationAccuracy: profile.pronunciation_accuracy || 0
          })) || [];
          
          // Update parent's childProfiles array
          parent.childProfiles = childProfiles.map(child => child.id);
          
          // Set active child if available
          const activeChildId = childProfiles.length > 0 ? childProfiles[0].id : null;
          const activeChild = childProfiles.length > 0 ? childProfiles[0] : null;
          
          // Update legacy user for backward compatibility
          const legacyUser = activeChild ? {
            id: activeChild.id,
            name: activeChild.name,
            age: activeChild.age,
            avatar: activeChild.avatar,
            readingLevel: activeChild.readingLevel,
            streakDays: activeChild.streakDays,
            totalBooksRead: activeChild.totalBooksRead,
            totalMinutesRead: activeChild.totalMinutesRead,
            favoriteBooks: activeChild.favoriteBooks,
            readingProgress: activeChild.readingProgress
          } as User : currentUser as User;
          
          set({
            isLoading: false,
            parent,
            isParentLoggedIn: true,
            childProfiles,
            activeChildId,
            activeChild,
            user: legacyUser,
            isLoggedIn: true
          });
          
        } catch (error) {
          console.error("Session initialization error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to initialize session",
            isParentLoggedIn: false,
            isLoggedIn: false
          });
        }
      },
      
      // Parent actions
      loginParent: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await signIn(email, password);
          
          if (error || !data.user) {
            set({ 
              isLoading: false, 
              error: error?.message || "Login failed",
              isParentLoggedIn: false
            });
            return false;
          }
          
          // User is logged in, fetch parent profile
          const parent: Parent = {
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name || "",
            childProfiles: [],
          };
          
          // Fetch child profiles
          const { data: profiles, error: profilesError } = await fetchUserProfiles(data.user.id);
          
          if (profilesError) {
            set({ 
              isLoading: false, 
              error: "Failed to fetch child profiles",
              parent,
              isParentLoggedIn: true,
              childProfiles: [],
              isLoggedIn: true
            });
            return true;
          }
          
          // Transform profiles to Child objects
          const childProfiles: Child[] = profiles?.map((profile: any) => ({
            id: profile.id,
            parentId: profile.parent_id,
            name: profile.name,
            age: profile.age,
            avatar: profile.avatar || "",
            readingLevel: profile.reading_level as ReadingLevel,
            streakDays: profile.streak_days || 0,
            totalBooksRead: profile.total_books_read || 0,
            totalMinutesRead: profile.total_minutes_read || 0,
            favoriteBooks: profile.favorite_books || [],
            badges: profile.badges || [],
            readingProgress: profile.reading_progress || {},
            lastAssessmentDate: profile.last_assessment_date || new Date().toISOString(),
            pronunciationAccuracy: profile.pronunciation_accuracy || 0
          })) || [];
          
          // Update parent's childProfiles array
          parent.childProfiles = childProfiles.map(child => child.id);
          
          // Set active child if available
          const activeChildId = childProfiles.length > 0 ? childProfiles[0].id : null;
          const activeChild = childProfiles.length > 0 ? childProfiles[0] : null;
          
          // Update legacy user for backward compatibility
          const legacyUser = activeChild ? {
            id: activeChild.id,
            name: activeChild.name,
            age: activeChild.age,
            avatar: activeChild.avatar,
            readingLevel: activeChild.readingLevel,
            streakDays: activeChild.streakDays,
            totalBooksRead: activeChild.totalBooksRead,
            totalMinutesRead: activeChild.totalMinutesRead,
            favoriteBooks: activeChild.favoriteBooks,
            readingProgress: activeChild.readingProgress
          } as User : currentUser as User;
          
          set({
            isLoading: false,
            parent,
            isParentLoggedIn: true,
            childProfiles,
            activeChildId,
            activeChild,
            user: legacyUser,
            isLoggedIn: true
          });
          
          return true;
        } catch (error) {
          console.error("Login error:", error);
          set({ 
            isLoading: false, 
            error: "Login failed",
            isParentLoggedIn: false
          });
          return false;
        }
      },
      
      logoutParent: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await signOut();
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message,
            });
            return;
          }
          
          set({ 
            isLoading: false,
            parent: null,
            isParentLoggedIn: false,
            activeChildId: null,
            activeChild: null,
            childProfiles: [],
            isLoggedIn: false
          });
        } catch (error) {
          console.error("Logout error:", error);
          set({ 
            isLoading: false, 
            error: "Logout failed"
          });
        }
      },
      
      updateParent: async (parentData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('parents')
            .update(parentData)
            .eq('id', get().parent?.id)
            .select();
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message
            });
            return;
          }
          
          set((state) => ({
            isLoading: false,
            parent: state.parent ? { ...state.parent, ...parentData } : null
          }));
        } catch (error) {
          console.error("Update parent error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update parent profile"
          });
        }
      },
      
      // Child profile actions
      createChildProfile: async (childData) => {
        set({ isLoading: true, error: null });
        
        try {
          const parentId = get().parent?.id;
          
          if (!parentId) {
            set({ 
              isLoading: false, 
              error: "Parent not logged in"
            });
            return;
          }
          
          // Prepare child profile data for Supabase
          const profileData = {
            parent_id: parentId,
            name: childData.name,
            age: childData.age,
            avatar: childData.avatar || "",
            reading_level: childData.readingLevel,
            streak_days: 0,
            total_books_read: 0,
            total_minutes_read: 0,
            favorite_books: [],
            badges: [],
            reading_progress: {},
            last_assessment_date: new Date().toISOString(),
            pronunciation_accuracy: 0
          };
          
          // Create profile in Supabase
          const { data, error } = await createSupabaseChildProfile(profileData);
          
          if (error || !data || data.length === 0) {
            set({ 
              isLoading: false, 
              error: error?.message || "Failed to create child profile"
            });
            return;
          }
          
          // Transform the created profile to Child object
          const newChild: Child = {
            id: data[0].id,
            parentId,
            name: data[0].name,
            age: data[0].age,
            avatar: data[0].avatar || "",
            readingLevel: data[0].reading_level as ReadingLevel,
            streakDays: data[0].streak_days || 0,
            totalBooksRead: data[0].total_books_read || 0,
            totalMinutesRead: data[0].total_minutes_read || 0,
            favoriteBooks: data[0].favorite_books || [],
            badges: data[0].badges || [],
            readingProgress: data[0].reading_progress || {},
            lastAssessmentDate: data[0].last_assessment_date || new Date().toISOString(),
            pronunciationAccuracy: data[0].pronunciation_accuracy || 0
          };
          
          set((state) => {
            const updatedProfiles = [...state.childProfiles, newChild];
            
            // Also update parent's childProfiles array
            const updatedParent = state.parent 
              ? { 
                  ...state.parent, 
                  childProfiles: [...state.parent.childProfiles, newChild.id] 
                } 
              : null;
            
            return {
              isLoading: false,
              childProfiles: updatedProfiles,
              parent: updatedParent,
              // If this is the first child, make it active
              activeChildId: state.activeChildId || newChild.id,
              activeChild: state.activeChildId ? state.activeChild : newChild,
              // Update legacy user if this is the first child
              user: state.activeChildId ? state.user : {
                id: newChild.id,
                name: newChild.name,
                age: newChild.age,
                avatar: newChild.avatar,
                readingLevel: newChild.readingLevel,
                streakDays: newChild.streakDays,
                totalBooksRead: newChild.totalBooksRead,
                totalMinutesRead: newChild.totalMinutesRead,
                favoriteBooks: newChild.favoriteBooks,
                readingProgress: newChild.readingProgress
              } as User,
              isLoggedIn: true
            };
          });
        } catch (error) {
          console.error("Create child profile error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to create child profile"
          });
        }
      },
      
      updateChildProfile: async (childId, data) => {
        set({ isLoading: true, error: null });
        
        try {
          // Transform data for Supabase
          const profileData: any = {};
          
          if (data.name) profileData.name = data.name;
          if (data.age) profileData.age = data.age;
          if (data.avatar) profileData.avatar = data.avatar;
          if (data.readingLevel) profileData.reading_level = data.readingLevel;
          if (data.streakDays !== undefined) profileData.streak_days = data.streakDays;
          if (data.totalBooksRead !== undefined) profileData.total_books_read = data.totalBooksRead;
          if (data.totalMinutesRead !== undefined) profileData.total_minutes_read = data.totalMinutesRead;
          if (data.favoriteBooks) profileData.favorite_books = data.favoriteBooks;
          if (data.badges) profileData.badges = data.badges;
          if (data.readingProgress) profileData.reading_progress = data.readingProgress;
          if (data.lastAssessmentDate) profileData.last_assessment_date = data.lastAssessmentDate;
          if (data.pronunciationAccuracy !== undefined) profileData.pronunciation_accuracy = data.pronunciationAccuracy;
          
          // Update profile in Supabase
          const { error } = await updateSupabaseChildProfile(childId, profileData);
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message
            });
            return;
          }
          
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => 
              child.id === childId ? { ...child, ...data } : child
            );
            
            // If the active child is being updated, update activeChild too
            const updatedActiveChild = state.activeChildId === childId
              ? { ...state.activeChild, ...data } as Child
              : state.activeChild;
            
            // Update legacy user if the active child is being updated
            const updatedUser = state.activeChildId === childId
              ? { ...state.user, ...data } as User
              : state.user;
            
            return {
              isLoading: false,
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Update child profile error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to update child profile"
          });
        }
      },
      
      deleteChildProfile: async (childId) => {
        set({ isLoading: true, error: null });
        
        try {
          // Delete profile from Supabase
          const { error } = await deleteSupabaseChildProfile(childId);
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message
            });
            return;
          }
          
          set((state) => {
            const updatedProfiles = state.childProfiles.filter(child => child.id !== childId);
            
            // Update parent's childProfiles array
            const updatedParent = state.parent 
              ? { 
                  ...state.parent, 
                  childProfiles: state.parent.childProfiles.filter(id => id !== childId) 
                } 
              : null;
            
            // If the active child is being deleted, set a new active child
            let newActiveChildId = state.activeChildId;
            let newActiveChild = state.activeChild;
            let newUser = state.user;
            
            if (state.activeChildId === childId) {
              newActiveChildId = updatedProfiles.length > 0 ? updatedProfiles[0].id : null;
              newActiveChild = updatedProfiles.length > 0 ? updatedProfiles[0] : null;
              
              // Update legacy user
              newUser = newActiveChild ? {
                id: newActiveChild.id,
                name: newActiveChild.name,
                age: newActiveChild.age,
                avatar: newActiveChild.avatar,
                readingLevel: newActiveChild.readingLevel,
                streakDays: newActiveChild.streakDays,
                totalBooksRead: newActiveChild.totalBooksRead,
                totalMinutesRead: newActiveChild.totalMinutesRead,
                favoriteBooks: newActiveChild.favoriteBooks,
                readingProgress: newActiveChild.readingProgress
              } as User : currentUser as User;
            }
            
            return {
              isLoading: false,
              childProfiles: updatedProfiles,
              parent: updatedParent,
              activeChildId: newActiveChildId,
              activeChild: newActiveChild,
              user: newUser
            };
          });
        } catch (error) {
          console.error("Delete child profile error:", error);
          set({ 
            isLoading: false, 
            error: "Failed to delete child profile"
          });
        }
      },
      
      setActiveChild: (childId) => {
        const child = get().childProfiles.find(c => c.id === childId);
        
        if (!child) return;
        
        // Update legacy user
        const updatedUser = {
          id: child.id,
          name: child.name,
          age: child.age,
          avatar: child.avatar,
          readingLevel: child.readingLevel,
          streakDays: child.streakDays,
          totalBooksRead: child.totalBooksRead,
          totalMinutesRead: child.totalMinutesRead,
          favoriteBooks: child.favoriteBooks,
          readingProgress: child.readingProgress
        } as User;
        
        set({
          activeChildId: childId,
          activeChild: child,
          user: updatedUser
        });
      },
      
      // Reading progress actions
      updateReadingProgress: async (childId, bookId, lastPageRead, totalPages) => {
        try {
          const completionPercentage = Math.round((lastPageRead / totalPages) * 100);
          const isCompleted = completionPercentage === 100;
          
          // Get current child profile
          const childProfile = get().childProfiles.find(c => c.id === childId);
          
          if (!childProfile) return;
          
          // Check if this is a newly completed book
          const wasCompletedBefore = childProfile.readingProgress[bookId]?.completionPercentage === 100;
          
          // Prepare progress data for Supabase
          const progressData = {
            last_page_read: lastPageRead,
            completion_percentage: completionPercentage,
            last_read_date: new Date().toISOString()
          };
          
          // Update reading progress in Supabase
          await updateSupabaseReadingProgress(childId, bookId, progressData);
          
          // If book was completed, increment total books read
          if (isCompleted && !wasCompletedBefore) {
            await updateSupabaseChildProfile(childId, {
              total_books_read: childProfile.totalBooksRead + 1
            });
          }
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              const updatedReadingProgress = {
                ...child.readingProgress,
                [bookId]: {
                  bookId,
                  lastPageRead,
                  completionPercentage,
                }
              };
              
              return {
                ...child,
                readingProgress: updatedReadingProgress,
                totalBooksRead: isCompleted && !wasCompletedBefore 
                  ? child.totalBooksRead + 1 
                  : child.totalBooksRead
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update for backward compatibility
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  readingProgress: {
                    ...state.user.readingProgress,
                    [bookId]: {
                      bookId,
                      lastPageRead,
                      completionPercentage,
                    }
                  },
                  totalBooksRead: isCompleted && !wasCompletedBefore
                    ? state.user.totalBooksRead + 1
                    : state.user.totalBooksRead
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Update reading progress error:", error);
        }
      },
      
      // Legacy method for backward compatibility
      updateBookProgress: async (bookId, lastPageRead, totalPages) => {
        const childId = get().activeChildId;
        if (childId) {
          // Call the new method with the active child ID
          await get().updateReadingProgress(childId, bookId, lastPageRead, totalPages);
        } else {
          // Legacy fallback
          set((state) => {
            const completionPercentage = Math.round((lastPageRead / totalPages) * 100);
            const isCompleted = completionPercentage === 100;
            const wasCompletedBefore = state.user.readingProgress[bookId]?.completionPercentage === 100;
            
            return {
              user: {
                ...state.user,
                readingProgress: {
                  ...state.user.readingProgress,
                  [bookId]: {
                    bookId,
                    lastPageRead,
                    completionPercentage,
                  }
                },
                totalBooksRead: isCompleted && !wasCompletedBefore 
                  ? state.user.totalBooksRead + 1 
                  : state.user.totalBooksRead
              } as User
            };
          });
        }
      },
      
      addFavoriteBook: async (childId, bookId) => {
        try {
          // Add favorite in Supabase
          await addFavorite(childId, bookId);
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                favoriteBooks: [...child.favoriteBooks, bookId]
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  favoriteBooks: [...state.user.favoriteBooks, bookId]
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Add favorite book error:", error);
        }
      },
      
      removeFavoriteBook: async (childId, bookId) => {
        try {
          // Remove favorite in Supabase
          await removeFavorite(childId, bookId);
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                favoriteBooks: child.favoriteBooks.filter(id => id !== bookId)
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  favoriteBooks: state.user.favoriteBooks.filter(id => id !== bookId)
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Remove favorite book error:", error);
        }
      },
      
      // Gamification actions
      incrementStreakDays: async (childId) => {
        try {
          // Get current child profile
          const childProfile = get().childProfiles.find(c => c.id === childId);
          
          if (!childProfile) return;
          
          // Update streak days in Supabase
          await updateSupabaseChildProfile(childId, {
            streak_days: childProfile.streakDays + 1
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                streakDays: child.streakDays + 1
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  streakDays: state.user.streakDays + 1
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Increment streak days error:", error);
        }
      },
      
      incrementBooksRead: async (childId) => {
        try {
          // Get current child profile
          const childProfile = get().childProfiles.find(c => c.id === childId);
          
          if (!childProfile) return;
          
          // Update total books read in Supabase
          await updateSupabaseChildProfile(childId, {
            total_books_read: childProfile.totalBooksRead + 1
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                totalBooksRead: child.totalBooksRead + 1
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  totalBooksRead: state.user.totalBooksRead + 1
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Increment books read error:", error);
        }
      },
      
      addMinutesRead: async (childId, minutes) => {
        try {
          // Get current child profile
          const childProfile = get().childProfiles.find(c => c.id === childId);
          
          if (!childProfile) return;
          
          // Update total minutes read in Supabase
          await updateSupabaseChildProfile(childId, {
            total_minutes_read: childProfile.totalMinutesRead + minutes
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                totalMinutesRead: child.totalMinutesRead + minutes
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  totalMinutesRead: state.user.totalMinutesRead + minutes
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Add minutes read error:", error);
        }
      },
      
      addBadge: async (childId, badgeData) => {
        try {
          const newBadge: Badge = {
            ...badgeData,
            id: `b${Date.now()}`,
            dateEarned: new Date().toISOString()
          };
          
          // Add badge in Supabase
          await addSupabaseBadge({
            child_id: childId,
            title: newBadge.title,
            description: newBadge.description,
            icon: newBadge.icon,
            date_earned: newBadge.dateEarned
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                badges: [...child.badges, newBadge]
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild
            };
          });
        } catch (error) {
          console.error("Add badge error:", error);
        }
      },
      
      // Assessment actions
      saveAssessmentResult: async (childId, result) => {
        try {
          // Save assessment result in Supabase
          await saveSupabaseAssessmentResult(childId, {
            reading_level: result.readingLevel,
            pronunciation_accuracy: result.pronunciationAccuracy,
            date: new Date().toISOString()
          });
          
          // Update child profile in Supabase
          await updateSupabaseChildProfile(childId, {
            reading_level: result.readingLevel,
            pronunciation_accuracy: result.pronunciationAccuracy,
            last_assessment_date: new Date().toISOString()
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                readingLevel: result.readingLevel,
                pronunciationAccuracy: result.pronunciationAccuracy,
                lastAssessmentDate: new Date().toISOString()
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            // Legacy user update
            const updatedUser = state.activeChildId === childId
              ? {
                  ...state.user,
                  readingLevel: result.readingLevel
                } as User
              : state.user;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild,
              user: updatedUser
            };
          });
        } catch (error) {
          console.error("Save assessment result error:", error);
        }
      },
      
      updatePronunciationAccuracy: async (childId, accuracy) => {
        try {
          // Update pronunciation accuracy in Supabase
          await updateSupabaseChildProfile(childId, {
            pronunciation_accuracy: accuracy
          });
          
          // Update local state
          set((state) => {
            const updatedProfiles = state.childProfiles.map(child => {
              if (child.id !== childId) return child;
              
              return {
                ...child,
                pronunciationAccuracy: accuracy
              };
            });
            
            // Update activeChild if it's the one being modified
            const updatedActiveChild = state.activeChildId === childId
              ? updatedProfiles.find(c => c.id === childId) || state.activeChild
              : state.activeChild;
            
            return {
              childProfiles: updatedProfiles,
              activeChild: updatedActiveChild
            };
          });
        } catch (error) {
          console.error("Update pronunciation accuracy error:", error);
        }
      },
      
      // Legacy actions for backward compatibility
      updateUser: (userData) => 
        set((state) => ({ user: { ...state.user, ...userData } as User })),
      
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        activeChildId: state.activeChildId,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);