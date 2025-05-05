import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Image, ScrollView, StatusBar, Alert } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ChevronLeft, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

// Colors from design.md
const designColors = {
  sunflower: '#ffb703',
  orange: '#fb8500',
  blue: '#219ebc',
  skyBlue: '#8ecae6',
  deepNavy: '#023047'
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login");
      console.error("Login catch block:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateBack = () => {
    router.push('/');  // Always route to landing page
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background Elements: Gradients, Waves, Blur */}
      <View style={styles.gradientBg1} />
      <View style={styles.gradientBg2} />
      <View style={styles.gradientBg3} />
      <View style={styles.gradientBg4} />
      <Svg 
        height={height * 0.4} 
        width={width}
        viewBox={`0 0 ${width} ${height * 0.4}`} 
        style={styles.waveSvgBottom}
      >
        <Path
          d={`M0 ${height * 0.2} Q${width / 4} ${height * 0.1} ${width / 2} ${height * 0.2} T${width} ${height * 0.2} L${width} ${height * 0.4} L0 ${height * 0.4} Z`}
          fill="rgba(255, 255, 255, 0.6)" 
        />
        <Path 
          d={`M0 ${height * 0.25} Q${width / 3} ${height * 0.18} ${width / 1.8} ${height * 0.25} T${width} ${height * 0.22} L${width} ${height * 0.4} L0 ${height * 0.4} Z`}
          fill="rgba(255, 255, 255, 0.8)" 
        />
      </Svg>
      <BlurView intensity={80} tint="light" style={styles.blurOverlay} />

      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.replace('/')} 
        style={[styles.backButton, { top: insets.top + spacing.md }]}
      >
        <ArrowLeft size={28} color={'#fff'} />
      </TouchableOpacity>

      {/* Content Area - Placed above background/blur layers */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView} // Use a style that flexes
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent} // Style for inner content alignment
          keyboardShouldPersistTaps="handled"
        >
          {/* Login Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility} 
                  style={styles.eyeIcon}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textLight} />
                  ) : (
                    <Eye size={20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={isLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
              disabled={isLoading}
            />

            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => router.push('/signup')} style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: designColors.skyBlue, // Base color if visible
    position: 'relative',
    overflow: 'hidden', // Keep overflow hidden for background effects
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 4, // Ensure above background
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to scroll if needed
    justifyContent: 'center', // Center content vertically if it doesn't fill screen
    paddingHorizontal: spacing.lg, // Horizontal padding for form etc.
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: designColors.deepNavy, // Use design color
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    color: colors.red,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Poppins-Regular',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: designColors.deepNavy, // Use design color
    marginBottom: spacing.sm / 2,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly less transparent for readability
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Softer border
    fontFamily: 'Poppins-Regular',
    color: designColors.deepNavy, // Input text color
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Softer border
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly less transparent for readability
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: designColors.deepNavy, // Input text color
  },
  eyeIcon: {
    padding: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
    borderRadius: 10, 
    paddingVertical: spacing.md, 
  },
  loginButtonText: {
    color: designColors.deepNavy, // Use design color
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    color: designColors.blue, // Use design color
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border, // Or designColors.skyBlue?
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    color: colors.textLight, // Or designColors.deepNavy?
    fontFamily: 'Poppins-Regular',
  },
  signUpContainer: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  signUpText: {
    fontSize: 14,
    color: designColors.deepNavy, // Use design color
    fontFamily: 'Poppins-Regular',
  },
  signUpLink: {
    color: designColors.orange, // Use design color
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  gradientBg1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.sunflower, // Example color
    opacity: 0.6,
    zIndex: 1, // Ensure behind content
  },
  gradientBg2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.orange, // Example color
    opacity: 0.6,
    transform: [{ rotate: '30deg' }, { scale: 1.5 }],
    zIndex: 1, // Ensure behind content
  },
  gradientBg3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.blue, // Example color
    opacity: 0.5,
    transform: [{ rotate: '-30deg' }, { scale: 1.7 }, {translateX: 50}],
    zIndex: 1, // Ensure behind content
  },
  gradientBg4: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designColors.skyBlue, // Example color
    opacity: 0.4,
    transform: [{ rotate: '60deg' }, { scale: 1.4 }, {translateY: -100}],
    zIndex: 1, // Ensure behind content
  },
  waveSvgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 2, // Above gradients
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3, // Above waves, below content & back button
  },
  backButton: { // Style for the back button
    position: 'absolute',
    left: spacing.md,
    zIndex: 10, // Keep high zIndex
    padding: spacing.xs, // Add padding for easier tapping
  },
});