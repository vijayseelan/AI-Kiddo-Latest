export const options = { headerShown: false };
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image, Animated, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingContainer from '../../components/OnboardingContainer';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../context/OnboardingContext';
import { supabase } from '../../lib/supabase';

// Using colors from OnboardingContainer

export default function Register() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [step, setStep] = useState(1);
  
  // Use local state only - we'll update context only when progressing steps
  const [name, setName] = useState(onboardingData.parentName || '');
  const [email, setEmail] = useState(onboardingData.parentEmail || '');
  const [password, setPassword] = useState(onboardingData.parentPassword || '');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  
  // Only update the parent name in the context when step 1 is completed
  const updateParentName = () => {
    updateOnboardingData({
      parentName: name
    });
  };
  
  // Only update the email in the context when step 2 is completed and validation passed
  const updateParentEmail = () => {
    updateOnboardingData({
      parentEmail: email
    });
  };
  
  // Only update the password in the context when step 3 is completed
  const updateParentPassword = () => {
    updateOnboardingData({
      parentPassword: password
    });
  };

  // Handle email input changes - IMMEDIATELY clear any errors
  const handleEmailChange = (text: string) => {
    // Always clear error when email changes
    setEmailError('');
    setEmail(text.toLowerCase());
  };
  
  // Check if email exists in the onboarding_profiles table
  const checkExistingEmail = async (emailToCheck: string) => {
    try {
      console.log('Checking if email exists in onboarding_profiles:', emailToCheck);
      
      // Check for the email in the onboarding_profiles table
      const { data, error } = await supabase
        .from('onboarding_profiles')
        .select('parent_email')
        .eq('parent_email', emailToCheck)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking onboarding_profiles:', error);
        return false; // Don't block registration on errors
      }
      
      // If we found a match, the email is already registered
      if (data) {
        console.log('Email found in onboarding_profiles:', emailToCheck);
        return true;
      }
      
      // Also check the parents table as a backup
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('email')
        .eq('email', emailToCheck)
        .maybeSingle();
        
      if (parentError) {
        console.error('Error checking parents table:', parentError);
      } else if (parentData) {
        console.log('Email found in parents table:', emailToCheck);
        return true;
      }
      
      // Email not found in either table, so it's available
      console.log('Email not found, available for registration:', emailToCheck);
      return false;
    } catch (error) {
      console.error('Unexpected email check error:', error);
      return false; // On error, assume email is available
    }
  };

  // No need for a second duplicate check function
  
  // Handle log in option from dialog
  const handleGoToLogin = () => {
    setShowDialog(false);
    // Navigate to login page
    router.push('/login');
  };
  
  // Handle try different email option from dialog
  const handleTryDifferentEmail = () => {
    setShowDialog(false);
    setEmailError('');
    setEmail('');
    // Focus on email input would be ideal here
  };
  
  const handleContinue = async () => {
    if (step === 1 && name) {
      // Name step - just update and go to email step
      updateParentName();
      setStep(2);
      
    } else if (step === 2 && email.includes('@')) {
      // Clear previous errors and set loading state
      setEmailError('');
      setIsCheckingEmail(true);
      setShowDialog(false);
      
      try {
        console.log('Starting email validation for:', email);
        
        // Check if email exists
        const exists = await checkExistingEmail(email);
        console.log('Email exists check result:', exists);
        
        if (exists) {
          // Email exists - show dialog and DO NOT continue
          console.log('Email already registered, showing dialog');
          setExistingEmail(email);
          setShowDialog(true);
          // Explicitly set error text as fallback
          setEmailError('This email is already registered');
          // Important: returning early to prevent moving to next step
          return;
        }
        
        // Email is available - update context and continue
        console.log('Email is available, proceeding to password step');
        updateParentEmail();
        setStep(3); // Go to password step
      } catch (error) {
        console.error('Unexpected error in email validation flow:', error);
        // Show error message
        setEmailError('Error checking email. Please try again.');
        // Do NOT proceed on error
        return;
      } finally {
        // Always end loading state
        setIsCheckingEmail(false);
      }
      
    } else if (step === 3 && password.length >= 6) {
      // Password step - update and go to child info
      updateParentPassword();
      router.push({ pathname: '/onboarding/ChildInfo' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back(); // Return to landing page
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            {/* Image removed as requested */}
            <Text style={styles.greeting}>Hi there!</Text>
            <Text style={styles.question}>What's your name?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Type your name here"
              placeholderTextColor="#8a9cb0"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              style={[styles.button, !name && styles.buttonDisabled]}
              disabled={!name}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            {/* Image removed as requested */}
            <Text style={styles.greeting}>Nice to meet you, {name}!</Text>
            <Text style={styles.question}>What's your email address?</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : {}]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="your.email@example.com"
              placeholderTextColor="#8a9cb0"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={handleContinue}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, 
                (!email.includes('@') || isCheckingEmail) && styles.buttonDisabled
              ]}
              disabled={!email.includes('@') || isCheckingEmail}
              onPress={handleContinue}
            >
              {isCheckingEmail ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Next</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            {/* Image removed as requested */}
            <Text style={styles.greeting}>Almost there!</Text>
            <Text style={styles.question}>Create a password to keep your account safe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Choose a password"
                placeholderTextColor="#8a9cb0"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? 'Show' : 'Hide'}</Text>
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 6 && (
              <Text style={styles.passwordHint}>Password should be at least 6 characters</Text>
            )}
            <TouchableOpacity
              style={[styles.button, password.length < 6 && styles.buttonDisabled]}
              disabled={password.length < 6}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingContainer>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color="#023047" />
      </Pressable>
      
      <View style={styles.progressContainer}>
        {Array(13).fill(0).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.progressDot, 
              i === 0 ? styles.activeDot : {}
            ]}
          />
        ))}
      </View>
      
      {/* Email exists dialog */}
      {showDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Email Already Registered</Text>
            <Text style={styles.dialogText}>
              The email <Text style={styles.emailHighlight}>{existingEmail}</Text> is already registered.
              Would you like to log in or use a different email?
            </Text>
            
            <View style={styles.dialogButtonsContainer}>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.dialogButtonPrimary]}
                onPress={handleGoToLogin}
              >
                <Text style={styles.dialogButtonTextPrimary}>Log In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dialogButton, styles.dialogButtonSecondary]}
                onPress={handleTryDifferentEmail}
              >
                <Text style={styles.dialogButtonTextSecondary}>Try Different Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {renderStep()}
      </KeyboardAvoidingView>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  // Background styles removed as they're now in OnboardingContainer
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 5,
    marginBottom: 10,
  },
  // Dialog styles
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 25,
    width: '85%',
    // Claymorphism style
    shadowColor: '#219ebc', // Blue
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  dialogTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#023047', // Deep Navy
    marginBottom: 15,
    textAlign: 'center',
  },
  dialogText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#023047', // Deep Navy
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    fontFamily: 'Poppins-SemiBold',
    color: '#219ebc', // Blue
  },
  dialogButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dialogButton: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
    // Claymorphism
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
  },
  dialogButtonPrimary: {
    backgroundColor: '#ffb703', // Sunflower
    borderColor: '#ffffff',
    shadowColor: '#fb8500', // Orange
  },
  dialogButtonSecondary: {
    backgroundColor: '#ffffff',
    borderColor: '#8ecae6', // Sky Blue
    shadowColor: '#8ecae6', // Sky Blue
  },
  dialogButtonTextPrimary: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#023047', // Deep Navy
  },
  dialogButtonTextSecondary: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#219ebc', // Blue
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8ecae6', // skyBlue
    alignItems: 'center',
    justifyContent: 'center',
    // Claymorphism effect
    shadowColor: '#023047', // deepNavy
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
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
    backgroundColor: '#fb8500', // orange
    width: 14,
    height: 14,
    borderRadius: 7,
    // Enhanced shadow for active dot
    shadowColor: '#fb8500', // orange
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  completedDot: {
    backgroundColor: '#219ebc', // blue
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // mascotImage styles removed as image is no longer used
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#023047', // deepNavy
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#219ebc', // blue
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 18,
    marginBottom: 28,
    borderWidth: 3,
    borderColor: '#8ecae6', // skyBlue
    color: '#023047', // deepNavy
    textAlign: 'center',
    // Claymorphism effect
    shadowColor: '#8ecae6', // skyBlue
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 18,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#8ecae6', // skyBlue
    color: '#023047', // deepNavy
    textAlign: 'center',
    // Claymorphism effect
    shadowColor: '#8ecae6', // skyBlue
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  eyeButton: {
    position: 'absolute',
    right: 18,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  eyeIcon: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#219ebc', // blue
  },
  passwordHint: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#fb8500', // orange
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffb703', // sunflower
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    // Claymorphism effect for button
    shadowColor: '#fb8500', // orange
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 12,
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
    color: '#023047', // deepNavy
    fontSize: 20,
  },
});
