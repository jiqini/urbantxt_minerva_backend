import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Fingerprint, Scale } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const { language, toggleLanguage, t } = useLanguage();
  const { isBiometricEnabled, enableBiometric, authenticate } = useAuth();

  const handleStart = async () => {
    const success = await authenticate();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.languageToggle}>
          <Text style={styles.languageText}>ES</Text>
          <Switch
            value={language === 'en'}
            onValueChange={toggleLanguage}
            trackColor={{ false: '#64748b', true: '#f59e0b' }}
            thumbColor="#ffffff"
          />
          <Text style={styles.languageText}>EN</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Scale size={60} color="#f59e0b" strokeWidth={1.5} />
          </View>
          <Text style={styles.logoText}>MINERVA</Text>
          <Text style={styles.logoSubtext}>Legal Assistant</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Shield size={24} color="#10b981" />
              <Text style={styles.featureText}>Información Legal Confiable</Text>
            </View>
            <View style={styles.feature}>
              <Fingerprint size={24} color="#10b981" />
              <Text style={styles.featureText}>Seguridad Avanzada</Text>
            </View>
          </View>
        </View>

        <View style={styles.biometricContainer}>
          <Fingerprint size={24} color="#f59e0b" />
          <Text style={styles.biometricText}>{t('auth.biometric')}</Text>
          <Switch
            value={isBiometricEnabled}
            onValueChange={enableBiometric}
            trackColor={{ false: '#64748b', true: '#f59e0b' }}
            thumbColor="#ffffff"
          />
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>{t('auth.start')}</Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{t('auth.disclaimer')}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 16,
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  biometricText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  disclaimer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disclaimerText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});