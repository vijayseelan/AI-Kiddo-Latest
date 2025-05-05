import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from 'expo-linear-gradient';
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
  withRepeat,
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabase';
import { saveAIGeneratedContent, AIGeneratedContent, AIContentItem, ContentType as DBContentType, ReadingLevel, getActiveChild, Child as DatabaseChild } from '@/services/database';
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
  const { user: authUser } = useAuth(); // Get authenticated user from useAuth
  const { parent, user, activeChild } = useUserStore();
  
  // Content generation state
  const [contentType, setContentType] = useState<ServiceContentType | null>(null);
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dbActiveChild, setDbActiveChild] = useState<DatabaseChild | null>(null);
  
  // Reanimated shared values for smoother animations
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalTranslateY = useSharedValue(50);
  
  // Shared values for pulsing dots animation
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);
  const dot1Opacity = useSharedValue(0.7);
  const dot2Opacity = useSharedValue(0.7);
  const dot3Opacity = useSharedValue(0.7);
  const textOpacity = useSharedValue(0.7);

  // Legacy Animation refs (will keep for compatibility)
  const spinValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  
  // Reanimated shared values for generating animation
  const reanimatedScale = useSharedValue(1);
  const reanimatedSuccessScale = useSharedValue(0);
  
  // Reading level based on active child's profile (or default to beginner)
  // Prioritize database-fetched child for more reliability
  const readingLevel = dbActiveChild?.reading_level || activeChild?.readingLevel || "beginner";
  
  // Generated content references
  const [generatedText, setGeneratedText] = useState<string | undefined>(undefined);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | undefined>(undefined);
  
  // Store temporary values during generation
  let tempImageUrl: string | undefined = undefined;
  let tempAudioUrl: string | undefined = undefined;
  
  // Store temporary content items
  const [contentItems, setContentItems] = useState<Omit<AIContentItem, 'content_id'>[]>([]);
  
  // Fetch active child directly from database - EXACT same pattern as Home page
  useEffect(() => {
    if (authUser?.id) {
      console.log('[CHILD_ID_DEBUG] Fetching active child using authUser.id:', authUser.id);
      getActiveChild(authUser.id).then(dbChild => {
        console.log('[CHILD_ID_DEBUG] Raw dbChild returned from getActiveChild:', JSON.stringify(dbChild, null, 2));
        if (dbChild) {
          // Log the actual ID from the database child for debugging
          console.log('[CHILD_ID_DEBUG] dbChild.id from getActiveChild:', dbChild.id);
          console.log('[CHILD_ID_DEBUG] dbChild.name from getActiveChild:', dbChild.name);
          console.log('[CHILD_ID_DEBUG] dbChild object properties:', Object.keys(dbChild));
          
          // Convert database Child type to app Child type (exactly like Home page)
          const appChild: DatabaseChild = {
            id: dbChild.id,
            name: dbChild.name,
            age: dbChild.age,
            avatar: dbChild.avatar || '',
            parent_id: dbChild.parent_id,
            reading_level: dbChild.reading_level,
            is_active: dbChild.is_active,
            created_at: dbChild.created_at,
            totalBooksRead: dbChild.totalBooksRead,
            totalMinutesRead: dbChild.totalMinutesRead,
            streakDays: dbChild.streakDays,
            pronunciationAccuracy: dbChild.pronunciationAccuracy,
            readingProgress: dbChild.readingProgress,
            badges: dbChild.badges || []
          };
          console.log('[CHILD_ID_DEBUG] appChild.id after conversion:', appChild.id);
          console.log('[CHILD_ID_DEBUG] Fetched active child from database:', appChild.name);
          setDbActiveChild(appChild);
        } else {
          console.log('[CHILD_ID_DEBUG] getActiveChild returned null or undefined');
          setDbActiveChild(null);
        }
      }).catch(error => {
        console.error('[CHILD_ID_DEBUG] Error in getActiveChild:', error);
      });
    } else {
      console.log('[CHILD_ID_DEBUG] authUser.id is null or undefined');
    }
  }, [authUser?.id, visible]);

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
    setDbActiveChild(null);
    onClose();
  };
  
  // Start animations when generating - using Reanimated
  useEffect(() => {
    if (isGenerating && !showSuccess) {
      // Legacy animations for compatibility
      Animated.timing(successScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      // Reanimated animations
      const pulse = (dotScale: typeof dot1Scale) => {
        dotScale.value = withSequence(
          withTiming(0.5, { duration: 300, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
          withTiming(1, { duration: 300, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
        );
      };

      // Start pulsing animation loop with delays - more dynamic
      dot1Scale.value = withRepeat(withDelay(0, withSequence(withTiming(0.6, { duration: 400 }), withTiming(1.1, { duration: 400 }))), -1, true);
      dot2Scale.value = withRepeat(withDelay(150, withSequence(withTiming(0.6, { duration: 400 }), withTiming(1.1, { duration: 400 }))), -1, true);
      dot3Scale.value = withRepeat(withDelay(300, withSequence(withTiming(0.6, { duration: 400 }), withTiming(1.1, { duration: 400 }))), -1, true);
      
      // Add opacity pulsing for more visual interest
      dot1Opacity.value = withRepeat(withDelay(0, withSequence(withTiming(1, { duration: 400 }), withTiming(0.6, { duration: 400 }))), -1, true);
      dot2Opacity.value = withRepeat(withDelay(150, withSequence(withTiming(1, { duration: 400 }), withTiming(0.6, { duration: 400 }))), -1, true);
      dot3Opacity.value = withRepeat(withDelay(300, withSequence(withTiming(1, { duration: 400 }), withTiming(0.6, { duration: 400 }))), -1, true);
      
      // Subtle text opacity animation
      textOpacity.value = withRepeat(withSequence(withTiming(1, { duration: 800 }), withTiming(0.7, { duration: 800 })), -1, true);

      // Keep the overall scale animation if desired, or remove if not needed
      reanimatedScale.value = withSpring(1.0, { damping: 15, stiffness: 150 }); // Adjusted target scale to 1.0 as 1.1 might be too much

    } else {
      // Stop legacy animations
      spinValue.stopAnimation();

      // Reset reanimated values
      dot1Scale.value = 1; // Reset dot scales
      dot2Scale.value = 1;
      dot3Scale.value = 1;
      dot1Opacity.value = 0.7; // Reset dot opacities
      dot2Opacity.value = 0.7;
      dot3Opacity.value = 0.7;
      textOpacity.value = 0.7; // Reset text opacity
      reanimatedScale.value = 1;
    }
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
      transform: [{ scale: modalScale.value }, { translateY: modalTranslateY.value }],
    };
  });

  // Overall animated style for generating/success content (scale)
  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reanimatedScale.value }],
  }));

  // Animated styles for pulsing dots (defined unconditionally)
  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
    opacity: dot1Opacity.value,
  }));
  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
    opacity: dot2Opacity.value,
  }));
  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
    opacity: dot3Opacity.value,
  }));
  
  // Animated style for the generating text
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Animated style for the success checkmark/mascot
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
      
      // Use ONLY the database-fetched child ID - exactly like how Home page does it
      const childId = dbActiveChild?.id;
      console.log('[CHILD_ID_DEBUG] childId being used for saving:', childId);
      console.log('[CHILD_ID_DEBUG] dbActiveChild object:', dbActiveChild ? JSON.stringify(dbActiveChild, null, 2) : 'null');
      // Also check what's in the userStore activeChild for comparison
      console.log('[CHILD_ID_DEBUG] userStore activeChild id:', activeChild?.id);
      
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
          console.log('[CHILD_ID_DEBUG] Final contentRecord being sent to saveAIGeneratedContent:', 
            JSON.stringify(contentRecord, null, 2));
          console.log('[CHILD_ID_DEBUG] contentRecord.child_id:', contentRecord.child_id);
          
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
  
  // Use different styles for the modal container based on whether content is generating
  const modalContainerStyle = {
    width: '90%' as const,
    maxHeight: '80%' as const,
    backgroundColor: 'transparent', // Make transparent to show gradient
    borderRadius: spacing.md,
    overflow: 'hidden' as const,
    ...Platform.select({
      ios: {
        shadowColor: isGenerating ? 'transparent' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isGenerating ? 0 : 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: isGenerating ? 0 : 5,
      },
    }),
  };
  
  // Gradient colors based on the app's design palette - fixed as tuple for TypeScript
  const gradientColors = isGenerating 
    ? ['transparent', 'transparent'] as const
    : isDarkMode 
      ? ['#023047', '#219ebc', '#8ecae6'] as const // Deep Navy to Blue to Sky Blue for dark mode
      : ['#8ecae6', '#219ebc', '#ffb703'] as const; // Sky Blue to Blue to Sunflower for light mode
  
  const closeButtonStyle = {
    position: 'absolute' as const,
    right: spacing.md,
    top: spacing.md,
    zIndex: 10,
    opacity: isGenerating ? 0 : 1,
    pointerEvents: isGenerating ? 'none' as const : 'auto' as const,
  };
  
  const titleStyle = {
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: 'Poppins-Bold',
    color: theme.text,
    marginBottom: spacing.sm,
  };
  
  const subtitleStyle = {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: theme.textLight,
    marginBottom: spacing.lg,
  };
  
  const sectionTitleStyle = {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: theme.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  };
  
  const optionCardStyle = (id: string) => ({
    width: cardWidth,
    backgroundColor: contentType === id ? 'rgba(240, 248, 255, 0.9)' : 'rgba(255, 255, 255, 0.85)', // Semi-transparent background
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    borderWidth: 1,
    borderColor: contentType === id ? '#219ebc' : 'rgba(255, 255, 255, 0.2)', // Blue border when selected
    // Add claymorphism-inspired shadow
    ...Platform.select({
      ios: {
        shadowColor: contentType === id ? '#219ebc' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: contentType === id ? 0.3 : 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: contentType === id ? 3 : 1,
      },
    }),
  });
  
  const optionIconContainerStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f2ff', // Light blue background for icons
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.md,
    // Add subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#219ebc',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  };
  
  const optionTitleStyle = {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: theme.text,
    marginTop: spacing.sm,
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
  
  // Simplified loading container without a box
  const generatingContainerStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.xl * 2,
    flex: 1,
    backgroundColor: 'transparent',
  };
  
  const generatingTextStyle = {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: theme.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  };
  
  const successTextStyle = {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
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
          {!isGenerating && (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
              locations={[0, 0.6, 0.95]}
            />
          )}
          {!isGenerating && (
            <TouchableOpacity style={closeButtonStyle} onPress={handleClose}>
              <X size={24} color={theme.textLight} />
            </TouchableOpacity>
          )}

          {/* Conditionally render either the form or the loading animation */}
          {!isGenerating ? (
            <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}>
              <View>
                <Text style={titleStyle}>Hi {dbActiveChild?.name || activeChild?.name || 'there'}, let's create some magic!</Text>
                <Text style={subtitleStyle}>Pick a reading adventure and tell me what it's about.</Text>
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
            <View style={generatingContainerStyle}>
              {!showSuccess ? (
                /* Pulsing Dots Animation - no container box */
                <>
                  <View style={styles.dotsContainer}>
                    <Reanimated.View style={[styles.dot, styles.dot1, dot1AnimatedStyle]} />
                    <Reanimated.View style={[styles.dot, styles.dot2, dot2AnimatedStyle]} />
                    <Reanimated.View style={[styles.dot, styles.dot3, dot3AnimatedStyle]} />
                  </View>
                </>
              ) : (
                <Reanimated.View style={successAnimatedStyle}>
                  <MascotGuide 
                    message="All done! Your new reading material is ready in the library."
                    type="tip" // Changed from 'success' to 'tip' as MascotGuide only accepts 'tip', 'alert', or 'help'
                  />
                </Reanimated.View>
              )}
              <Reanimated.Text style={[generatingTextStyle, !showSuccess && textAnimatedStyle]}>
                {showSuccess ? 'Content Generated!' : 'Generating your content...'}
              </Reanimated.Text>
              {showSuccess && <Text style={successTextStyle}>Check your library!</Text>}
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
    flexGrow: 1, // Ensure scroll view takes height
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: spacing.md, // Match the container's border radius
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#219ebc', // Blue from the design palette
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
  // Styles for Pulsing Dots - claymorphism inspired with brand colors
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginBottom: spacing.lg,
  },
  // Base dot style
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: spacing.md,
    // Claymorphism-inspired soft shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  // Dot color variations based on design palette
  dot1: {
    backgroundColor: '#ffb703', // Sunflower
    shadowColor: '#ffb703',
  },
  dot2: {
    backgroundColor: '#fb8500', // Orange
    shadowColor: '#fb8500',
  },
  dot3: {
    backgroundColor: '#219ebc', // Blue
    shadowColor: '#219ebc',
  },
});

export default ContentGeneratorModal;