import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import '@/utils/i18n'; // Just import to initialize
import { AIProvider } from '@/contexts/AIContext';

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initI18n();
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('App setup failed:', error);
        // Hide splash screen even if setup fails
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      }
    };
    
    setupApp();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const theme = {
    colors: {
      primary: '#003DA5',
      secondary: '#FF0000',
      surface: '#FFFFFF',
      background: '#F8F9FA',
      onSurface: '#212529',
      onBackground: '#495057',
    },
  };

  return (
    <AIProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#1e40af" />
      </PaperProvider>
    </AIProvider>
  );
}