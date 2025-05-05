// Mock implementation of Azure Pronunciation Assessment API
// In a real app, this would connect to Azure Speech Services

import { PronunciationFeedback } from "@/types/user";

// Define the structure for sentence results
export interface SentencePronunciationResult {
  overallAccuracy: number;
  words: PronunciationFeedback[];
}

// Mock function to simulate pronunciation assessment
export const assessPronunciation = async (
  word: string,
  audioBlob: any // In a real app, this would be an audio blob
): Promise<PronunciationFeedback> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate random accuracy between 60-100 for demo purposes
  const accuracy = Math.floor(Math.random() * 41) + 60;
  const isCorrect = accuracy >= 80;
  
  // Mock feedback based on accuracy
  let suggestion = "";
  if (accuracy < 70) {
    suggestion = "Try speaking more slowly and clearly.";
  } else if (accuracy < 80) {
    suggestion = "Good attempt! Focus on the vowel sounds.";
  }
  
  return {
    word,
    accuracy,
    isCorrect,
    suggestion: suggestion || undefined
  };
};

// Mock function to simulate sentence pronunciation assessment
export const assessSentencePronunciation = async (
  sentence: string,
  audioBlob: any
): Promise<SentencePronunciationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Split sentence into words
  const words = sentence.replace(/[.,!?]/g, "").split(" ");
  
  // Generate random feedback for each word
  const wordFeedback: PronunciationFeedback[] = words.map(word => {
    const accuracy = Math.floor(Math.random() * 41) + 60;
    const isCorrect = accuracy >= 80;
    
    let suggestion = "";
    if (accuracy < 70) {
      suggestion = "Try speaking more slowly.";
    } else if (accuracy < 80) {
      suggestion = "Focus on the vowel sounds.";
    }
    
    return {
      word,
      accuracy,
      isCorrect,
      suggestion: suggestion || undefined
    };
  });
  
  // Calculate overall accuracy
  const overallAccuracy = Math.round(
    wordFeedback.reduce((sum, item) => sum + item.accuracy, 0) / words.length
  );
  
  return {
    overallAccuracy,
    words: wordFeedback
  };
};

// Mock function to simulate reading assessment
export const assessReading = async (
  text: string,
  audioBlob: any
): Promise<{
  accuracy: number;
  fluency: number;
  completeness: number;
  words: PronunciationFeedback[];
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Split text into words
  const words = text.replace(/[.,!?]/g, "").split(" ");
  
  // Generate random feedback for each word
  const wordFeedback: PronunciationFeedback[] = words.map(word => {
    const accuracy = Math.floor(Math.random() * 41) + 60;
    const isCorrect = accuracy >= 80;
    
    return {
      word,
      accuracy,
      isCorrect
    };
  });
  
  // Calculate metrics
  const accuracy = Math.round(
    wordFeedback.reduce((sum, item) => sum + item.accuracy, 0) / words.length
  );
  
  const fluency = Math.floor(Math.random() * 31) + 70; // 70-100
  const completeness = Math.floor(Math.random() * 21) + 80; // 80-100
  
  return {
    accuracy,
    fluency,
    completeness,
    words: wordFeedback
  };
};

// Mock function to determine reading level based on assessment
export const determineReadingLevel = (
  wordAccuracy: number,
  fluency: number,
  completeness: number
): 'beginner' | 'intermediate' | 'advanced' => {
  const overallScore = (wordAccuracy * 0.5) + (fluency * 0.3) + (completeness * 0.2);
  
  if (overallScore < 75) return 'beginner';
  if (overallScore < 90) return 'intermediate';
  return 'advanced';
};