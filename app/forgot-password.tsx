import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const { width, height } = Dimensions.get('window');

export const unstable_settings = { initialRouteName: 'forgot-password' };

export const screenOptions = {
  headerShown: false,
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app-url.com/reset-password', // Update this to your actual reset URL
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background Image */}
      <Image
        source={require('@/assets/images/forgotpassword_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formGlassContainer}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {message && <Text style={styles.successText}>{message}</Text>}
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send Reset Link'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace('/login')}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
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
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height + 100,
    zIndex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 2,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    minHeight: height * 0.85,
  },
  formGlassContainer: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 32,
    marginTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(157, 139, 237, 0.08)', // subtle purple border
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#023047',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#219ebc',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: 'Poppins-Regular',
    color: '#023047',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: '#9d8bed',
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  errorText: {
    color: colors.red,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Poppins-Regular',
  },
  successText: {
    color: '#78d9ad',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'Poppins-Regular',
  },
  backToLogin: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  backToLoginText: {
    color: '#219ebc',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});
