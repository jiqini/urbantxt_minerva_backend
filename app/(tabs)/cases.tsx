import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Scale, Calendar, Clock, ArrowRight, X, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';

interface CaseOption {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  color: string;
}

interface Case {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'pending' | 'completed';
  deadline: string;
  daysLeft: number;
  description: string;
}

export default function CasesScreen() {
  const { t } = useLanguage();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [caseDescription, setCaseDescription] = useState('');
  const [step, setStep] = useState(1);

  const caseOptions: CaseOption[] = [
    {
      id: 'sued',
      titleKey: 'cases.options.sued',
      icon: <AlertCircle size={20} color="#DC3545" />,
      color: '#DC3545',
    },
    {
      id: 'wantToSue',
      titleKey: 'cases.options.wantToSue',
      icon: <Scale size={20} color="#003DA5" />,
      color: '#003DA5',
    },
    {
      id: 'divorce',
      titleKey: 'cases.options.divorce',
      icon: <Scale size={20} color="#6C5CE7" />,
      color: '#6C5CE7',
    },
    {
      id: 'childSupport',
      titleKey: 'cases.options.childSupport',
      icon: <Scale size={20} color="#28A745" />,
      color: '#28A745',
    },
    {
      id: 'laborDispute',
      titleKey: 'cases.options.laborDispute',
      icon: <Scale size={20} color="#FF6B35" />,
      color: '#FF6B35',
    },
    {
      id: 'propertyDispute',
      titleKey: 'cases.options.propertyDispute',
      icon: <Scale size={20} color="#FFC107" />,
      color: '#FFC107',
    },
    {
      id: 'other',
      titleKey: 'cases.options.other',
      icon: <Scale size={20} color="#6C757D" />,
      color: '#6C757D',
    },
  ];

  const mockCases: Case[] = [
    {
      id: '1',
      title: 'Demanda por Pensión Alimenticia',
      type: 'childSupport',
      status: 'active',
      deadline: '2025-01-20',
      daysLeft: 5,
      description: 'Solicitud de pensión alimenticia para menor de edad',
    },
    {
      id: '2',
      title: 'Contestación de Demanda Laboral',
      type: 'laborDispute',
      status: 'pending',
      deadline: '2025-01-15',
      daysLeft: -2,
      description: 'Respuesta a demanda por despido injustificado',
    },
    {
      id: '3',
      title: 'Divorcio por Mutuo Consentimiento',
      type: 'divorce',
      status: 'completed',
      deadline: '2024-12-30',
      daysLeft: 0,
      description: 'Proceso de divorcio completado exitosamente',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#28A745';
      case 'pending':
        return '#FFC107';
      case 'completed':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock size={16} color="#28A745" />;
      case 'pending':
        return <AlertCircle size={16} color="#FFC107" />;
      case 'completed':
        return <CheckCircle size={16} color="#6C757D" />;
      default:
        return <Clock size={16} color="#6C757D" />;
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
      // Save case logic here
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
            <Text style={styles.wizardTitle}>{t('cases.whatHappened')}</Text>
            <View style={styles.optionsGrid}>
              {caseOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    { borderLeftColor: option.color },
                    selectedCaseType === option.id && styles.optionCardSelected
                  ]}
                  onPress={() => handleCaseTypeSelect(option.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    {option.icon}
                  </View>
                  <Text style={styles.optionText}>{t(option.titleKey)}</Text>
                  <ArrowRight size={16} color="#6C757D" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 2:
        return (
          <View>
            <Text style={styles.wizardTitle}>{t('cases.tellMore')}</Text>
            <TextInput
              style={styles.textArea}
              value={caseDescription}
              onChangeText={setCaseDescription}
              placeholder="Describa los detalles de su caso..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        );
        
      case 3:
        return (
          <View>
            <Text style={styles.wizardTitle}>Resumen del Caso</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tipo de Caso:</Text>
              <Text style={styles.summaryValue}>
                {selectedCaseType && t(`cases.options.${selectedCaseType}`)}
              </Text>
              
              <Text style={styles.summaryLabel}>Descripción:</Text>
              <Text style={styles.summaryValue}>{caseDescription}</Text>
              
              <Text style={styles.summaryLabel}>Próximos Pasos:</Text>
              <Text style={styles.summaryValue}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cases.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowWizard(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockCases.map((caseItem) => (
          <TouchableOpacity key={caseItem.id} style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <View style={styles.caseStatus}>
                {getStatusIcon(caseItem.status)}
                <Text style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}>
                  {t(`cases.${caseItem.status}`)}
                </Text>
              </View>
              {caseItem.daysLeft > 0 && (
                <View style={styles.deadlineBadge}>
                  <Calendar size={12} color="#DC3545" />
                  <Text style={styles.deadlineText}>
                    {caseItem.daysLeft} {t('deadlines.daysLeft')}
                  </Text>
                </View>
              )}
              {caseItem.daysLeft < 0 && (
                <View style={[styles.deadlineBadge, styles.overdueBadge]}>
                  <AlertCircle size={12} color="#FFFFFF" />
                  <Text style={styles.overdueText}>Vencido</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.caseTitle}>{caseItem.title}</Text>
            <Text style={styles.caseDescription}>{caseItem.description}</Text>
            
            <View style={styles.caseFooter}>
              <Text style={styles.deadlineLabel}>
                {t('cases.deadline')}: {new Date(caseItem.deadline).toLocaleDateString('es-ES')}
              </Text>
              <ArrowRight size={16} color="#6C757D" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Case Wizard Modal */}
      <Modal
        visible={showWizard}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('cases.caseWizard')}</Text>
            <TouchableOpacity
              onPress={() => setShowWizard(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6C757D" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderWizardStep()}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>{t('common.back')}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.nextButton}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#212529',
  },
  addButton: {
    backgroundColor: '#003DA5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueBadge: {
    backgroundColor: '#DC3545',
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC3545',
  },
  overdueText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  caseTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  caseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#495057',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#003DA5',
    borderRadius: 2,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  wizardTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginBottom: 20,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: '#003DA5',
    backgroundColor: '#F8F9FF',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
    minHeight: 120,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#495057',
    marginTop: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6C757D',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6C757D',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#003DA5',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});