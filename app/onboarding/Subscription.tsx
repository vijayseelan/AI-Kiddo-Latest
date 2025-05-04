export const options = { headerShown: false };
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable, 
  Animated, 
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { ArrowLeft, Check, Star } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};
import { useOnboarding } from '../../context/OnboardingContext';

const { width } = Dimensions.get('window');

type SubscriptionPlan = 'monthly' | 'annual';

export default function Subscription() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const childName = onboardingData.childName;
  
  // State for selected plan
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const monthlyScaleAnim = useRef(new Animated.Value(selectedPlan === 'monthly' ? 1 : 0.95)).current;
  const annualScaleAnim = useRef(new Animated.Value(selectedPlan === 'annual' ? 1 : 0.95)).current;
  
  useEffect(() => {
    // Animate content
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
      }),
    ]).start();
  }, []);
  
  // Animate plan selection
  useEffect(() => {
    Animated.parallel([
      Animated.timing(monthlyScaleAnim, {
        toValue: selectedPlan === 'monthly' ? 1 : 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(annualScaleAnim, {
        toValue: selectedPlan === 'annual' ? 1 : 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedPlan]);

  const handleBack = () => {
    router.back(); // Return to previous screen
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };
  
  const handleSubscribe = () => {
    // In a real app, this would process payment and create subscription
    // For now, just navigate to the main app
    router.push('/');
  };
  
  // Calculate savings for annual plan
  const calculateSavings = () => {
    const monthlyTotal = 10 * 12;
    const annualCost = 100;
    const savings = monthlyTotal - annualCost;
    const savingsPercentage = Math.round((savings / monthlyTotal) * 100);
    
    return {
      amount: savings,
      percentage: savingsPercentage
    };
  };
  
  const savings = calculateSavings();

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
                i === 12 ? styles.activeDot : i < 12 ? styles.completedDot : {}
              ]}
            />
          ))}
        </View>
        
        <ScrollView 
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
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Unlock the full Reading Panda experience</Text>
            
            <View style={styles.plansContainer}>
              {/* Monthly Plan */}
              <Animated.View 
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.selectedPlanCard,
                  { transform: [{ scale: monthlyScaleAnim }] }
                ]}
              >
                <Pressable 
                  style={styles.planCardContent}
                  onPress={() => handleSelectPlan('monthly')}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planTitle}>Monthly</Text>
                      <Text style={styles.planPrice}>$10<Text style={styles.planPriceMonth}>/month</Text></Text>
                    </View>
                    <View style={[
                      styles.planCheckCircle,
                      selectedPlan === 'monthly' ? styles.selectedCheckCircle : {}
                    ]}>
                      {selectedPlan === 'monthly' && <Check size={16} color="white" />}
                    </View>
                  </View>
                  
                  <View style={styles.planFeatures}>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Unlimited reading assessments</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>AI-powered feedback</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Personalized reading plan</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Progress tracking</Text>
                    </View>
                  </View>
                  
                  <View style={styles.planFooter}>
                    <Text style={styles.planFooterText}>Billed monthly</Text>
                  </View>
                </Pressable>
              </Animated.View>
              
              {/* Annual Plan */}
              <Animated.View 
                style={[
                  styles.planCard,
                  selectedPlan === 'annual' && styles.selectedPlanCard,
                  { transform: [{ scale: annualScaleAnim }] }
                ]}
              >
                <Pressable 
                  style={styles.planCardContent}
                  onPress={() => handleSelectPlan('annual')}
                >
                  <View style={styles.bestValueBadge}>
                    <Star size={14} color="white" fill="white" />
                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                  </View>
                  
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planTitle}>Annual</Text>
                      <Text style={styles.planPrice}>$100<Text style={styles.planPriceMonth}>/year</Text></Text>
                    </View>
                    <View style={[
                      styles.planCheckCircle,
                      selectedPlan === 'annual' ? styles.selectedCheckCircle : {}
                    ]}>
                      {selectedPlan === 'annual' && <Check size={16} color="white" />}
                    </View>
                  </View>
                  
                  <View style={styles.planFeatures}>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>All monthly plan features</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Save {savings.percentage}% ({savings.amount}$)</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Priority customer support</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={18} color={designColors.blue} />
                      <Text style={styles.featureText}>Early access to new features</Text>
                    </View>
                  </View>
                  
                  <View style={styles.planFooter}>
                    <Text style={styles.planFooterText}>Billed annually</Text>
                  </View>
                </Pressable>
              </Animated.View>
            </View>
            
            <View style={styles.guaranteeContainer}>
              <View style={styles.guaranteeIcon}>
                <Text style={styles.guaranteeIconText}>🔒</Text>
              </View>
              <Text style={styles.guaranteeText}>
                7-day money-back guarantee. Cancel anytime.
              </Text>
            </View>
            
            <View style={styles.mascotContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>
                  I'm excited to help {childName} become a confident reader!
                </Text>
              </View>
              <View style={styles.emojiMascot}>
                <Text style={styles.emojiText}>🐼</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubscribe}
            >
              <Text style={styles.buttonText}>
                Subscribe {selectedPlan === 'monthly' ? 'Monthly' : 'Annually'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              Your subscription will automatically renew. You can cancel anytime.
            </Text>
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
  plansContainer: {
    width: '100%',
    marginBottom: 25,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    marginBottom: 20,
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderColor: designColors.orange,
    borderWidth: 3,
  },
  planCardContent: {
    padding: 25,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: designColors.deepNavy,
    marginBottom: 6,
  },
  planPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: designColors.blue,
  },
  planPriceMonth: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.deepNavy,
  },
  planCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: designColors.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCheckCircle: {
    backgroundColor: designColors.orange,
    borderColor: designColors.orange,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 12,
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  featureText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: designColors.deepNavy,
    marginLeft: 12,
    flex: 1,
  },
  planFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    paddingTop: 15,
    marginTop: 5,
  },
  planFooterText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: designColors.blue,
    textAlign: 'center',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: designColors.sunflower,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  bestValueText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: designColors.deepNavy,
    marginLeft: 5,
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 16,
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  guaranteeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: designColors.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  guaranteeIconText: {
    fontSize: 18,
  },
  guaranteeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: designColors.deepNavy,
    flex: 1,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 18,
    maxWidth: '85%',
    // Claymorphism
    shadowColor: designColors.skyBlue,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  speechText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: designColors.deepNavy,
    textAlign: 'center',
    lineHeight: 22,
  },
  emojiMascot: {
    width: 70,
    height: 70,
    backgroundColor: designColors.skyBlue,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    // Claymorphism
    shadowColor: designColors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  emojiText: {
    fontSize: 36,
  },
  button: {
    backgroundColor: designColors.sunflower,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginTop: 'auto',
    marginBottom: 15,
    // Claymorphism
    shadowColor: designColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: designColors.deepNavy,
    fontSize: 20,
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: designColors.blue,
    textAlign: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
    lineHeight: 18,
  },
});
