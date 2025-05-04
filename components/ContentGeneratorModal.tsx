import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing as ReanimatedEasing,
  runOnJS,
  interpolate,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import {
  X,
  BookOpen,
  FileText,
  AlignLeft,
  BookText as BookTextIcon,
  Sparkles,
  Lightbulb,
  CheckCircle,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useThemeStore } from "@/store/theme-store";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBooksStore } from "@/store/books-store";
import Button from "@/components/Button";
import { generateTextContent, ServiceContentType } from "@/services/ai-content";
import { generateImage } from "@/services/image-generation";
import { generateVoice } from "@/services/voice-generation";
import { useUserStore } from "@/store/user-store";
import { supabase } from '@/lib/supabase';
import { saveAIGeneratedContent, AIGeneratedContent, AIContentItem, ContentType as DBContentType, ReadingLevel } from '@/services/database';
import MascotGuide from "@/components/MascotGuide";

interface ContentGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
}

type ContentType = ServiceContentType; // Using the type from ai-content.ts

interface ContentOption {
  id: ContentType;
  title: string;
  description: string;
  icon: React.ReactNode;
  readingLevel: "beginner" | "intermediate" | "advanced";
}

// Interface for the book's generated content
interface GeneratedContent {
  id: string;
  title: string;
  type: DBContentType;
  reading_level: ReadingLevel;
  image_url?: string;
  audio_url?: string;
  user_id?: string;
  child_id?: string;
  description?: string;
  language?: string;
  age_range?: string;
  is_favorite?: boolean;
  items: AIContentItem[];
  content: string; // Required by the Book interface
}

function ContentGeneratorModal({ visible, onClose }: ContentGeneratorModalProps): JSX.Element {
  const { isDarkMode } = useThemeStore();
  const theme = useThemeColors();
  const { books, addBook } = useBooksStore();
  const { parent, user, activeChild } = useUserStore();
  
  // Content generation state
  const [contentType, setContentType] = useState<ServiceContentType | null>(null);
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Reanimated shared values for smoother animations
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalTranslateY = useSharedValue(50);
  
  // Legacy Animation refs (will keep for compatibility)
  const spinValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  
  // Reanimated shared values for generating animation
  const reanimatedSpin = useSharedValue(0);
  const reanimatedScale = useSharedValue(1);
  const reanimatedSuccessScale = useSharedValue(0);
  
  // Reading level based on active child's profile (or default to beginner)
  const readingLevel = activeChild?.readingLevel || "beginner";
  
  // Generated content references
  const [generatedText, setGeneratedText] = useState<string | undefined>(undefined);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | undefined>(undefined);
  
  // Store temporary values during generation
  let tempImageUrl: string | undefined = undefined;
  let tempAudioUrl: string | undefined = undefined;
  
  // Store temporary content items
  const [contentItems, setContentItems] = useState<Omit<AIContentItem, 'content_id'>[]>([]);
  
  // Handle modal visibility with animations
  useEffect(() => {
    if (visible) {
      // When opening the modal
      setModalVisible(true);
      modalOpacity.value = withTiming(1, { duration: 300, easing: ReanimatedEasing.out(ReanimatedEasing.cubic) });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalTranslateY.value = withTiming(0, { duration: 300, easing: ReanimatedEasing.out(ReanimatedEasing.cubic) });
    } else {
      // When closing the modal, animate out first, then set visibility to false
      modalOpacity.value = withTiming(0, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) });
      modalScale.value = withTiming(0.8, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) });
      modalTranslateY.value = withTiming(50, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) }, 
        (finished) => {
          if (finished) {
            runOnJS(setModalVisible)(false);
          }
        }
      );
    }
  }, [visible]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && !isGenerating) {
        handleClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, isGenerating]);
  
  // Reset state when modal closes
  const handleClose = () => {
    // Only allow closing if not actively generating
    if (!isGenerating) {
      // Start closing animation
      modalOpacity.value = withTiming(0, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) });
      modalScale.value = withTiming(0.8, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) });
      modalTranslateY.value = withTiming(50, { duration: 250, easing: ReanimatedEasing.in(ReanimatedEasing.cubic) }, 
        (finished) => {
          if (finished) {
            runOnJS(resetState)();
          }
        }
      );
    }
  };
  
  // Reset all state variables
  const resetState = () => {
    setContentType(null);
    setTitle("");
    setShowSuccess(false);
    setGeneratedText(undefined);
    setGeneratedImageUrl(undefined);
    setGeneratedAudioUrl(undefined);
    onClose();
  };
  
  // Start animations when generating - using Reanimated
  useEffect(() => {
    if (isGenerating && !showSuccess) {
      // Legacy animations for compatibility
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Reanimated animations
      // Continuous rotation animation
      const rotationInterval = setInterval(() => {
        reanimatedSpin.value = withTiming(reanimatedSpin.value + 1, { duration: 2000, easing: ReanimatedEasing.linear });
      }, 2000);
      
      // Pulse animation
      const pulseAnimation = () => {
        reanimatedScale.value = withSequence(
          withTiming(1.2, { duration: 1000, easing: ReanimatedEasing.inOut(ReanimatedEasing.quad) }),
          withTiming(1, { duration: 1000, easing: ReanimatedEasing.inOut(ReanimatedEasing.quad) })
        );
        setTimeout(pulseAnimation, 2000);
      };
      
      pulseAnimation();
      
      return () => {
        clearInterval(rotationInterval);
      };
    }
    
    // Success animation with Reanimated
    if (showSuccess) {
      // Legacy animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }).start();
      
      // Reanimated animation
      reanimatedSuccessScale.value = withSpring(1, { 
        damping: 10, 
        stiffness: 100,
        mass: 1
      });
    }
    
    return () => {
      // Clean up legacy animations
      spinValue.stopAnimation();
      scaleValue.stopAnimation();
      successScale.stopAnimation();
    };
  }, [isGenerating, showSuccess]);
  
  // Interpolate spin value to rotation (legacy)
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Reanimated animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [
        { scale: modalScale.value },
        { translateY: modalTranslateY.value }
      ],
    };
  });
  
  const spinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${reanimatedSpin.value * 360}deg` },
        { scale: reanimatedScale.value }
      ],
    };
  });
  
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: reanimatedSuccessScale.value }],
      opacity: reanimatedSuccessScale.value,
    };
  });
  
  // Content options with icons and descriptions
  const contentOptions: ContentOption[] = [
    {
      id: "words",
      title: "Vocabulary List",
      description: "Generate a list of words to practice",
      icon: <BookTextIcon size={24} color={colors.primary} />,
      readingLevel: "beginner"
    },
    {
      id: "sentences",
      title: "Simple Sentences",
      description: "Create sentences for reading practice",
      icon: <FileText size={24} color={colors.primary} />,
      readingLevel: "beginner"
    },
    {
      id: "passage",
      title: "Short Passage",
      description: "Generate a brief reading passage",
      icon: <AlignLeft size={24} color={colors.primary} />,
      readingLevel: "intermediate"
    },
    {
      id: "story",
      title: "Short Story",
      description: "Create a complete short story",
      icon: <BookOpen size={24} color={colors.primary} />,
      readingLevel: "advanced"
    }
  ];
  
  // Function to handle content generation
  const handleGenerate = async () => {
    if (!contentType || !title.trim()) return;
    
    setIsGenerating(true);
    let success = false;
    
    try {
      // 1. Generate text content
      console.log(`Generating ${contentType} for topic: ${title} at ${readingLevel} level...`);
      // Pass parameters in the correct order: topic, contentType, readingLevel
      const generatedText = await generateTextContent(title, contentType as ServiceContentType, readingLevel);
      
      if (!generatedText) {
        throw new Error("Failed to generate text content.");
      }
      
      console.log(`Generated content for ${contentType}:\n${JSON.stringify(generatedText, null, 2)}...`);
      
      // No need to generate images and audio separately, they're included in generatedText
      success = true;
      
      // Process the content based on the response structure
      let displayText = generatedText.content || '';
      let displayImageUrl: string | undefined;
      let displayAudioUrl: string | undefined;
      
      // Split content into lines for words and sentences
      const contentLines = contentType === 'words' || contentType === 'sentences' ?
        displayText.split('\n').filter(line => line.trim().length > 0) :
        [displayText]; // For passages and stories, treat as single item
      
      // Array to store media URLs for each line
      const mediaUrls: { imageUrl?: string; audioUrl?: string; }[] = [];
      
      // Generate media for each line
      for (const line of contentLines) {
        let lineImageUrl: string | undefined;
        let lineAudioUrl: string | undefined;
        
        // Generate image
        try {
          console.log('[Modal] Generating image for:', line);
          const imageResult = await generateImage(line);
          if (imageResult && !imageResult.error) {
            // Don't log the full URL to avoid truncation
            console.log('[Modal] Image generated successfully');
            // Verify we have a valid URL
            if (imageResult.url && imageResult.url.startsWith('http')) {
              lineImageUrl = imageResult.url;
            } else {
              console.error('[Modal] Invalid image URL received:', typeof imageResult.url);
            }
          }
        } catch (error) {
          console.error('[Modal] Error generating image:', error);
        }
        
        // Generate audio
        try {
          console.log('[Modal] Generating audio for:', line);
          const audioResult = await generateVoice(line);
          if (audioResult && !audioResult.error) {
            console.log('[Modal] Audio generated:', audioResult.audioUrl);
            lineAudioUrl = audioResult.audioUrl;
          }
        } catch (error) {
          console.error('[Modal] Error generating audio:', error);
        }
        
        mediaUrls.push({
          imageUrl: lineImageUrl,
          audioUrl: lineAudioUrl
        });
      }
      
      // For the main content display, use the first item's media
      if (mediaUrls.length > 0) {
        displayImageUrl = mediaUrls[0].imageUrl || undefined;
        displayAudioUrl = mediaUrls[0].audioUrl || undefined;
      }
      
      // Store the generated content
      setGeneratedText(displayText || undefined);
      setGeneratedImageUrl(displayImageUrl);
      setGeneratedAudioUrl(displayAudioUrl);
      
      // Add to library
      // Create a properly formatted Book object to add to the library
      const newContent = {
        id: `content-${Date.now()}`,
        title: title,
        author: "AI Kiddo",
        description: `AI-generated ${contentType} about "${title}" for ${readingLevel} reading level.`,
        readingLevel: readingLevel,
        content: displayText,
        coverUrl: displayImageUrl || undefined,
        audioUrl: displayAudioUrl || undefined,
        dateAdded: new Date().toISOString(),
        isGenerated: true,
        contentType: contentType as "words" | "sentences" | "passage" | "story",
        generatedContent: generatedText // Store the full generated content with all media
      };
      
      // Save to Supabase first
      // Get the authenticated user's ID from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const authUserId = session?.user?.id;
      
      // Get the active child ID
      const childId = useUserStore.getState().activeChild?.id;
      
      if (authUserId) {
        console.log('[ContentGenerator] Saving content with user ID:', authUserId, 'and child ID:', childId || 'none');
        
        // Map the content type to match database constraints
        // Database only accepts: 'words', 'sentences', 'passage', 'story'
        const dbContentType = contentType; // No need to map since we're using the same types

        // Prepare the main content record
        const contentRecord: AIGeneratedContent = {
          title,
          type: dbContentType,
          reading_level: readingLevel,
          image_url: displayImageUrl || undefined,
          audio_url: displayAudioUrl || undefined,
          user_id: authUserId,
          child_id: childId || undefined,
          description: `AI-generated ${contentType} about "${title}" for ${readingLevel} reading level.`,
          language: 'en', // Default to English for now
          is_favorite: false
        };
        
        // Prepare the content items
        const items: Omit<AIContentItem, 'content_id'>[] = [];
        
        // For vocabulary and sentences, split into multiple items
        if (contentType === 'words' || contentType === 'sentences') {
          const lines = displayText.split('\n').filter(line => line.trim().length > 0);
          items.push(...lines.map((line, index) => ({
            text: line.trim(),
            image_url: mediaUrls[index]?.imageUrl || undefined,
            audio_url: mediaUrls[index]?.audioUrl || undefined,
            display_order: index
          })));
        } else {
          // For passage or story, create a single item
          items.push({
            text: displayText,
            image_url: mediaUrls[0]?.imageUrl || undefined,
            audio_url: mediaUrls[0]?.audioUrl || undefined,
            display_order: 0
          });
        }
        
        try {
          // Save content and items to Supabase
          const { contentId, error } = await saveAIGeneratedContent(
            contentRecord,
            items.map(item => ({ ...item, content_id: '' })) // Temporary content_id, will be set by the database
          );
          
          if (error) {
            console.error('Failed to save content to Supabase:', error);
          } else if (contentId) {
            console.log('Content saved successfully to Supabase with ID:', contentId);
            // Update the newContent with the actual ID from Supabase
            newContent.id = contentId;
            // Store the full content record for reference
            const savedItems = items.map(item => ({
              ...item,
              content_id: contentId
            }));
            const generatedContent: GeneratedContent = {
              ...contentRecord,
              id: contentId,
              items: savedItems,
              content: displayText // Add the content property
            };
            newContent.generatedContent = generatedContent;
          }
        } catch (error) {
          console.error('Error saving content to Supabase:', error);
        }
      } else {
        console.error('No authenticated user found');
      }

      // Add to books collection
      addBook(newContent);

      // Initialize reading progress for the new book
      const currentChild = useUserStore.getState().activeChild;
      if (currentChild) {
        const { updateReadingProgress } = useUserStore.getState();
        await updateReadingProgress(currentChild.id, newContent.id, 0, 1); // Start at page 0 of 1
      }

      // Show success state
      setShowSuccess(true);
      
      // Close modal after a short delay to show success animation
      setTimeout(() => {
        setShowSuccess(false);
        setIsGenerating(false);
        handleClose();
      }, 2000); // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error("Error generating content:", error);
      // Could show error message here
    } finally {
      // Only reset the generating state if not showing success
      if (!success) {
        setIsGenerating(false);
      }
    }
  };
  
  // Inline styles using the current theme
  const modalOverlayStyle = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
  
  const modalContainerStyle = {
    width: '90%' as const,
    maxHeight: '80%' as const,
    backgroundColor: theme.background,
    borderRadius: spacing.md,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  };
  
  const closeButtonStyle = {
    position: 'absolute' as const,
    right: spacing.md,
    top: spacing.md,
    zIndex: 10,
  };
  
  const titleStyle = {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: theme.text,
    marginBottom: spacing.sm,
  };
  
  const subtitleStyle = {
    fontSize: 16,
    color: theme.textLight,
    marginBottom: spacing.lg,
  };
  
  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: theme.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  };
  
  const optionCardStyle = (id: string) => ({
    width: cardWidth,
    backgroundColor: contentType === id ? colors.primaryLight : theme.card,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    borderWidth: 1,
    borderColor: contentType === id ? colors.primary : theme.border,
  });
  
  const optionIconContainerStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.sm,
  };
  
  const optionTitleStyle = {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: theme.text,
    marginVertical: spacing.xs,
    textAlign: 'center' as const,
  };
  
  const optionDescriptionStyle = {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'center' as const,
  };
  
  const inputStyle = {
    backgroundColor: theme.backgroundLight, // Use backgroundLight instead of input
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  };
  
  const generatingContainerStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.xl * 2,
  };
  
  const generatingAnimationContainerStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.lg,
  };
  
  const generatingTextStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: theme.text,
    marginVertical: spacing.sm,
    textAlign: 'center' as const,
  };
  
  const successTextStyle = {
    fontSize: 14,
    color: theme.textLight,
    textAlign: 'center' as const,
  };
  
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={modalOverlayStyle}>
        <Reanimated.View style={[modalContainerStyle, modalAnimatedStyle]}>
          <TouchableOpacity style={closeButtonStyle} onPress={handleClose}>
            <X size={24} color={theme.textLight} />
          </TouchableOpacity>

          {!isGenerating ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View>
                <Text style={titleStyle}>Generate Reading Material</Text>
                <Text style={subtitleStyle}>Choose a content type and enter a topic or title.</Text>
                <Text style={sectionTitleStyle}>1. Select Content Type</Text>
                <View style={styles.optionsContainer}>
                  {contentOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={optionCardStyle(option.id)}
                      onPress={() => setContentType(option.id)}
                    >
                      <View style={optionIconContainerStyle}>{option.icon}</View>
                      <Text style={optionTitleStyle}>{option.title}</Text>
                      <Text style={optionDescriptionStyle}>{option.description}</Text>
                      {contentType === option.id && <View style={styles.selectedIndicator} />}
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={sectionTitleStyle}>2. Enter Topic / Title</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="e.g., Space Adventure, Friendly Dinosaurs"
                  placeholderTextColor={theme.textLight}
                  value={title}
                  onChangeText={setTitle}
                />

                <Button 
                  title="Generate Content"
                  onPress={handleGenerate}
                  disabled={!contentType || !title.trim() || isGenerating}
                  icon={<Sparkles size={18} color="white" />}
                  fullWidth
                  style={{ marginTop: spacing.lg }}
                />
                
                <MascotGuide 
                  message="Choose the type of reading material and give it a fun topic! I'll create something special just for you."
                  type="tip"
                  position="bottom"
                />
              </View>
            </ScrollView>
          ) : (
            <View style={generatingContainerStyle}>{/* Parent View */}
              {!showSuccess ? (
                <Reanimated.View
                  style={[
                    generatingAnimationContainerStyle,
                    spinAnimatedStyle
                  ]}
                >
                  <Sparkles size={48} color={colors.primary} />
                </Reanimated.View>
              ) : (
                <Reanimated.View style={successAnimatedStyle}>
                  <MascotGuide 
                    message="All done! Your new reading material is ready in the library."
                    type="tip" // Changed from 'success' to 'tip' as MascotGuide only accepts 'tip', 'alert', or 'help'
                  />
                </Reanimated.View>
              )}
              <Text style={generatingTextStyle}>{showSuccess ? 'Content Generated!' : 'Generating your content...'}</Text>{showSuccess && <Text style={successTextStyle}>Check your library!</Text>}
            </View>
          )}

           {/* Success Overlay */}
           {showSuccess && (
              <View style={styles.successOverlay}>
                  <Reanimated.View style={[styles.successContent, successAnimatedStyle]}>
                      <CheckCircle size={80} color={colors.success} />
                      <Text style={styles.successText}>Created Successfully!</Text>
                  </Reanimated.View>
              </View>
          )}

        </Reanimated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - (spacing.lg * 2) - (spacing.md * 3)) / 2;

// Keep static styles here
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -3,
    width: 30,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.md,
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.md,
    color: colors.success,
  },
});

export default ContentGeneratorModal;