import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { apiService, isApiError } from '../../services/api';
import { loginSchema, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../../validations/auth';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';

// Client-side throttle. This is a UX/abuse speed bump only — real rate limiting
// and lockout must be enforced by the backend.
const MAX_ATTEMPTS_BEFORE_LOCK = 5;
const BASE_LOCK_SECONDS = 30;
const MAX_LOCK_SECONDS = 300;

type FieldErrors = { email?: string; password?: string };

const COLORS = {
  background: '#EDF1F5',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  label: '#374151',
  placeholder: '#9CA3AF',
  border: '#C4C9D2',
  borderFocus: '#2D60E8',
  primary: '#2D60E8',
  error: '#DC2626',
  errorSurface: '#FEF2F2',
};

/** Maps any login failure to a safe, user-facing message. */
function getLoginErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    if (err.status === 0) return err.message; // network / timeout / insecure transport
    if (err.status === 429) return 'Too many sign-in attempts. Please wait a moment and try again.';
    if (err.status >= 400 && err.status < 500) {
      // Backend auth messages are intentionally generic (e.g. "Invalid email or password.").
      return err.message && err.message.length <= 160 ? err.message : 'Invalid email or password.';
    }
  }
  return 'Something went wrong. Please try again later.';
}

function isCredentialFailure(err: unknown): boolean {
  return isApiError(err) && (err.status === 400 || err.status === 401 || err.status === 403);
}

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const lockRemaining = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0;
  const isLocked = lockRemaining > 0;

  // Countdown tick while locked out.
  useEffect(() => {
    if (!lockUntil) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockUntil) {
        setLockUntil(null);
        setErrorMessage('');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const registerFailure = () => {
    const attempts = failedAttempts + 1;
    setFailedAttempts(attempts);
    if (attempts >= MAX_ATTEMPTS_BEFORE_LOCK) {
      const tier = attempts - MAX_ATTEMPTS_BEFORE_LOCK; // 0, 1, 2...
      const seconds = Math.min(BASE_LOCK_SECONDS * 2 ** tier, MAX_LOCK_SECONDS);
      const until = Date.now() + seconds * 1000;
      setNow(Date.now());
      setLockUntil(until);
    }
  };

  const handleLogin = async () => {
    if (submittingRef.current || isLocked) return;

    setErrorMessage('');
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    submittingRef.current = true;
    setLoading(true);
    try {
      const { user } = await apiService.login(parsed.data.email, parsed.data.password);

      // Clear credentials from memory before leaving the screen.
      setPassword('');
      setFailedAttempts(0);

      router.replace({ pathname: '/dashboard', params: { userId: String(user.id) } });
    } catch (err) {
      setPassword('');
      setErrorMessage(getLoginErrorMessage(err));
      if (isCredentialFailure(err)) registerFailure();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const inputStyle = (field: 'email' | 'password') => [
    styles.input,
    focusedField === field && styles.inputFocused,
    fieldErrors[field] && styles.inputError,
  ];

  const disabled = loading || isLocked;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Text style={styles.title}>Welcome to ThesiSHS</Text>
        <Text style={styles.subtitle}>Sign in to access your research workspace</Text>

        <View style={styles.formContainer}>
          {errorMessage || isLocked ? (
            <View style={styles.errorBox} accessibilityLiveRegion="polite" accessibilityRole="alert">
              <Text style={styles.errorText}>
                {isLocked
                  ? `Too many failed attempts. Try again in ${lockRemaining}s.`
                  : errorMessage}
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={inputStyle('email')}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
            }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="email"
            textContentType="username"
            importantForAutofill="yes"
            maxLength={EMAIL_MAX_LENGTH}
            editable={!loading}
            accessibilityLabel="Email address"
          />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

          <Text style={[styles.label, styles.labelSpaced]}>Password</Text>
          <View>
            <TextInput
              ref={passwordRef}
              style={[inputStyle('password'), styles.passwordInput]}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: undefined }));
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={handleLogin}
              returnKeyType="go"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="current-password"
              textContentType="password"
              importantForAutofill="yes"
              contextMenuHidden={!showPassword}
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!loading}
              accessibilityLabel="Password"
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              style={styles.eyeButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} color={COLORS.textSecondary} />
              ) : (
                <Eye size={18} color={COLORS.textSecondary} />
              )}
            </Pressable>
          </View>
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, disabled && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={disabled}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ disabled, busy: loading }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontFamily: 'Manrope_700Bold', marginBottom: 8, color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: 'Manrope_400Regular', color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 },
  // Flat card — no shadow / elevation.
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  label: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: COLORS.label, marginBottom: 8 },
  labelSpaced: { marginTop: 20 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: COLORS.text,
  },
  inputFocused: { borderColor: COLORS.borderFocus },
  inputError: { borderColor: COLORS.error },
  passwordInput: { paddingRight: 48 },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldError: { color: COLORS.error, fontFamily: 'Manrope_500Medium', fontSize: 12, marginTop: 6 },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 16 },
  errorBox: {
    backgroundColor: COLORS.errorSurface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});
