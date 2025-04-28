export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description: string;
  ageRange?: string;
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  categories?: string[];
  pages?: BookPage[];
  isRecommended?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  isGenerated?: boolean;
  content?: string;
  pageCount?: number;
  category?: string;
  dateAdded?: string;
  audioUrl?: string; // URL to the generated audio narration
}

export interface BookPage {
  id: number;
  content: string;
  imageUrl?: string;
  vocabularyWords?: VocabularyWord[];
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
}

export interface ReadingProgress {
  bookId: string;
  lastPageRead: number;
  completionPercentage: number;
  dateStarted: string;
  dateLastRead: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}