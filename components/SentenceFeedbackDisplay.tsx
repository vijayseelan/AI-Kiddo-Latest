import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { SentencePronunciationResultAzure, WordTimingResult } from '@/services/azure-speech';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useThemeStore } from '@/store/theme-store';

interface SentenceFeedbackDisplayProps {
  results: SentencePronunciationResultAzure;
  onClose: () => void;
}

const ScoreDisplay: React.FC<{ label: string; score?: number }> = ({ label, score }) => {
  const { isDarkMode } = useThemeStore();
  if (score === undefined || score === null) return null;

  let scoreColor = colors.text; // Default
  if (score >= 80) scoreColor = colors.success; 
  else if (score >= 60) scoreColor = colors.warning; 
  else scoreColor = colors.red; // Use colors.red instead of colors.danger
  
  if (isDarkMode) {
     if (score >= 80) scoreColor = '#4CAF50'; 
      else if (score >= 60) scoreColor = '#FFC107'; 
      else scoreColor = '#F44336';
  }

  return (
    <View style={styles.scoreItem}>
      <Text style={[styles.scoreLabel, isDarkMode && styles.textDark]}>{label}:</Text>
      <Text style={[styles.scoreValue, { color: scoreColor }]}>{score.toFixed(0)}</Text>
    </View>
  );
};

const WordFeedbackDisplay: React.FC<{ wordResult: WordTimingResult }> = ({ wordResult }) => {
  const { isDarkMode } = useThemeStore();
  let wordStyle = styles.correctWord;
  let errorText = '';

  switch (wordResult.errorType) {
    case 'Mispronunciation':
      wordStyle = styles.mispronouncedWord;
      errorText = `(Accuracy: ${wordResult.accuracyScore.toFixed(0)})`;
      break;
    case 'Omission':
      wordStyle = styles.omittedWord;
      errorText = '(Omitted)'; 
      break;
    case 'Insertion':
      wordStyle = styles.insertedWord;
      errorText = '(Inserted)'; // Note: Inserted words might appear extra in the list
      break;
    case 'None':
    default:
      wordStyle = isDarkMode ? styles.correctWordDark : styles.correctWord;
      break;
  }

  return (
    <View style={styles.wordContainer}>
      <Text style={[styles.wordText, wordStyle]}>{wordResult.word}</Text>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const SentenceFeedbackDisplay: React.FC<SentenceFeedbackDisplayProps> = ({ results, onClose }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>Pronunciation Feedback</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={isDarkMode ? colors.textDark : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Overall Scores</Text>
        <View style={styles.scoresContainer}>
          <ScoreDisplay label="Accuracy" score={results.accuracyScore} />
          <ScoreDisplay label="Fluency" score={results.fluencyScore} />
          <ScoreDisplay label="Completeness" score={results.completenessScore} />
          <ScoreDisplay label="Pronunciation" score={results.pronunciationScore} />
          <ScoreDisplay label="Prosody" score={results.prosodyScore} />
        </View>

        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Word Breakdown</Text>
        <View style={styles.wordsDisplayContainer}>
          {results.words.map((word, index) => (
            <WordFeedbackDisplay key={`${word.word}-${index}`} wordResult={word} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Or modal background color
    borderRadius: spacing.md,
    padding: spacing.lg,
    maxHeight: '80%', // Prevent modal from taking full screen
  },
  containerDark: {
    backgroundColor: '#2c2c2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  textDark: {
    color: colors.textDark,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  scoreItem: {
    alignItems: 'center',
    margin: spacing.sm,
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  wordsDisplayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.backgroundLight, // Use colors.backgroundLight instead of colors.backgroundOffset
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  wordContainer: {
    marginRight: spacing.sm, 
    marginBottom: spacing.xs, 
    alignItems: 'center',
  },
  wordText: {
    fontSize: 18,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs, // Use spacing.xs instead of spacing.xxs
    borderRadius: spacing.xs,
  },
  correctWord: {
    color: colors.text, // Default black/dark grey for light mode
    backgroundColor: 'transparent', // Or very light green tint like '#e8f5e9'
  },
   correctWordDark: {
    color: colors.textDark, // Light text for dark mode
    backgroundColor: 'transparent', // Or very light green tint like '#e8f5e9'
  },
  mispronouncedWord: {
    color: colors.red, // Use colors.red instead of colors.danger
    backgroundColor: 'transparent', // Add background color
    fontWeight: 'bold',
  },
  omittedWord: {
    color: colors.textLight, // Greyed out
    textDecorationLine: 'line-through',
    backgroundColor: 'transparent', // Add background color
  },
  insertedWord: {
    color: colors.warning, // Orange/Yellow text
    backgroundColor: 'transparent', // Add background color
    fontStyle: 'italic',
  },
  errorText: {
      fontSize: 10,
      color: colors.textLight,
  }
});

export default SentenceFeedbackDisplay;
