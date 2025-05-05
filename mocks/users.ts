import { Parent, Child, Badge } from "@/types/user";

export const parentUser: Parent = {
  id: "p1",
  email: "parent@example.com",
  name: "Alex Parent",
  avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
  childProfiles: ["c1", "c2"]
};

export const childProfiles: Child[] = [
  {
    id: "c1",
    name: "Sam",
    age: 7,
    avatar: "https://images.unsplash.com/photo-1517677129300-07b130802f46",
    parentId: "p1",
    readingLevel: "beginner",
    streakDays: 5,
    totalBooksRead: 12,
    totalMinutesRead: 360,
    pronunciationAccuracy: 78,
    lastAssessmentDate: "2023-06-15",
    badges: [
      {
        id: "b1",
        name: "Reading Rookie",
        description: "Completed first book",
        icon: "award",
        dateEarned: "2023-05-20"
      },
      {
        id: "b2",
        name: "Word Wizard",
        description: "Learned 50 new words",
        icon: "sparkles",
        dateEarned: "2023-06-01"
      }
    ],
    favoriteBooks: ["1", "4"],
    readingProgress: {
      "1": {
        bookId: "1",
        lastPageRead: 2,
        completionPercentage: 66,
      },
      "2": {
        bookId: "2",
        lastPageRead: 1,
        completionPercentage: 50,
      },
      "4": {
        bookId: "4",
        lastPageRead: 1,
        completionPercentage: 100,
      }
    }
  },
  {
    id: "c2",
    name: "Emma",
    age: 9,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    parentId: "p1",
    readingLevel: "intermediate",
    streakDays: 12,
    totalBooksRead: 18,
    totalMinutesRead: 540,
    pronunciationAccuracy: 85,
    lastAssessmentDate: "2023-06-10",
    badges: [
      {
        id: "b3",
        name: "Bookworm",
        description: "Read 10 books",
        icon: "book-open",
        dateEarned: "2023-05-15"
      },
      {
        id: "b4",
        name: "Pronunciation Pro",
        description: "Achieved 85% pronunciation accuracy",
        icon: "mic",
        dateEarned: "2023-06-05"
      },
      {
        id: "b5",
        name: "Streak Star",
        description: "Maintained a 10-day reading streak",
        icon: "flame",
        dateEarned: "2023-06-12"
      }
    ],
    favoriteBooks: ["3", "5"],
    readingProgress: {
      "3": {
        bookId: "3",
        lastPageRead: 1,
        completionPercentage: 100,
      },
      "5": {
        bookId: "5",
        lastPageRead: 1,
        completionPercentage: 100,
      },
      "6": {
        bookId: "6",
        lastPageRead: 1,
        completionPercentage: 50,
      }
    }
  }
];

// For backward compatibility with existing code
export const currentUser = {
  id: "c1",
  name: "Sam",
  avatar: "https://images.unsplash.com/photo-1517677129300-07b130802f46",
  age: 7,
  readingLevel: "beginner",
  streakDays: 5,
  totalBooksRead: 12,
  totalMinutesRead: 360,
  favoriteBooks: ["1", "4"],
  readingProgress: {
    "1": {
      bookId: "1",
      lastPageRead: 2,
      completionPercentage: 66,
    },
    "2": {
      bookId: "2",
      lastPageRead: 1,
      completionPercentage: 50,
    },
    "4": {
      bookId: "4",
      lastPageRead: 1,
      completionPercentage: 100,
    }
  }
};