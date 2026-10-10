import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const segments = useSegments();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    async function checkAuth() {
      const token = await SecureStore.getItemAsync('authToken');
      const inAuthGroup = segments[0] === '(auth)';
      const isIndex = (segments as string[]).length === 0;

      if (!token && !inAuthGroup) {
        // If they have no token and aren't in the auth screens, kick them to login
        router.replace('/(auth)/login');
      } else if (token && (inAuthGroup || isIndex)) {
        // If they have a token and try to go to login or the splash screen, kick them to dashboard
        router.replace('/(app)/dashboard');
      }
      setIsAuthChecking(false);
    }
    
    // We only want to run the auth check once the fonts are loaded
    if (loaded) {
      checkAuth();
    }
  }, [loaded, segments]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {!isAuthChecking && <Slot />}
    </QueryClientProvider>
  );
}
