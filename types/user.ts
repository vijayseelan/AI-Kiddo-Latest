export interface Parent {
  id: string;
  email: string;
  name: string;
  avatar: string;
  childProfiles: string[]; // IDs of child profiles
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  parentId: string;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  streakDays: number;
  totalBooksRead: number;
  totalMinutesRead: number;
  pronunciationAccuracy: number; // 0-100 score
  lastAssessmentDate: string;
  badges: Badge[];
  favoriteBooks: string[];
  readingProgress: Record<string, {
    bookId: string;
    lastPageRead: number;
    completionPercentage: number;
  }>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface AssessmentResult {
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  pronunciationAccuracy: number;
  wordRecognitionRate: number;
  fluencyScore: number;
  recommendedBooks: string[];
}

export interface PronunciationFeedback {
  word: string;
  accuracy: number; // 0-100
  isCorrect: boolean;
  suggestion?: string;
}

// Define ReadingLevel type for better type safety
export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

// Legacy User type for backward compatibility
export interface User {
  id: string;
  name: string;
  avatar: string;
  age: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  streakDays: number;
  totalBooksRead: number;
  totalMinutesRead: number;
  favoriteBooks: string[];
  readingProgress: Record<string, {
    bookId: string;
    lastPageRead: number;
    completionPercentage: number;
  }>;
}