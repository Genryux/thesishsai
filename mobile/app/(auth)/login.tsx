import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage(''); // Clear previous error
    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.login(email.trim(), password);
      
      if (data?.token) {
        await SecureStore.setItemAsync('authToken', data.token);
      }
      
      // Navigate to dashboard and pass the userId
      router.replace({ pathname: '/dashboard', params: { userId: data.user.id } });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ThesiSHS</Text>
        <Text style={styles.subtitle}>Sign in to access your research workspace</Text>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mockCredentials}>
          <Text style={styles.mockTitle}>Mock Test Accounts:</Text>
          <Text style={styles.mockText}>• student1@example.com / password123 (Group 3)</Text>
          <Text style={styles.mockText}>• student2@example.com / password123 (Group 4)</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF1F5' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontFamily: 'Manrope_700Bold', marginBottom: 8, color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: 'Manrope_400Regular', color: '#6B7280', textAlign: 'center', marginBottom: 40 },
  formContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: '#111827',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2D60E8',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 16 },
  mockCredentials: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  mockTitle: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: '#3730A3', marginBottom: 8 },
  mockText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: '#4338CA', marginBottom: 4 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    textAlign: 'center'
  }
});
