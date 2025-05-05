export const options = { headerShown: false };
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
// Using colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import { useOnboarding } from '../../context/OnboardingContext';

// Define the avatar item type
type AvatarItem = {
  id: string;
  source: any; // Using 'any' for image source is common in React Native
  name: string;
};

// Avatar options - in a real app, these would be actual avatar images
const avatarOptions: AvatarItem[] = [
  { id: 'panda1', source: require('../../assets/images/panda-hero.png'), name: 'Happy Panda' },
  { id: 'panda2', source: require('../../assets/images/panda-hero.png'), name: 'Cool Panda' },
  { id: 'panda3', source: require('../../assets/images/panda-hero.png'), name: 'Smart Panda' },
  { id: 'panda4', source: require('../../assets/images/panda-hero.png'), name: 'Silly Panda' },
  { id: 'panda5', source: require('../../assets/images/panda-hero.png'), name: 'Sleepy Panda' },
  { id: 'panda6', source: require('../../assets/images/panda-hero.png'), name: 'Hungry Panda' },
];

export default function Avatar() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  
  const [selectedAvatar, setSelectedAvatar] = useState(onboardingData.selectedAvatar);
  
  // Update context when avatar selection changes
  useEffect(() => {
    if (selectedAvatar) {
      updateOnboardingData({ selectedAvatar });
    }
  }, [selectedAvatar]);

  const handleBack = () => {
    router.back(); // Return to ChildInfo screen
  };

  const handleContinue = () => {
    if (selectedAvatar) {
      // Navigate to next onboarding screen (Reading Level)
      router.push('/onboarding/ReadingLevel');
    }
  };

  const renderAvatarItem = ({ item }: { item: AvatarItem }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        selectedAvatar === item.id && styles.selectedAvatarItem
      ]}
      onPress={() => setSelectedAvatar(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarImageContainer}>
        <Image 
          source={item.source} 
          style={styles.avatarImage} 
          resizeMode="contain"
        />
      </View>
      <Text style={styles.avatarName}>{item.name}</Text>
      
      {selectedAvatar === item.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={designColors.deepNavy} />
      </Pressable>
      
      <View style={styles.progressContainer}>
        {Array(13).fill(0).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.progressDot, 
              i === 2 ? styles.activeDot : i < 2 ? styles.completedDot : {}
            ]}
          />
        ))}
      </View>
      
      <View style={styles.container}>
        
        <View style={styles.contentContainer}>
          <Text style={styles.greeting}>Choose an avatar for {onboardingData.childName}</Text>
          <Text style={styles.question}>This will be their reading buddy</Text>
          
          <FlatList
            data={avatarOptions}
            renderItem={renderAvatarItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.avatarGrid}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity
            style={[styles.button, !selectedAvatar && styles.buttonDisabled]}
            disabled={!selectedAvatar}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    // Claymorphism effect
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e6ed',
    margin: 4,
    // Claymorphism effect for dots
    shadowColor: '#a0a0a0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDot: {
    backgroundColor: designColors.orange,
    width: 14,
    height: 14,
    borderRadius: 7,
    // Enhanced shadow for active dot
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  completedDot: {
    backgroundColor: designColors.blue,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: designColors.deepNavy,
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: designColors.blue,
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarGrid: {
    paddingBottom: 20,
  },
  avatarItem: {
    width: 150,
    margin: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedAvatarItem: {
    borderWidth: 3,
    borderColor: designColors.blue,
    shadowColor: designColors.blue,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: designColors.skyBlue + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    // Claymorphism effect
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: 90,
    height: 90,
  },
  avatarName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: designColors.deepNavy,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: designColors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    // Claymorphism effect
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  checkmarkText: {
    color: designColors.deepNavy,
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    // Claymorphism effect for button
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 12,
    width: '80%',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0.1,
    borderColor: '#f0f0f0',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
});
