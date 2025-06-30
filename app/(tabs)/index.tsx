import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Wand as Wand2, Scale, FileCheck, Users, Info, ArrowRight, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WizardScreen() {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: 'sued',
      title: t('wizard.option1'),
      icon: Scale,
      color: '#ef4444',
      description: 'Te ayudo a responder una demanda paso a paso',
      gradient: ['#fef2f2', '#fee2e2']
    },
    {
      id: 'sue',
      title: t('wizard.option2'),
      icon: FileCheck,
      color: '#f59e0b',
      description: 'Te guío para iniciar un proceso legal correctamente',
      gradient: ['#fffbeb', '#fef3c7']
    },
    {
      id: 'hearing',
      title: t('wizard.option3'),
      icon: Users,
      color: '#8b5cf6',
      description: 'Te preparo para tu audiencia con simulaciones',
      gradient: ['#faf5ff', '#f3e8ff']
    },
    {
      id: 'info',
      title: t('wizard.option4'),
      icon: Info,
      color: '#10b981',
      description: 'Explico procedimientos legales en términos simples',
      gradient: ['#f0fdf4', '#dcfce7']
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedOption) {
      router.push({
        pathname: '/wizard-flow',
        params: { type: selectedOption }
      });
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Wand2 size={48} color="#f59e0b" strokeWidth={1.5} />
              <Sparkles size={24} color="#fbbf24" style={styles.sparkle} />
            </View>
            <Text style={styles.title}>{t('wizard.title')}</Text>
            <Text style={styles.subtitle}>{t('wizard.subtitle')}</Text>
          </View>
          
          <Image
            source={{ uri: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>{t('wizard.question1')}</Text>
          
          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedOption === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.selectedCard
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isSelected ? ['#ffffff', '#f8fafc'] : option.gradient}
                    style={styles.cardGradient}
                  >
                    <View style={styles.optionHeader}>
                      <View style={[styles.iconBackground, { backgroundColor: option.color }]}>
                        <IconComponent size={28} color="#ffffff" strokeWidth={2} />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionTitle, isSelected && styles.selectedTitle]}>
                          {option.title}
                        </Text>
                        <Text style={[styles.optionDescription, isSelected && styles.selectedDescription]}>
                          {option.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <ArrowRight size={20} color="#f59e0b" />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedOption && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.buttonGradient}
              >
                <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
                <ArrowRight size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  question: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedCard: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.3,
  },
  cardGradient: {
    padding: 24,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedTitle: {
    color: '#0f172a',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  selectedDescription: {
    color: '#475569',
  },
  selectedIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});