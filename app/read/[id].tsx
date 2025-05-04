import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Pressable, Modal, ScrollView } from "react-native";
import { BlurView } from "expo-blur";

// Design system colors
const designColors = {
  sunflower: "#ffb703",
  orange: "#fb8500",
  blue: "#219ebc",
  skyBlue: "#8ecae6",
  deepNavy: "#023047"
};
import { getAllAIGeneratedContent } from "@/services/database";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, X, Volume2, Mic } from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import AIContentViewer from "@/components/AIContentViewer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { getBookById } from "@/mocks/books";
import { Book } from "@/types/book";
import { useUserStore } from "@/store/user-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import AIAssistant from "@/components/AIAssistant";
import Button from "@/components/Button";
import MascotGuide from '@/components/MascotGuide';
import { assessSentencePronunciationAzure, SentencePronunciationResultAzure, WordTimingResult } from '@/services/azure-speech'; // Real Azure service types/functions
import { SentencePronunciationResult } from '@/services/pronunciation'; // Mock type for fallback/comparison
import PronunciationFeedback from "@/components/PronunciationFeedback";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AIGeneratedContent, AIContentItem, getAIGeneratedContent } from '@/services/database';
import * as FileSystem from 'expo-file-system';

type FullAIContent = AIGeneratedContent & { items: AIContentItem[] };

interface WordFeedback {
  word: string;
  accuracy: number; // Make non-optional to match PronunciationFeedback component prop
  errorType?: string;
  isCorrect: boolean; // Add missing property required by PronunciationFeedback component
}

interface PronunciationResults {
  overallAccuracy: number;
  words: WordFeedback[];
}

export default function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { activeChild, activeChildId, updateReadingProgress, addMinutesRead } = useUserStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    async function loadContent() {
      if (id) {
        try {
          const loadedBook = await getBookById(id);
          setBook(loadedBook || null);

          if (loadedBook?.isGenerated) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser?.id) {
              const { content: fetchedContent, items: fetchedItems, error } = await getAIGeneratedContent(id as string);
              if (error) {
                console.error('[Read] Error fetching content:', error);
              } else if (fetchedContent) {
                const content = { ...fetchedContent, items: fetchedItems };
                console.log('[Read] Found AI content:', content);
                setAiContent(content);
              }
            }
          }
        } catch (error) {
          console.error('[Read] Error loading content:', error);
        } finally {
          setIsLoading(false);
          setIsLoadingContent(false);
        }
      }
    }
    loadContent();
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  const [aiContent, setAiContent] = useState<FullAIContent | null>(null);
  const aiContentRef = useRef(aiContent); 
  useEffect(() => {
    aiContentRef.current = aiContent;
  }, [aiContent]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [regularCurrentPage, setRegularCurrentPage] = useState(0);
  const [aiCurrentPage, setAiCurrentPage] = useState(0);

  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [showDefinition, setShowDefinition] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [definitionData, setDefinitionData] = useState({
    word: "",
    definition: "",
    example: "",
  });
  const [showComprehension, setShowComprehension] = useState(false);
  const [readingTimer, setReadingTimer] = useState(0);
  const [showMascot, setShowMascot] = useState(true);
  const [isRecordingPronunciation, setIsRecordingPronunciation] = useState(false);
  const [pronunciationResults, setPronunciationResults] = useState<SentencePronunciationResultAzure | null>(null); // Use new Azure Sentence Result type
  const [mockPronunciationResults, setMockPronunciationResults] = useState<SentencePronunciationResult | null>(null); // State for mock results using correct type
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true; // Set to true on mount
    return () => {
      console.log('[ReadingScreen] Component unmounting, setting isMounted.current = false');
      isMounted.current = false; // Set to false on unmount
    };
  }, []); // Empty dependency array: runs only on mount and unmount

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTimer((prev) => prev + 1);
    }, 60000); 
    const mascotTimer = setTimeout(() => {
      setShowMascot(false);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(mascotTimer);
      if (activeChildId) {
        addMinutesRead(activeChildId, readingTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!book?.isGenerated && book?.pages && activeChildId) {
      updateReadingProgress(activeChildId, id, regularCurrentPage + 1, book.pages.length);
      setCurrentWords(book.pages[regularCurrentPage]?.content?.split(' ') || []);
    }
  }, [regularCurrentPage, id, book, activeChildId, updateReadingProgress]);

  useEffect(() => {
    if (book?.isGenerated && aiContent?.items) {
      const textContent = aiContent.items[aiCurrentPage]?.text;
      setCurrentWords(textContent ? textContent.split(' ') : []);
    }
  }, [aiCurrentPage, aiContent, book?.isGenerated]);

  const stableUpdateReadingProgress = useCallback(updateReadingProgress, []);

  const handleAINextPage = () => {
    if (aiContent && aiCurrentPage < aiContent.items.length - 1) {
      const nextPage = aiCurrentPage + 1;
      setAiCurrentPage(nextPage);
      if (activeChildId) {
        stableUpdateReadingProgress(activeChildId, id, nextPage + 1, aiContent.items.length);
      }
    }
  };

  const handleAIPrevPage = () => {
    if (aiCurrentPage > 0) {
      const prevPage = aiCurrentPage - 1;
      setAiCurrentPage(prevPage);
      if (activeChildId) {
        stableUpdateReadingProgress(activeChildId, id, prevPage + 1, aiContent?.items?.length || 0);
      }
    }
  };

  const handlePracticeRecordingComplete = async (text: string, audioUri: string | null) => {
    console.log('[ReadingScreen] Practice recording complete. Text:', text, 'URI:', audioUri);
    if (!audioUri) {
      console.error('[ReadingScreen] No audio URI received from recording.');
      // TODO: Show error feedback to user
      return;
    }

    setIsRecordingPronunciation(true);
    setShowPronunciationModal(true);
    setPronunciationResults(null); // Clear previous results
    setMockPronunciationResults(null);

    try {
      // 1. Read audio file
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('[ReadingScreen] Audio read and converted to base64 (first 100 chars):', audioBase64.substring(0, 100));

      // 2. Call REAL Azure service for sentence assessment (using placeholder)
      const results = await assessSentencePronunciationAzure(text, audioBase64);
      console.log('[ReadingScreen] Azure Assessment results (from placeholder):', results);
      setPronunciationResults(results);

    } catch (error) {
      console.error('[ReadingScreen] Error processing practice recording:', error);
      // TODO: Show error feedback to user in the modal
    } finally {
      setIsRecordingPronunciation(false);
    }
  };

  const handleAIAssistClose = () => {
    setShowAIAssistant(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <ActivityIndicator color={theme.text} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Loading book...</Text>
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.text }]}>Book not found</Text>
        </View>
      </View>
    );
  }

  if (isLoadingContent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <ActivityIndicator color={theme.text} />
          <Text style={[styles.notFoundText, { color: theme.text }]}>Loading content...</Text>
        </View>
      </View>
    );
  }

  if (book.isGenerated && aiContent) {
    return (
      <View style={styles.container}>
        {/* Gradient Background Layers */}
        <View style={styles.gradientBg1} />
        <View style={styles.gradientBg2} />
        <View style={styles.gradientBg3} />
        <View style={styles.gradientBg4} />
        <BlurView intensity={100} tint="light" style={styles.blurOverlay} />
        
        {/* Custom Header with Safe Area */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable 
            onPress={handleBack} 
            style={[styles.headerButton, styles.backButton]}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { fontFamily: 'Poppins_600SemiBold', color: colors.text }]}>{book.title}</Text>
          
          {/* Empty view to maintain space-between layout */}
          <View style={{ width: 40 }} />
        </View>

        <AIContentViewer
          items={aiContent.items}
          currentPage={aiCurrentPage}
          onNext={handleAINextPage}
          onPrevious={handleAIPrevPage}
        />

        {showAIAssistant && (
          <AIAssistant 
            words={currentWords} 
            onDefine={(word) => {
              console.log('Define:', word);
            }}
            onPronounce={(word) => {
              console.log('Pronounce:', word);
            }}
            onAskQuestion={() => {
              console.log('Ask question');
            }}
            onPracticeRecordingComplete={handlePracticeRecordingComplete} // Pass the new handler
          />
        )}
      </View>
    );
  }

  const handleNextPage = () => {
    if (!book?.pages) return;
    if (regularCurrentPage < book.pages.length - 1) {
      setRegularCurrentPage(regularCurrentPage + 1);
    } else {
      router.back();
    }
  };

  const handlePrevPage = () => {
    if (regularCurrentPage > 0) {
      setRegularCurrentPage(regularCurrentPage - 1);
    }
  };

  const handlePronounce = (word: string) => {
    console.log(`Pronouncing: ${word}`);
    alert(`Pronouncing: ${word}`);
  };

  const handleDefine = (word: string) => {
    if (!book?.pages?.[regularCurrentPage]) return;

    const page = book.pages[regularCurrentPage];
    const vocabWord = page.vocabularyWords?.find(
      (w) => w.word.toLowerCase() === word.toLowerCase()
    );

    if (vocabWord) {
      setDefinitionData(vocabWord);
    } else {
      setDefinitionData({
        word,
        definition: `This is a definition for "${word}"`,
        example: `Here is an example sentence using "${word}".`,
      });
    }

    setShowDefinition(true);
  };

  const handleAskQuestion = () => {
    setShowComprehension(true);
  };

  const handleRecordPronunciation = () => {
    if (!book?.pages?.[regularCurrentPage]) return;

    setIsRecordingPronunciation(true);

    setTimeout(() => {
      if (isMounted.current) {
        setIsRecordingPronunciation(false);

        const pageContent = book?.pages?.[regularCurrentPage]?.content;
        if (!pageContent) return;

        // TODO: Implement audio recording first, then call assessPronunciation.
        // assessPronunciation(pageContent, recordedAudioUri).then(result => { // Pass recorded audio URI
        //   if (isMounted.current) {
        //     setPronunciationResults(result); // Use the REAL state
        //     setShowPronunciationModal(true);
        //   }
        // }).catch(error => {
        //   console.error("Error assessing page pronunciation:", error);
        // });
        console.warn('[handlePronounceCurrentPage] Feature requires audio recording implementation.');
      }
    }, 3000);
  };

  const comprehensionQuestions = [
    {
      question: "What is happening in this part of the story?",
      options: [
        "The characters are exploring a new place",
        "The characters are solving a problem",
        "The characters are meeting someone new",
        "The characters are learning something important",
      ],
    },
    {
      question: "How do you think the character feels?",
      options: ["Happy", "Scared", "Curious", "Surprised"],
    },
    {
      question: "What do you think will happen next?",
      options: [
        "They will find a treasure",
        "They will meet a new friend",
        "They will solve the mystery",
        "They will go home",
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Gradient Background Layers */}
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />
      <BlurView intensity={100} tint="light" style={styles.blurOverlay} />
      
      {/* Custom Header with Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable 
          onPress={handleBack} 
          style={[styles.headerButton, styles.backButton]}
        >
          <X size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.pageIndicator, { fontFamily: 'Poppins_600SemiBold', color: colors.text }]}>
          Page {regularCurrentPage + 1} of {book?.pages?.length ?? 0}
        </Text>
        {/* Microphone button with claymorphic styling */}
        <Pressable 
          style={[
            styles.headerButton,
            styles.recordButton, 
            isRecordingPronunciation && styles.recordingButton
          ]}
          onPress={handleRecordPronunciation}
          disabled={isRecordingPronunciation}
        >
          <Mic size={20} color="white" /> 
        </Pressable>
      </View>

      <View style={styles.content}>
        {book?.pages?.[regularCurrentPage]?.imageUrl && (
          <View style={[styles.imageContainer, { backgroundColor: theme.card }]}>
            {/* Image would go here */}
          </View>
        )}

        <ScrollView style={styles.textContainer}>
          <Text style={[styles.pageText, { color: theme.text }]}>{book?.pages?.[regularCurrentPage]?.content}</Text>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.navigationButtons}>
            <Pressable
              onPress={handlePrevPage}
              style={[
                styles.navButton, 
                { backgroundColor: theme.card },
                regularCurrentPage === 0 && styles.disabledButton
              ]}
              disabled={regularCurrentPage === 0}
            >
              <ChevronLeft
                size={24}
                color={regularCurrentPage === 0 ? theme.textLight : colors.primary}
              />
            </Pressable>

            <View style={styles.aiAssistant}>
              <AIAssistant
                onPronounce={handlePronounce}
                onDefine={handleDefine}
                onAskQuestion={handleAskQuestion}
              />
            </View>

            <Pressable
              onPress={handleNextPage}
              style={[styles.navButton, { backgroundColor: theme.card }]}
            >
              <ChevronRight size={24} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Word Definition Modal */}
      <Modal
        visible={showDefinition}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDefinition(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{definitionData.word}</Text>
              <Pressable
                onPress={() => setShowDefinition(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.definitionContent}>
              <View style={styles.definitionSection}>
                <Text style={[styles.definitionLabel, { color: theme.text }]}>Definition:</Text>
                <Text style={[styles.definitionText, { color: theme.text }]}>{definitionData.definition}</Text>
              </View>

              <View style={styles.definitionSection}>
                <Text style={[styles.definitionLabel, { color: theme.text }]}>Example:</Text>
                <Text style={[styles.definitionText, { color: theme.text }]}>{definitionData.example}</Text>
              </View>

              <View style={styles.definitionActions}>
                <Button
                  title="Pronounce"
                  onPress={() => handlePronounce(definitionData.word)}
                  icon={<Volume2 size={18} color="white" />}
                  size="small"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comprehension Questions Modal */}
      <Modal
        visible={showComprehension}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComprehension(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Let's Check Understanding</Text>
              <Pressable
                onPress={() => setShowComprehension(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.questionsContainer}>
              {comprehensionQuestions.map((q, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>
                  {q.options.map((option, optIndex) => (
                    <Pressable
                      key={optIndex}
                      style={[styles.optionButton, { backgroundColor: theme.card }]}
                      onPress={() => {
                        alert(`You selected: ${option}`);
                      }}
                    >
                      <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>

            <Button
              title="Done"
              onPress={() => setShowComprehension(false)}
              style={styles.doneButton}
            />
          </View>
        </View>
      </Modal>

      {/* Pronunciation Results Modal */}
      <Modal
        visible={showPronunciationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPronunciationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Pronunciation Results</Text>
              <Pressable
                onPress={() => setShowPronunciationModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            {pronunciationResults && (
              <ScrollView style={styles.pronunciationResultsContainer}>
                <View style={styles.overallScoreContainer}>
                  <Text style={[styles.overallScoreLabel, { color: theme.textLight }]}>Overall Accuracy</Text>
                  <View style={styles.overallScoreBadge}>
                    <Text style={styles.overallScoreText}>
                      {pronunciationResults.accuracyScore}%
                    </Text>
                  </View>
                </View>

                <Text style={[styles.wordResultsTitle, { color: theme.text }]}>Word-by-Word Results:</Text>

                {/* Map over the words array from the sentence result */}
                {pronunciationResults.words.map((wordResult: WordTimingResult, index: number) => (
                  <PronunciationFeedback
                    key={index}
                    // Adapt the WordTimingResult to the expected PronunciationFeedback props
                    feedback={{
                      word: wordResult.word,
                      accuracy: wordResult.accuracyScore,
                      isCorrect: wordResult.accuracyScore >= 80 // Example threshold
                    }}
                  />
                ))}
              </ScrollView>
            )}

            <Button
              title="Try Again"
              onPress={() => {
                setShowPronunciationModal(false);
                setTimeout(() => {
                  handleRecordPronunciation();
                }, 500);
              }}
              style={styles.tryAgainButton}
            />

            <Button
              title="Done"
              variant="outline"
              onPress={() => setShowPronunciationModal(false)}
              style={styles.doneButton}
            />
          </View>
        </View>
      </Modal>

      {showMascot && (
        <MascotGuide
          message="Tap the microphone button at the top to practice reading this page out loud. I'll help you with your pronunciation!"
          duration={5000}
          onDismiss={() => setShowMascot(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: 'Poppins_600SemiBold',
  },
  container: {
    flex: 1,
    backgroundColor: designColors.skyBlue,
  },
  // Gradient background styles
  gradientBg1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '50%',
    backgroundColor: designColors.blue,
    transform: [{ skewY: '-15deg' }],
    opacity: 0.8,
  },
  gradientBg2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '70%',
    height: '45%',
    backgroundColor: designColors.sunflower,
    transform: [{ skewY: '15deg' }],
    opacity: 0.7,
  },
  gradientBg3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60%',
    height: '40%',
    backgroundColor: designColors.orange,
    transform: [{ skewY: '-15deg' }],
    opacity: 0.6,
  },
  gradientBg4: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '50%',
    height: '30%',
    backgroundColor: designColors.deepNavy,
    transform: [{ skewY: '15deg' }],
    opacity: 0.5,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  pageIndicator: {
    fontSize: 14,
  },
  recordButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginBottom: spacing.md,
  },
  pageText: {
    fontSize: 18,
    lineHeight: 28,
  },
  bottomContainer: {
    paddingBottom: spacing.md,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  aiAssistant: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  definitionContent: {
    marginBottom: spacing.md,
  },
  definitionSection: {
    marginBottom: spacing.md,
  },
  definitionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  definitionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  definitionActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  questionsContainer: {
    marginBottom: spacing.md,
  },
  questionItem: {
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  optionButton: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  optionText: {
    fontSize: 16,
  },
  doneButton: {
    marginTop: spacing.md,
  },
  pronunciationResultsContainer: {
    marginBottom: spacing.md,
  },
  overallScoreContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  overallScoreLabel: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  overallScoreBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  overallScoreText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  wordResultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  tryAgainButton: {
    marginBottom: spacing.sm,
  },
});