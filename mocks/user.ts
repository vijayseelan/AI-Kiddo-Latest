import { User } from "@/types/user";

export const currentUser: User = {
  id: "1",
  name: "Alex",
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