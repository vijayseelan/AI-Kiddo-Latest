import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the types for our onboarding data
export type OnboardingData = {
  // Parent info
  parentName: string;
  parentEmail: string;
  parentPassword: string;
  
  // Child info
  childName: string;
  childAge: string;
  selectedAvatar: string;
  
  // Reading preferences
  readingLevel: string;
  goals: string[];
  desiredOutcomes: string[];
  dailyMaterials: number;
  
  // Assessment results
  assessmentResults: {
    words: Array<{
      word: string;
      accuracy: number;
      isCorrect: boolean;
      suggestion?: string;
    }>;
    overallAccuracy: number;
    fluency: number;
    completeness: number;
    pronunciation?: number;
    prosody?: number;
  } | null;
};

// Initial state with empty values
const initialOnboardingData: OnboardingData = {
  parentName: '',
  parentEmail: '',
  parentPassword: '',
  childName: '',
  childAge: '5',
  selectedAvatar: '',
  readingLevel: '',
  goals: [],
  desiredOutcomes: [],
  dailyMaterials: 3,
  assessmentResults: null
};

// Create the context
type OnboardingContextType = {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboardingData: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);

  // Update onboarding data (merges new data with existing data)
  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  // Reset onboarding data to initial state
  const resetOnboardingData = () => {
    setOnboardingData(initialOnboardingData);
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData, resetOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
