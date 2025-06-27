import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  MicOff,
  Plus,
  Calendar,
  MapPin,
  Users,
  Shield,
  Wifi,
  WifiOff,
  Globe,
  Languages,
  FileText,
  X,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { useAI } from '@/contexts/AIContext';
import { AIChat } from '@/components/AIChat';

interface QuickAction {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { isInitialized, isLoading } = useAI();
  const [showAIChat, setShowAIChat] = useState(false);
  
  const changeLanguage = (newLang: string) => {
    if (i18n.isInitialized) {
      i18n.changeLanguage(newLang);
    }
  };
  
  // Add safety check for i18n.language
  const currentLanguage = i18n.language || 'es';
  
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [voiceInput, setVoiceInput] = useState('');

  const quickActions: QuickAction[] = [
    {
      id: 'newCase',
      titleKey: 'home.newCase',
      icon: <Plus size={24} color="#FFFFFF" />,
      color: '#003DA5',
      route: '/cases',
    },
    {
      id: 'deadlines',
      titleKey: 'home.checkDeadlines',
      icon: <Calendar size={24} color="#FFFFFF" />,
      color: '#28A745',
      route: '/deadlines',
    },
    {
      id: 'resources',
      titleKey: 'home.findResources',
      icon: <MapPin size={24} color="#FFFFFF" />,
      color: '#FF6B35',
      route: '/resources',
    },
    {
      id: 'practice',
      titleKey: 'home.practiceHearing',
      icon: <Users size={24} color="#FFFFFF" />,
      color: '#6C5CE7',
      route: '/learn',
    },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const handleVoicePress = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        t('voice.turnOnMicrophone'),
        'Voice features require microphone access which is limited on web platform.'
      );
      return;
    }

    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice input processing
      setTimeout(() => {
        setVoiceInput('¿Cómo puedo contestar una demanda?');
        setIsListening(false);
        
        // Simulate AI response
        const response = 'Para contestar una demanda, tienes 3 días hábiles desde que recibiste la notificación. Te ayudo a crear tu contestación paso a paso.';
        Speech.speak(response, { language: 'es' });
      }, 3000);
    }
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.statusIndicators}>
              {isOnline ? (
                <Wifi size={16} color="#28A745" />
              ) : (
                <WifiOff size={16} color="#DC3545" />
              )}
              <Text style={styles.statusText}>
                {isOnline ? t('common.online') : t('common.offline')}
              </Text>
              <Shield size={16} color="#003DA5" style={{ marginLeft: 8 }} />
            </View>
            <TouchableOpacity 
              style={styles.languageToggle}
              onPress={() => {
                const newLang = i18n.language === 'en' ? 'es' : 'en';
                if (i18n.isInitialized) {
                  i18n.changeLanguage(newLang);
                }
              }}
            >
              <Globe size={16} color="#6C757D" />
              <Text style={styles.languageText}>
                {i18n.language?.toUpperCase() || 'EN'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('home.subtitle')}</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>{t('home.disclaimer')}</Text>
        </View>

        {/* Voice Interface */}
        <View style={styles.voiceSection}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoicePress}
          >
            <LinearGradient
              colors={isListening ? ['#FF0000', '#FF6B35'] : ['#003DA5', '#0056D2']}
              style={styles.voiceButtonGradient}
            >
              {isListening ? (
                <MicOff size={32} color="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.voiceText}>
            {isListening ? t('voice.listening') : t('voice.askMinerva')}
          </Text>
          <Text style={styles.voiceHint}>
            {isListening ? t('voice.tapToStop') : t('voice.tapToSpeak')}
          </Text>
          
          {voiceInput && (
            <View style={styles.voiceInputCard}>
              <Text style={styles.voiceInputText}>{voiceInput}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={() => handleQuickAction(action.route)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  {action.icon}
                </View>
                <Text style={styles.quickActionText}>{t(action.titleKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Calendar size={16} color="#003DA5" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Contestación de demanda</Text>
                <Text style={styles.activityDate}>Vence: 15 de Enero, 2025</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <FileText size={16} color="#28A745" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Documento completado</Text>
                <Text style={styles.activityDate}>12 de Enero, 2025</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* AI Chat Modal */}
      <Modal
        visible={showAIChat}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('aiAssistant')}</Text>
            <TouchableOpacity onPress={() => setShowAIChat(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <AIChat placeholder={t('askLegalQuestion')} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Add new styles
const newStyles = StyleSheet.create({
  aiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  aiStatusText: {
    color: '#fff',
    fontSize: 12,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiChatButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '500',
  },
  disabledText: {
    color: '#94a3b8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6C757D',
    fontFamily: 'Inter-Medium',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  languageText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6C757D',
    fontFamily: 'Inter-SemiBold',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    lineHeight: 24,
  },
  disclaimerCard: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#856404',
    lineHeight: 20,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  voiceButton: {
    marginBottom: 12,
  },
  voiceButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  voiceButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  voiceText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  voiceHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
  },
  voiceInputCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: '100%',
  },
  voiceInputText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#212529',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
  },
});