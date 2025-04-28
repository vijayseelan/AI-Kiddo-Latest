import { Book, Category } from "@/types/book";

export const categories: Category[] = [
  {
    id: "1",
    name: "Adventure",
    icon: "compass",
    color: "#6C63FF",
  },
  {
    id: "2",
    name: "Animals",
    icon: "paw-print",
    color: "#FF9D7D",
  },
  {
    id: "3",
    name: "Fantasy",
    icon: "sparkles",
    color: "#64D2FF",
  },
  {
    id: "4",
    name: "Science",
    icon: "flask-conical",
    color: "#5ECC62",
  },
  {
    id: "5",
    name: "History",
    icon: "landmark",
    color: "#FFC107",
  },
];

export const books: Book[] = [
  {
    id: "1",
    title: "The Magic Tree House",
    author: "Mary Pope Osborne",
    coverUrl: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb",
    description: "Jack and Annie discover a tree house filled with books that takes them on magical adventures through time and space.",
    ageRange: "6-8",
    readingLevel: "beginner",
    categories: ["Adventure", "Fantasy"],
    isRecommended: true,
    isNew: false,
    pages: [
      {
        id: 1,
        content: "Jack and Annie found a tree house. It was filled with books. \"Look at all these books!\" said Annie.",
        imageUrl: "https://images.unsplash.com/photo-1516125073169-9e3ecdee83e7",
        vocabularyWords: [
          {
            word: "tree house",
            definition: "a small house built in the branches of a tree",
            example: "The children played in the tree house all afternoon."
          }
        ]
      },
      {
        id: 2,
        content: "Jack picked up a book about dinosaurs. There was a picture of a dinosaur in the book. \"I wish I could see a real dinosaur,\" said Annie.",
        vocabularyWords: [
          {
            word: "dinosaur",
            definition: "a type of animal that lived millions of years ago",
            example: "The Tyrannosaurus Rex was a scary dinosaur."
          }
        ]
      },
      {
        id: 3,
        content: "Suddenly, the tree house started to spin. It spun faster and faster. Then everything was still. Absolutely still.",
        vocabularyWords: [
          {
            word: "spin",
            definition: "to turn around quickly",
            example: "The top can spin for a long time."
          }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Curious George",
    author: "H. A. Rey",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    description: "The adventures of a curious little monkey named George and his friend, the Man with the Yellow Hat.",
    ageRange: "4-7",
    readingLevel: "beginner",
    categories: ["Animals", "Adventure"],
    isRecommended: true,
    isNew: false,
    pages: [
      {
        id: 1,
        content: "This is George. He was a good little monkey and always very curious.",
        imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9",
        vocabularyWords: [
          {
            word: "curious",
            definition: "eager to learn or know about something",
            example: "The curious child asked many questions."
          }
        ]
      },
      {
        id: 2,
        content: "One day George saw a man. He had on a yellow hat. The man saw George too.",
        vocabularyWords: [
          {
            word: "yellow",
            definition: "having the color of ripe lemons or sunflowers",
            example: "The sun is yellow and bright."
          }
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Charlotte's Web",
    author: "E.B. White",
    coverUrl: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a",
    description: "The story of a pig named Wilbur and his friendship with a barn spider named Charlotte.",
    ageRange: "8-12",
    readingLevel: "intermediate",
    categories: ["Animals", "Fantasy"],
    isRecommended: false,
    isNew: true,
    pages: [
      {
        id: 1,
        content: "\"Where's Papa going with that ax?\" said Fern to her mother as they were setting the table for breakfast.",
        imageUrl: "https://images.unsplash.com/photo-1516125073169-9e3ecdee83e7",
        vocabularyWords: [
          {
            word: "ax",
            definition: "a tool with a metal blade and a long handle, used for chopping wood",
            example: "The lumberjack used an ax to chop down the tree."
          }
        ]
      }
    ]
  },
  {
    id: "4",
    title: "The Very Hungry Caterpillar",
    author: "Eric Carle",
    coverUrl: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a",
    description: "A caterpillar eats his way through a variety of foods before pupating and emerging as a butterfly.",
    ageRange: "3-5",
    readingLevel: "beginner",
    categories: ["Animals", "Science"],
    isRecommended: true,
    isNew: false,
    pages: [
      {
        id: 1,
        content: "In the light of the moon, a little egg lay on a leaf.",
        imageUrl: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e",
        vocabularyWords: [
          {
            word: "moon",
            definition: "the natural satellite of the earth",
            example: "The moon shines at night."
          }
        ]
      }
    ]
  },
  {
    id: "5",
    title: "Where the Wild Things Are",
    author: "Maurice Sendak",
    coverUrl: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a",
    description: "A young boy named Max creates an imaginary forest inhabited by wild creatures who crown him as their ruler.",
    ageRange: "4-8",
    readingLevel: "beginner",
    categories: ["Fantasy", "Adventure"],
    isRecommended: false,
    isNew: true,
    pages: [
      {
        id: 1,
        content: "The night Max wore his wolf suit and made mischief of one kind and another, his mother called him \"WILD THING!\" and Max said \"I'LL EAT YOU UP!\" so he was sent to bed without eating anything.",
        imageUrl: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e",
        vocabularyWords: [
          {
            word: "mischief",
            definition: "playful behavior that causes trouble",
            example: "The children were up to mischief when they drew on the walls."
          }
        ]
      }
    ]
  },
  {
    id: "6",
    title: "Dinosaurs Before Dark",
    author: "Mary Pope Osborne",
    coverUrl: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb",
    description: "Jack and Annie travel back to the time of dinosaurs for their first magical adventure.",
    ageRange: "6-9",
    readingLevel: "beginner",
    categories: ["Adventure", "History", "Science"],
    isRecommended: true,
    isNew: true,
    pages: [
      {
        id: 1,
        content: "Jack looked up. There in the tallest oak was a tree house. \"Wow,\" he whispered.",
        imageUrl: "https://images.unsplash.com/photo-1516125073169-9e3ecdee83e7",
        vocabularyWords: [
          {
            word: "oak",
            definition: "a type of large tree",
            example: "The oak tree provided shade in the summer."
          }
        ]
      }
    ]
  }
];

// Practice words for pronunciation exercises
export const practiceWords = {
  beginner: [
    { word: "cat", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba" },
    { word: "dog", imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1" },
    { word: "sun", imageUrl: "https://images.unsplash.com/photo-1522124624696-7ea32eb9592c" },
    { word: "tree", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9" },
    { word: "book", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" },
    { word: "ball", imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68" },
    { word: "house", imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233" },
    { word: "fish", imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00" },
  ],
  intermediate: [
    { word: "elephant", imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46" },
    { word: "butterfly", imageUrl: "https://images.unsplash.com/photo-1559535332-db9971090158" },
    { word: "mountain", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" },
    { word: "dinosaur", imageUrl: "https://images.unsplash.com/photo-1608226729063-1a7c7d8e1d77" },
    { word: "rainbow", imageUrl: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31" },
    { word: "bicycle", imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e" },
    { word: "astronaut", imageUrl: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031" },
    { word: "treasure", imageUrl: "https://images.unsplash.com/photo-1586864387789-628af9feed72" },
  ],
  advanced: [
    { word: "extraordinary", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401" },
    { word: "magnificent", imageUrl: "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e" },
    { word: "imagination", imageUrl: "https://images.unsplash.com/photo-1510511233900-1982d92bd835" },
    { word: "adventure", imageUrl: "https://images.unsplash.com/photo-1530789253388-582c481c54b0" },
    { word: "mysterious", imageUrl: "https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba" },
    { word: "discovery", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d" },
    { word: "telescope", imageUrl: "https://images.unsplash.com/photo-1566004100631-35d015d6a491" },
    { word: "laboratory", imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074" },
  ]
};

// Practice sentences for pronunciation exercises
export const practiceSentences = {
  beginner: [
    "The cat sat on the mat.",
    "I like to read books.",
    "The sun is bright today.",
    "My dog likes to play ball.",
    "I can see a big tree.",
  ],
  intermediate: [
    "The elephant has a long trunk.",
    "Butterflies have colorful wings.",
    "We climbed up the mountain yesterday.",
    "Dinosaurs lived millions of years ago.",
    "I saw a beautiful rainbow after the rain.",
  ],
  advanced: [
    "The extraordinary discovery amazed the scientists.",
    "The magnificent view from the mountain was breathtaking.",
    "Use your imagination to create a fantastic story.",
    "We had an exciting adventure in the forest.",
    "The mysterious sound came from the old attic.",
  ]
};

// Assessment texts for reading level evaluation
export const assessmentTexts = {
  level1: {
    title: "Simple Words",
    words: ["cat", "dog", "sun", "tree", "book", "ball", "house", "fish"],
    text: "I see a cat. The cat is big. The dog runs fast. I like to read a book. The sun is bright."
  },
  level2: {
    title: "Simple Sentences",
    words: ["elephant", "butterfly", "mountain", "dinosaur", "rainbow"],
    text: "The elephant has big ears. I saw a butterfly in the garden. We climbed up the mountain. Dinosaurs lived long ago. The rainbow has many colors."
  },
  level3: {
    title: "Complex Sentences",
    words: ["extraordinary", "magnificent", "imagination", "adventure", "mysterious"],
    text: "The extraordinary discovery amazed everyone in the laboratory. We had a magnificent view from the top of the mountain. Use your imagination to create a fantastic story about space exploration."
  }
};

import { supabase } from '@/lib/supabase';
import { convertAIContentToBook, getAllAIGeneratedContent } from '@/services/database';

// Cache for AI-generated books
let aiBooks: Book[] = [];

// Load AI books into cache
async function loadAIBooks() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { contents, error } = await getAllAIGeneratedContent(user.id);
      if (!error && contents) {
        aiBooks = contents.map(convertAIContentToBook);
      }
    }
  } catch (error) {
    console.error('Error loading AI books:', error);
  }
}

// Load AI books on module import
loadAIBooks();

export async function getBookById(id: string): Promise<Book | undefined> {
  // First check regular books
  const regularBook = books.find((book) => book.id === id);
  if (regularBook) return regularBook;

  // Then check AI-generated books
  return aiBooks.find((book) => book.id === id);
};

export const getBooksByCategory = (categoryId: string): Book[] => {
  return books.filter(book => book.categories && book.categories.includes(categoryId));
};

export const getRecommendedBooks = (): Book[] => {
  return books.filter(book => book.isRecommended);
};

export const getNewBooks = (): Book[] => {
  return books.filter(book => book.isNew);
};

export const getBooksByReadingLevel = (level: string): Book[] => {
  return books.filter(book => book.readingLevel === level);
};