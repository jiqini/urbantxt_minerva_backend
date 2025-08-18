import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../contexts/UserContext';

export default function HomeScreen() {
  const { isLoggedIn, isLoading } = useUser();

  useEffect(() => {
    // Add a small delay to ensure context is ready
    const checkAuth = setTimeout(() => {
      if (!isLoading) {
        if (isLoggedIn) {
          console.log('✅ User authenticated, redirecting to app');
          router.replace('/(tabs)');
        } else {
          console.log('🔐 User not authenticated, redirecting to onboarding');
          router.replace('/start');
        }
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [isLoggedIn, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#174AC9" />
      <Text style={styles.loadingText}>
        {isLoading ? 'Verificando sesión segura...' : 'Iniciando aplicación...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#174AC9',
    textAlign: 'center',
  },
});