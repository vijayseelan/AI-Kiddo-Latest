import React, { useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Mic, Volume2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useUserStore } from "@/store/user-store";
import { practiceWords, practiceSentences } from "@/mocks/books";
import WordPronunciationCard from "@/components/WordPronunciationCard";
import Button from "@/components/Button";
import MascotGuide from "@/components/MascotGuide";
import { assessSentencePronunciation } from "@/services/pronunciation";
import PronunciationFeedback from "@/components/PronunciationFeedback";

export default function PronunciationPracticeScreen() {
  const router = useRouter();
  const { activeChild } = useUserStore();
  const [activeTab, setActiveTab] = useState<"words" | "sentences">("words");
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sentenceResults, setSentenceResults] = useState<any>(null);
  const [showMascot, setShowMascot] = useState(true);
  
  // Get practice content based on reading level
  const readingLevel = activeChild?.readingLevel || "beginner";
  const words = practiceWords[readingLevel] || practiceWords.beginner;
  const sentences = practiceSentences[readingLevel] || practiceSentences.beginner;
  
  const handleBack = () => {
    router.back();
  };
  
  const handlePronounce = (text: string) => {
    // In a real app, this would use text-to-speech
    console.log(`Pronouncing: ${text}`);
    // Mock implementation
    alert(`Pronouncing: ${text}`);
  };
  
  const handleRecordSentence = (sentence: string) => {
    setSelectedSentence(sentence);
    setIsRecording(true);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Process the recording
      assessSentencePronunciation(sentence, null).then(result => {
        setSentenceResults(result);
        
        // Update pronunciation accuracy in user profile
        if (activeChild?.id && result.overallAccuracy) {
          useUserStore.getState().updatePronunciationAccuracy(
            activeChild.id, 
            result.overallAccuracy
          );
          
          // Check if this deserves a badge
          if (result.overallAccuracy >= 90 && !activeChild.badges.some(b => b.name === "Pronunciation Pro")) {
            useUserStore.getState().addBadge(activeChild.id, {
              name: "Pronunciation Pro",
              description: "Achieved 90% pronunciation accuracy",
              icon: "mic"
            });
          }
        }
      });
    }, 3000);
  };
  
  const handleWordResult = (result) => {
    // Update pronunciation accuracy in user profile
    if (activeChild?.id) {
      // In a real app, we would update this more intelligently
      // by averaging with previous scores or using a weighted approach
      useUserStore.getState().updatePronunciationAccuracy(
        activeChild.id, 
        result.accuracy
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Pronunciation Practice</Text>
      </View>
      
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "words" && styles.activeTab]}
          onPress={() => {
            setActiveTab("words");
            setSentenceResults(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "words" && styles.activeTabText,
            ]}
          >
            Words
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "sentences" && styles.activeTab]}
          onPress={() => {
            setActiveTab("sentences");
            setSentenceResults(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sentences" && styles.activeTabText,
            ]}
          >
            Sentences
          </Text>
        </Pressable>
      </View>
      
      {activeTab === "words" ? (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.wordsContainer}
        >
          {words.map((item, index) => (
            <WordPronunciationCard
              key={index}
              word={item.word}
              imageUrl={item.imageUrl}
              onResult={handleWordResult}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          {sentenceResults ? (
            <View style={styles.sentenceResultsContainer}>
              <View style={styles.sentenceContainer}>
                <Text style={styles.sentenceText}>{selectedSentence}</Text>
                <Pressable
                  style={styles.pronounceButton}
                  onPress={() => handlePronounce(selectedSentence || "")}
                >
                  <Volume2 size={20} color={colors.primary} />
                </Pressable>
              </View>
              
              <View style={styles.overallScoreContainer}>
                <Text style={styles.overallScoreLabel}>Overall Accuracy</Text>
                <View style={styles.overallScoreBadge}>
                  <Text style={styles.overallScoreText}>
                    {sentenceResults.overallAccuracy}%
                  </Text>
                </View>
              </View>
              
              <Text style={styles.wordResultsTitle}>Word-by-Word Results:</Text>
              
              {sentenceResults.words.map((wordResult, index) => (
                <PronunciationFeedback
                  key={index}
                  feedback={wordResult}
                  onPronounce={handlePronounce}
                />
              ))}
              
              <Button
                title="Try Another Sentence"
                onPress={() => setSentenceResults(null)}
                style={styles.tryAgainButton}
              />
            </View>
          ) : (
            <View style={styles.sentencesContainer}>
              {sentences.map((sentence, index) => (
                <View key={index} style={styles.sentenceCard}>
                  <Text style={styles.sentenceText}>{sentence}</Text>
                  <View style={styles.sentenceActions}>
                    <Pressable
                      style={styles.pronounceButton}
                      onPress={() => handlePronounce(sentence)}
                    >
                      <Volume2 size={20} color={colors.primary} />
                    </Pressable>
                    <Button
                      title={isRecording && selectedSentence === sentence ? "Recording..." : "Record"}
                      icon={<Mic size={18} color="white" />}
                      onPress={() => handleRecordSentence(sentence)}
                      disabled={isRecording}
                      size="small"
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      
      {showMascot && (
        <MascotGuide
          message={
            activeTab === "words"
              ? "Practice pronouncing these words by tapping the microphone button and speaking clearly."
              : "Practice reading these sentences out loud. I'll help you improve your pronunciation!"
          }
          duration={5000}
          onDismiss={() => setShowMascot(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  wordsContainer: {
    paddingBottom: spacing.xl,
  },
  sentencesContainer: {
    paddingBottom: spacing.xl,
  },
  sentenceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sentenceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sentenceText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    flex: 1,
  },
  sentenceActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  pronounceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  sentenceResultsContainer: {
    paddingBottom: spacing.xl,
  },
  overallScoreContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: colors.textLight,
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
    color: colors.text,
    marginBottom: spacing.md,
  },
  tryAgainButton: {
    marginTop: spacing.lg,
  },
});