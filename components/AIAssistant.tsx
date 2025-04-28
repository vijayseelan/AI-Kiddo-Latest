import React, { useState, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { StyleSheet, View, Text, Pressable, Modal, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { Mic, BookOpen, HelpCircle, X, Sparkles } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import Button from "./Button";
import { useThemeColors } from '@/hooks/useThemeColors';
import * as Haptics from 'expo-haptics';
import { assessPronunciation } from "@/services/azure-speech";

interface AIAssistantProps {
  onPronounce?: (word: string) => void;
  onDefine?: (word: string) => void;
  onAskQuestion?: () => void;
  onPracticeRecordingComplete?: (text: string, audioUri: string | null) => void;
  words?: string[];
}

const AIAssistant = ({
  onPronounce,
  onDefine,
  onAskQuestion,
  onPracticeRecordingComplete,
  words = ["dinosaur", "curious", "mischief", "adventure"],
}: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [showWordActions, setShowWordActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    accuracyScore: number;
    fluencyScore: number;
    completenessScore: number;
    pronunciationScore: number;
    prosodyScore?: number;
    word: string;
  } | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecordingPractice, setIsRecordingPractice] = useState(false);
  const [practiceRecording, setPracticeRecording] = useState<Audio.Recording | null>(null);
  // Properly destructure colors from useThemeColors
  const themeColors = useThemeColors();

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    setShowWordActions(false);
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    setShowWordActions(true);
  };

  const startRecording = async () => {
    console.log('[AIAssistant] Starting recording...');
    try {
      console.log('[AIAssistant] Requesting audio permissions...');
      const permissionResult = await Audio.requestPermissionsAsync();
      console.log('[AIAssistant] Audio permission result:', permissionResult);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('[AIAssistant] Creating recording with custom settings for Azure Speech...');
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 256000,
        },
      });
      console.log('[AIAssistant] Recording created successfully');
      setRecording(recording);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    console.log('[AIAssistant] Stopping recording...');
    if (recordingRef.current) {
      console.log('[AIAssistant] Stopping and unloading recording instance...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      console.log('[AIAssistant] Recording stopped successfully');
      recordingRef.current = null;
      if (uri) {
        console.log('[AIAssistant] Recording URI:', uri);
        processAudio(uri); // Process the audio after stopping
      } else {
        console.error('[AIAssistant] Recording URI is null after stopping.');
        setIsAssessing(false);
      }
    } else {
      console.warn('[AIAssistant] No active recording found to stop.');
      setIsAssessing(false);
    }
  };

  const startRecordingPractice = async () => {
    try {
      console.log('[AIAssistant] Requesting practice recording permissions...');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('[AIAssistant] Microphone permission not granted.');
        // Optionally show an alert to the user
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('[AIAssistant] Starting practice recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setPracticeRecording(newRecording);
      setIsRecordingPractice(true);
      console.log('[AIAssistant] Practice recording started.');

    } catch (err) {
      console.error('[AIAssistant] Failed to start practice recording', err);
    }
  };

  const stopRecordingPractice = async () => {
    console.log('[AIAssistant] Stopping practice recording...');
    if (!practiceRecording) return;

    setIsRecordingPractice(false);
    try {
      await practiceRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }); // Reset audio mode
      const uri = practiceRecording.getURI();
      console.log('[AIAssistant] Practice recording stopped and stored at', uri);

      // Pass the full text and the audio URI to the parent component
      const fullText = words.join(' ');
      onPracticeRecordingComplete?.(fullText, uri);

    } catch (error) {
      console.error('[AIAssistant] Failed to stop practice recording', error);
      onPracticeRecordingComplete?.(words.join(' '), null); // Notify parent even on error
    } finally {
      setPracticeRecording(null); 
    }
  };

  const processAudio = async (uri: string) => {
    try {
      setIsAssessing(true);
      console.log('[AIAssistant] Reading audio file as base64...');
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('[AIAssistant] Audio data stats:', {
        length: audioBase64.length,
        firstBytes: audioBase64.substring(0, 50),
        isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(audioBase64)
      });
      
      // Check if the audio file exists and get its info
      if (!uri) {
        throw new Error('Recording URI is missing');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('[AIAssistant] Audio file info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('Recording file does not exist');
      }

      console.log('[AIAssistant] Calling assessPronunciation with word:', selectedWord);
      // Pass word and base64 audio to the service
      const result = await assessPronunciation(selectedWord, audioBase64);
      console.log('[AIAssistant] Assessment result:', result);

      if (onPronounce) {
        // For now, just pass the word that was pronounced
        onPronounce(selectedWord);
      }

      setAssessmentResult(result);
      console.log('Pronunciation score:', result.pronunciationScore);
    } catch (error) {
      console.error('Error assessing pronunciation:', error);
      setAssessmentResult(null);
    } finally {
      setIsAssessing(false);
      // Clean up the recording file
      try {
        await FileSystem.deleteAsync(uri);
        console.log('[AIAssistant] Recording file deleted:', uri);
      } catch (deleteError) {
        console.error('[AIAssistant] Error deleting recording file:', deleteError);
      }
    }
  };

  const handlePronounce = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDefine = () => {
    if (onDefine) {
      onDefine(selectedWord);
    }
    setShowWordActions(false);
  };

  const handleAskQuestion = () => {
    if (onAskQuestion) {
      onAskQuestion();
    }
    setIsOpen(false);
  };

  return (
    <>
      <Pressable style={styles.assistantButton} onPress={toggleAssistant}>
        <Sparkles size={24} color="white" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={toggleAssistant}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reading Assistant</Text>
              <Pressable onPress={toggleAssistant} style={styles.closeButton}>
                <X size={24} color={themeColors.text} />
              </Pressable>
            </View>

            {showWordActions && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Actions for "{selectedWord}"</Text>
                {onPronounce && <Button title="Pronounce" onPress={() => onPronounce(selectedWord)} icon={<BookOpen size={18} color="white" />} fullWidth style={styles.actionButtonWithMargin} />}
                {onDefine && <Button title="Define" onPress={() => onDefine(selectedWord)} icon={<HelpCircle size={18} color="white" />} fullWidth style={styles.actionButtonWithMargin} />}
                <Button
                  title={isRecording ? "Stop Recording" : "Record Pronunciation"}
                  onPress={isRecording ? stopRecording : startRecording}
                  icon={<Mic size={18} color="white" />} 
                  loading={isAssessing}
                  fullWidth 
                  style={styles.actionButtonWithMargin} // Use style for margin
                />
                {assessmentResult && (
                  <Text style={{color: themeColors.text}}>Accuracy: {assessmentResult.accuracyScore}%</Text>
                )}
              </View>
            )}

            {/* Practice Words Section */} 
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Practice Words</Text>
              <View style={styles.wordsList}>
                {words.map((word) => (
                  <Pressable
                    key={word}
                    style={styles.wordChip}
                    onPress={() => handleWordSelect(word)}
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Practice Sentence/Passage Section (Recording Button) */} 
            {onPracticeRecordingComplete && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Practice Aloud</Text>
                <Button
                  title={isRecordingPractice ? "Stop Recording Practice" : "Record Practice"}
                  onPress={isRecordingPractice ? stopRecordingPractice : startRecordingPractice}
                  icon={<Mic size={18} color="white" />} 
                  fullWidth
                />
              </View>
            )}

            {/* Ask AI Section */} 
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ask AI</Text>
              <Button
                title="Ask a question about this story"
                onPress={handleAskQuestion}
                icon={<HelpCircle size={18} color="white" />} 
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default AIAssistant;

const styles = StyleSheet.create({
  resultsContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  wordText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  scoreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  overallScoreContainer: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  overallScoreLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  overallScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  wordButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedWordButton: {
    backgroundColor: colors.primary + '33', // Use theme color with transparency
    borderColor: colors.primary,
  },
  assistantButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  wordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wordChip: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  wordChipText: {
    color: colors.primary,
    fontWeight: "500",
  },
  wordActionsContainer: {
    alignItems: "center",
  },
  selectedWordTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  actionButton: {
    minWidth: 120,
  },
  actionButtonWithMargin: { // Style for buttons needing margin
    marginBottom: spacing.sm,
  },
});