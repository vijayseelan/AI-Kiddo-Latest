import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import Button from "@/components/Button";
import { supabase } from '@/lib/supabase';

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

  // Get device dimensions and safe area insets
  const { height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.yellow, colors.green, colors.blue]}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
        {/* Hero Section with Panda Image - OUTSIDE ScrollView for full-bleed */}
        <LinearGradient
          colors={["#1982c4", "#6a4c93", "#ffca3a"]} // Blue → Purple → Yellow
          style={[styles.heroContainer, { height: height * 0.35 + insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image 
            source={require('@/assets/images/panda-hero-landing.png')}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
            onError={() => console.log('Landing hero image not found. Please add it to assets/images/')}
          />
          {/* Back button in hero section */}
          <TouchableOpacity onPress={navigateBack} style={[styles.backButtonHero, { top: insets.top + spacing.md }]}> 
            <ArrowLeft size={28} color={'#fff'} />
          </TouchableOpacity>
        </LinearGradient>
        {/* Fade transition below hero */}
        <View style={styles.heroBottomFade}>
          <LinearGradient
            colors={["rgba(25,130,196,0)", "#1982c4"]} // Transparent → Blue
            style={styles.fadeGradient}
          />
        </View>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { marginTop: spacing.md, paddingBottom: spacing.md }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to continue your reading journey</Text>
              </View>
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
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
                
                {(error) && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                
                <Button
                  title="Log In"
                  onPress={handleLogin}
                  variant="primary"
                  size="large"
                  style={{ marginTop: spacing.lg }}
                  loading={isLoading}
                  disabled={isLoading}
                  fullWidth
                />
              </View>

              <View style={styles.parentSection}>
                <Text style={styles.parentTitle}>For Parents</Text>
                <Text style={styles.parentText}>
                  This app is designed for children. Parents or guardians should assist with account creation and login.
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed; gradient now used
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroContainer: {
    width: '100%',
    backgroundColor: '#1a237e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    paddingTop: 0,
    marginTop: 0,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroBottomFade: {
    height: 36,
    width: '100%',
    marginTop: -36,
    zIndex: 2,
  },
  fadeGradient: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 3, // Increased bottom padding
    minHeight: '100%', // Ensure minimum height
  },
  backButton: {
    display: 'none', // Remove from scroll area
  },
  backButtonHero: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(25,130,196,0.7)', // Soft blue background for contrast
    borderRadius: 24,
    padding: spacing.sm,
    // top is set inline with insets
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.purple,
    fontFamily: 'Poppins-Medium',
  },
  form: {
    backgroundColor: '#f5f6fa', // very light blue for claymorphism
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: '#1982c4', // blue shadow for claymorphism
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d8e0',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
    shadowColor: '#1982c4',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#d1d8e0',
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#1982c4',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    padding: spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: '#ff595e22', // red tint for error
    padding: spacing.sm,
    borderRadius: 16,
  },
  errorText: {
    color: colors.red,
    marginLeft: spacing.xs,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  loginButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.blue,
    borderRadius: 25,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: spacing.lg,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  footerText: {
    color: colors.textLight,
    marginRight: spacing.xs,
  },
  signupText: {
    color: '#fff',
    fontWeight: "500",
  },
  parentSection: {
    backgroundColor: '#ffca3a22', // yellow tint for info
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#ffca3a',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  parentTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  parentText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});