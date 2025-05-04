export const options = { headerShown: false };
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable, 
  Animated, 
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ArrowLeft, Mic, StopCircle, CheckCircle2, XCircle } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import { assessPronunciation } from '../../services/azure-speech';
import { useOnboarding } from '../../context/OnboardingContext';
import { PronunciationFeedback } from '../../types/user';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Assessment content
const assessmentContent = {
  words: [
    'cat', 'dog', 'sun', 'book', 'tree'
  ],
  sentences: [
    'The cat sat on the mat.',
    'I like to read books.',
    'The sun is shining today.'
  ],
  passages: [
    'Once upon a time, there was a little rabbit who lived in the forest. He had many friends and loved to play all day long. His best friend was a wise old owl who taught him many things about the world.'
  ]
};

// Assessment types
type AssessmentType = 'words' | 'sentences' | 'passages';
type AssessmentState = 'intro' | 'recording' | 'processing' | 'results';

export default function Assessment() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { childName } = onboardingData;
  
  // State for assessment
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('words');
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [results, setResults] = useState<PronunciationFeedback[]>([]);
  const [overallResults, setOverallResults] = useState<{
    accuracy: number;
    fluency?: number;
    completeness?: number;
    pronunciation?: number;
    prosody?: number;
  } | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    // Fade in the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Reset state when assessment type changes
  useEffect(() => {
    setAssessmentState('intro');
    setCurrentItemIndex(0);
    setResults([]);
    setOverallResults(null);
  }, [assessmentType]);
  
  // Request audio permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need microphone access to assess pronunciation.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);
  
  const handleBack = () => {
    if (assessmentState !== 'intro') {
      // If in the middle of an assessment, go back to intro
      setAssessmentState('intro');
      setCurrentItemIndex(0);
      setResults([]);
      setOverallResults(null);
    } else {
      router.back(); // Return to previous screen
    }
  };
  
  const handleNavigateToAnalytics = () => {
    // Save assessment results to context
    updateOnboardingData({
      assessmentResults: {
        overallAccuracy: overallResults?.accuracy || 0,
        fluency: overallResults?.fluency || 0,
        completeness: overallResults?.completeness || 0,
        pronunciation: overallResults?.pronunciation || 0,
        prosody: overallResults?.prosody || 0,
        words: results
      }
    });
    
    // Navigate to analytics screen
    router.push('/onboarding/Analytics');
  };

  const handleContinue = () => {
    if (assessmentState === 'results' && currentItemIndex === getAssessmentItems().length - 1) {
      // All assessments complete, navigate to next onboarding screen (Analytics)
      handleNavigateToAnalytics();
    } else if (assessmentState === 'results') {
      // Move to next item
      setCurrentItemIndex(currentItemIndex + 1);
      setAssessmentState('intro');
      setResults([]);
      setOverallResults(null);
    } else {
      // Start assessment
      setAssessmentState('recording');
    }
  };
  
  const startRecording = async () => {
    try {
      // Prepare the recording session with specific settings for Azure Speech
      console.log('[Assessment] Requesting audio permissions...');
      const permissionResult = await Audio.requestPermissionsAsync();
      console.log('[Assessment] Audio permission result:', permissionResult);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('[Assessment] Creating recording with custom settings for Azure Speech...');
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
      console.log('[Assessment] Recording created successfully');
      setRecording(recording);
      setAssessmentState('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };
  
  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (!recording) return;
    
    setAssessmentState('processing');
    
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        // Process the recording
        await processRecording(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setAssessmentState('intro');
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };
  
  const processRecording = async (audioUri: string) => {
    try {
      // Check if the audio file exists and get its info
      if (!audioUri) {
        throw new Error('Recording URI is missing');
      }

      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      console.log('[Assessment] Audio file info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('Recording file does not exist');
      }
      
      // Read the audio file directly as base64 - this matches the AIAssistant implementation
      console.log('[Assessment] Reading audio file as base64...');
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('[Assessment] Audio data stats:', {
        length: base64Audio.length,
        firstBytes: base64Audio.substring(0, 50),
        isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Audio)
      });
      
      const currentItem = getAssessmentItems()[currentItemIndex];
      
      // Use the Azure Speech service for assessment
      try {
        const result = await assessPronunciation(currentItem, base64Audio);
        console.log('Azure Speech result:', result);
        
        // Check if we got valid scores (not all zeros)
        const hasValidScores = (
          result.accuracyScore > 0 || 
          result.pronunciationScore > 0 || 
          result.fluencyScore > 0 || 
          result.completenessScore > 0 ||
          (typeof result.prosodyScore === 'number' && result.prosodyScore > 0)
        );
        
        if (hasValidScores) {
          // Use the actual scores from the API, now that it's working correctly
          // Convert Azure result format to our app's format
          const wordResult = {
            word: currentItem,
            accuracy: result.accuracyScore || 0,
            isCorrect: (result.accuracyScore || 0) >= 70,
            suggestion: (result.accuracyScore || 0) < 60 ? "Try speaking more slowly and clearly." : 
                       (result.accuracyScore || 0) < 70 ? "Good attempt! Focus on the vowel sounds." : ""
          };
          
          setResults([wordResult]);
          setOverallResults({ 
            accuracy: result.accuracyScore || 0,
            fluency: result.fluencyScore || 0,
            completeness: result.completenessScore || 0,
            pronunciation: result.pronunciationScore || 0,
            prosody: result.prosodyScore || 0
          });
        } else {
          // If all scores are zero, use fallback scoring
          throw new Error('Azure returned all zero scores');
        }
      } catch (error) {
        console.error('Azure Speech assessment error:', error);
        // Fallback to mock data if Azure fails
        Alert.alert(
          'Assessment Error',
          'Could not connect to speech service. Using sample data instead.',
          [{ text: 'OK' }]
        );
        
        // Generate more realistic mock data based on the assessment type
        let accuracy;
        if (assessmentType === 'words') {
          // Words should be easier to pronounce correctly
          accuracy = Math.floor(Math.random() * 31) + 70; // 70-100
        } else if (assessmentType === 'sentences') {
          // Sentences are moderately difficult
          accuracy = Math.floor(Math.random() * 36) + 65; // 65-100
        } else {
          // Passages are most challenging
          accuracy = Math.floor(Math.random() * 41) + 60; // 60-100
        }
        
        const wordResult = {
          word: currentItem,
          accuracy: accuracy,
          isCorrect: accuracy >= 75,
          suggestion: accuracy < 65 ? "Try speaking more slowly and clearly." : 
                     accuracy < 75 ? "Good attempt! Focus on the vowel sounds." : ""
        };
        
        // Create slightly varied scores for a more realistic assessment
        const fluency = Math.min(100, Math.max(60, accuracy + (Math.random() * 10 - 5)));
        const completeness = Math.min(100, Math.max(70, accuracy + (Math.random() * 15)));
        
        setResults([wordResult]);
        setOverallResults({ 
          accuracy: accuracy,
          fluency: Math.round(fluency),
          completeness: Math.round(completeness),
          pronunciation: Math.round(accuracy * 0.9), // Estimate pronunciation as slightly lower than accuracy
          prosody: Math.round(accuracy * 0.7)  // Estimate prosody as moderately lower than accuracy
        });
      }
      
      setAssessmentState('results');
    } catch (err) {
      console.error('Failed to process recording', err);
      setAssessmentState('intro');
      Alert.alert('Error', 'Failed to analyze pronunciation. Please try again.');
    }
  };
  
  const getAssessmentItems = () => {
    switch (assessmentType) {
      case 'words':
        return assessmentContent.words;
      case 'sentences':
        return assessmentContent.sentences;
      case 'passages':
        return assessmentContent.passages;
      default:
        return assessmentContent.words;
    }
  };
  
  const getCurrentItem = () => {
    return getAssessmentItems()[currentItemIndex] || '';
  };
  
  const speakCurrentItem = () => {
    Speech.speak(getCurrentItem(), {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8
    });
  };
  
  const renderAssessmentTypeSelector = () => (
    <View style={styles.assessmentTypeContainer}>
      {(['words', 'sentences', 'passages'] as AssessmentType[]).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.assessmentTypeButton,
            assessmentType === type && styles.assessmentTypeButtonActive
          ]}
          onPress={() => setAssessmentType(type)}
        >
          <Text 
            style={[
              styles.assessmentTypeText,
              assessmentType === type && styles.assessmentTypeTextActive
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderIntroState = () => (
    <View style={styles.assessmentContainer}>
      <Text style={styles.assessmentTitle}>
        {assessmentType === 'words' ? 'Word Recognition' : 
         assessmentType === 'sentences' ? 'Sentence Fluency' : 
         'Passage Comprehension'}
      </Text>
      
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{getCurrentItem()}</Text>
        <TouchableOpacity 
          style={styles.speakButton}
          onPress={speakCurrentItem}
        >
          <Text style={styles.speakButtonText}>🔊 Listen</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructionText}>
        {assessmentType === 'words' ? 
          'Read the word aloud when you tap "Start Recording"' : 
         assessmentType === 'sentences' ? 
          'Read the sentence aloud clearly and at a natural pace' : 
          'Read the passage aloud as clearly as you can'}
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={startRecording}
      >
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderRecordingState = () => (
    <View style={styles.assessmentContainer}>
      <Text style={styles.assessmentTitle}>Recording...</Text>
      
      <View style={styles.recordingContainer}>
        <Animated.View 
          style={[
            styles.recordingIndicator,
            {
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.2, 1]
                })
              }]
            }
          ]}
        />
        <Text style={styles.recordingText}>Listening to your voice</Text>
      </View>
      
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{getCurrentItem()}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={stopRecording}
      >
        <StopCircle size={24} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Stop Recording</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderProcessingState = () => (
    <View style={styles.assessmentContainer}>
      <Text style={styles.assessmentTitle}>Analyzing...</Text>
      
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={designColors.blue} />
        <Text style={styles.processingText}>
          Our AI is analyzing your {assessmentType === 'words' ? 'word' : 
                                   assessmentType === 'sentences' ? 'sentence' : 'passage'} pronunciation
        </Text>
      </View>
    </View>
  );
  
  const renderResultsState = () => (
    <View style={styles.assessmentContainer}>
      <Text style={styles.assessmentTitle}>Results</Text>
      
      {overallResults && (
        <View style={styles.resultsContainer}>
          {/* Accuracy */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Accuracy</Text>
            <View style={styles.barContainer}>
              <View 
                style={[styles.barFill, { width: `${Math.min(100, Math.round(overallResults.accuracy))}%`, backgroundColor: designColors.blue }]}
              />
              <Text style={styles.barText}>{Math.min(100, Math.round(overallResults.accuracy))}%</Text>
            </View>
          </View>

          {/* Speaking */}
          {overallResults.pronunciation !== undefined && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Speaking</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[styles.barFill, { width: `${Math.min(100, Math.round(overallResults.pronunciation))}%`, backgroundColor: designColors.orange }]}
                />
                <Text style={styles.barText}>{Math.min(100, Math.round(overallResults.pronunciation))}%</Text>
              </View>
            </View>
          )}

          {/* Fluency */}
          {overallResults.fluency !== undefined && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Fluency</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[styles.barFill, { width: `${Math.min(100, Math.round(overallResults.fluency))}%`, backgroundColor: designColors.sunflower }]}
                />
                <Text style={styles.barText}>{Math.min(100, Math.round(overallResults.fluency))}%</Text>
              </View>
            </View>
          )}

          {/* Clarity */}
          {overallResults.completeness !== undefined && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Clarity</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[styles.barFill, { width: `${Math.min(100, Math.round(overallResults.completeness))}%`, backgroundColor: designColors.skyBlue }]}
                />
                <Text style={styles.barText}>{Math.min(100, Math.round(overallResults.completeness))}%</Text>
              </View>
            </View>
          )}

          {/* Rhythm */}
          {overallResults.prosody !== undefined && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Rhythm</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[styles.barFill, { width: `${Math.min(100, Math.round(overallResults.prosody))}%`, backgroundColor: '#9b59b6' }]}
                />
                <Text style={styles.barText}>{Math.min(100, Math.round(overallResults.prosody))}%</Text>
              </View>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{getCurrentItem()}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          {currentItemIndex === getAssessmentItems().length - 1 ? 
            'Continue to Results' : 'Next Item'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderAssessmentState = () => {
    switch (assessmentState) {
      case 'intro':
        return renderIntroState();
      case 'recording':
        return renderRecordingState();
      case 'processing':
        return renderProcessingState();
      case 'results':
        return renderResultsState();
      default:
        return renderIntroState();
    }
  };

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={designColors.deepNavy} />
      </Pressable>
      
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          {Array(13).fill(0).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressDot, 
                i === 9 ? styles.activeDot : i < 9 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>{childName}'s Reading Assessment</Text>
            <Text style={styles.subtitle}>Let's see how well {childName} can read</Text>
            
            {renderAssessmentTypeSelector()}
            {renderAssessmentState()}
            
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                Item {currentItemIndex + 1} of {getAssessmentItems().length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${((currentItemIndex + 1) / getAssessmentItems().length) * 100}%` 
                    }
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designColors.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e6ed',
    margin: 4,
    shadowColor: '#a0a0a0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeDot: {
    backgroundColor: designColors.orange,
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  completedDot: {
    backgroundColor: designColors.blue,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 70, // Add space for the progress dots
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: designColors.deepNavy,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    color: designColors.blue,
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  assessmentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  assessmentTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  assessmentTypeButtonActive: {
    backgroundColor: 'white',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  assessmentTypeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: designColors.deepNavy + '80',
  },
  assessmentTypeTextActive: {
    color: designColors.deepNavy,
    fontFamily: 'Poppins-SemiBold',
  },
  assessmentContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    padding: 25,
    marginBottom: 25,
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  assessmentTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: `${designColors.skyBlue}20`,
    borderRadius: 24,
    padding: 25,
    width: '100%',
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${designColors.skyBlue}40`,
  },
  itemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: designColors.deepNavy,
    textAlign: 'center',
    lineHeight: 32,
  },
  speakButton: {
    marginTop: 20,
    backgroundColor: `${designColors.sunflower}30`,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${designColors.sunflower}60`,
  },
  speakButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.orange,
  },
  instructionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.blue,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    // Claymorphism
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    shadowColor: '#ff4757',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 18,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  recordingIndicator: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff6b6b',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: designColors.deepNavy,
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  processingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: designColors.blue,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 26,
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  resultLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: designColors.deepNavy,
    width: '25%',
  },
  barContainer: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    position: 'relative',
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 18,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  barText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: designColors.deepNavy,
    position: 'absolute',
    right: 12,
    top: 7,
  },
  wordResultsContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  wordResultsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  wordResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  wordResultText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  wordResultAccuracy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  wordResultAccuracyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 5,
  },
  wordResultSuggestion: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    width: '100%',
    marginTop: 4,
    paddingLeft: 10,
  },
  progressIndicator: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  progressText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: designColors.blue,
    borderRadius: 5,
  },
});
