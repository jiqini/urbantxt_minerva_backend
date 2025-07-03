import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Scale, Calendar, Clock, ArrowRight, X, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Sparkles, FileText, Users, Briefcase, Chrome as Home, Gavel } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CaseOption {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  color: string;
  gradient: string[];
}

interface Case {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'pending' | 'completed' | 'urgent';
  deadline: string;
  daysLeft: number;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
}

export default function CasesScreen() {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [caseDescription, setCaseDescription] = useState('');
  const [step, setStep] = useState(1);

  const caseOptions: CaseOption[] = [
    {
      id: 'sued',
      titleKey: 'cases.options.sued',
      icon: <AlertCircle size={24} color="#ffffff" />,
      color: '#DC3545',
      gradient: ['#DC3545', '#C82333'],
    },
    {
      id: 'wantToSue',
      titleKey: 'cases.options.wantToSue',
      icon: <Scale size={24} color="#ffffff" />,
      color: '#003DA5',
      gradient: ['#003DA5', '#0056b3'],
    },
    {
      id: 'divorce',
      titleKey: 'cases.options.divorce',
      icon: <Users size={24} color="#ffffff" />,
      color: '#6C5CE7',
      gradient: ['#6C5CE7', '#5A4FCF'],
    },
    {
      id: 'childSupport',
      titleKey: 'cases.options.childSupport',
      icon: <Users size={24} color="#ffffff" />,
      color: '#28A745',
      gradient: ['#28A745', '#218838'],
    },
    {
      id: 'laborDispute',
      titleKey: 'cases.options.laborDispute',
      icon: <Briefcase size={24} color="#ffffff" />,
      color: '#FF6B35',
      gradient: ['#FF6B35', '#E55A2B'],
    },
    {
      id: 'propertyDispute',
      titleKey: 'cases.options.propertyDispute',
      icon: <Home size={24} color="#ffffff" />,
      color: '#FFC107',
      gradient: ['#FFC107', '#E0A800'],
    },
    {
      id: 'other',
      titleKey: 'cases.options.other',
      icon: <Gavel size={24} color="#ffffff" />,
      color: '#6C757D',
      gradient: ['#6C757D', '#5A6268'],
    },
  ];

  const mockCases: Case[] = [
    {
      id: '1',
      title: 'Demanda por Pensión Alimenticia',
      type: 'childSupport',
      status: 'urgent',
      deadline: '2025-01-20',
      daysLeft: 5,
      description: 'Solicitud de pensión alimenticia para menor de edad',
      priority: 'urgent',
      progress: 75,
    },
    {
      id: '2',
      title: 'Contestación de Demanda Laboral',
      type: 'laborDispute',
      status: 'active',
      deadline: '2025-01-15',
      daysLeft: -2,
      description: 'Respuesta a demanda por despido injustificado',
      priority: 'high',
      progress: 45,
    },
    {
      id: '3',
      title: 'Divorcio por Mutuo Consentimiento',
      type: 'divorce',
      status: 'completed',
      deadline: '2024-12-30',
      daysLeft: 0,
      description: 'Proceso de divorcio completado exitosamente',
      priority: 'medium',
      progress: 100,
    },
    {
      id: '4',
      title: 'Disputa de Propiedad',
      type: 'propertyDispute',
      status: 'pending',
      deadline: '2025-02-15',
      daysLeft: 30,
      description: 'Conflicto sobre límites de propiedad',
      priority: 'medium',
      progress: 20,
    },
  ];

  const getStatusColor = (status: string, priority: string) => {
    if (priority === 'urgent') return '#DC3545';
    switch (status) {
      case 'active':
        return colors.info;
      case 'pending':
        return colors.warning;
      case 'completed':
        return colors.success;
      case 'urgent':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string, priority: string) => {
    if (priority === 'urgent') return AlertCircle;
    switch (status) {
      case 'active':
        return Clock;
      case 'pending':
        return AlertCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const handleCaseTypeSelect = (typeId: string) => {
    setSelectedCaseType(typeId);
    setStep(2);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowWizard(false);
      setStep(1);
      setSelectedCaseType(null);
      setCaseDescription('');
    }
  };

  const renderWizardStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={[styles.wizardTitle, { color: colors.text }]}>
              {t('cases.whatHappened')}
            </Text>
            <View style={styles.optionsGrid}>
              {caseOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedCaseType === option.id && { borderColor: option.color, borderWidth: 2 }
                  ]}
                  onPress={() => handleCaseTypeSelect(option.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={option.gradient}
                    style={styles.optionIcon}
                  >
                    {option.icon}
                  </LinearGradient>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t(option.titleKey)}
                  </Text>
                  <ArrowRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 2:
        return (
          <View>
            <Text style={[styles.wizardTitle, { color: colors.text }]}>
              {t('cases.tellMore')}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={caseDescription}
              onChangeText={setCaseDescription}
              placeholder="Describa los detalles de su caso..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        );
        
      case 3:
        return (
          <View>
            <Text style={[styles.wizardTitle, { color: colors.text }]}>
              Resumen del Caso
            </Text>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Tipo de Caso:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {selectedCaseType && t(`cases.options.${selectedCaseType}`)}
              </Text>
              
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Descripción:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {caseDescription}
              </Text>
              
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Próximos Pasos:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                1. Revisar documentos necesarios{'\n'}
                2. Completar formularios requeridos{'\n'}
                3. Establecer fechas límite importantes
              </Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    caseCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Scale size={32} color={colors.primary} />
            <Sparkles size={16} color={colors.secondary} style={styles.sparkle} />
          </View>
          <Text style={dynamicStyles.headerTitle}>{t('cases.title')}</Text>
        </View>
        <TouchableOpacity
          style={dynamicStyles.addButton}
          onPress={() => setShowWizard(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {mockCases.map((caseItem) => {
          const StatusIcon = getStatusIcon(caseItem.status, caseItem.priority);
          const statusColor = getStatusColor(caseItem.status, caseItem.priority);
          
          return (
            <TouchableOpacity key={caseItem.id} style={dynamicStyles.caseCard} activeOpacity={0.8}>
              <View style={styles.caseHeader}>
                <View style={styles.caseStatus}>
                  <StatusIcon size={16} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {t(`cases.${caseItem.status}`)}
                  </Text>
                </View>
                {caseItem.daysLeft > 0 && (
                  <View style={[styles.deadlineBadge, { backgroundColor: colors.error + '20' }]}>
                    <Calendar size={12} color={colors.error} />
                    <Text style={[styles.deadlineText, { color: colors.error }]}>
                      {caseItem.daysLeft} {t('deadlines.daysLeft')}
                    </Text>
                  </View>
                )}
                {caseItem.daysLeft < 0 && (
                  <View style={[styles.deadlineBadge, { backgroundColor: colors.error }]}>
                    <AlertCircle size={12} color="#FFFFFF" />
                    <Text style={styles.overdueText}>Vencido</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.caseTitle, { color: colors.text }]}>
                {caseItem.title}
              </Text>
              <Text style={[styles.caseDescription, { color: colors.textSecondary }]}>
                {caseItem.description}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    Progreso
                  </Text>
                  <Text style={[styles.progressPercentage, { color: colors.text }]}>
                    {caseItem.progress}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: statusColor,
                        width: `${caseItem.progress}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.caseFooter}>
                <Text style={[styles.deadlineLabel, { color: colors.textSecondary }]}>
                  {t('cases.deadline')}: {new Date(caseItem.deadline).toLocaleDateString('es-ES')}
                </Text>
                <ArrowRight size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Case Wizard Modal */}
      <Modal
        visible={showWizard}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('cases.caseWizard')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowWizard(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${(step / 3) * 100}%` 
              }
            ]} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderWizardStep()}
          </ScrollView>
          
          <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.backButton, { borderColor: colors.border }]}
                onPress={() => setStep(step - 1)}
              >
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
                  {t('common.back')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              disabled={step === 1 && !selectedCaseType}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? t('common.finish') : t('common.next')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  overdueText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  caseTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  caseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  wizardTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 120,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});