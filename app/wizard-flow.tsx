import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, CircleCheck as CheckCircle, CircleAlert as AlertCircle, FileText, Calendar } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/aiService';

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function WizardFlowScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});

  const getStepsForType = (flowType: string): Step[] => {
    switch (flowType) {
      case 'sued':
        return [
          { id: 'info', title: 'Información del caso', description: 'Recopilemos los datos básicos', completed: false },
          { id: 'deadline', title: 'Calcular plazos', description: 'Determinemos las fechas importantes', completed: false },
          { id: 'response', title: 'Preparar respuesta', description: 'Generemos tu contestación', completed: false },
          { id: 'next-steps', title: 'Próximos pasos', description: 'Plan de acción personalizado', completed: false }
        ];
      case 'sue':
        return [
          { id: 'case-type', title: 'Tipo de caso', description: 'Identifiquemos tu situación legal', completed: false },
          { id: 'evidence', title: 'Evidencia', description: 'Documentos y pruebas necesarias', completed: false },
          { id: 'document', title: 'Generar demanda', description: 'Creemos tu documento legal', completed: false },
          { id: 'filing', title: 'Presentación', description: 'Cómo y dónde presentar', completed: false }
        ];
      case 'hearing':
        return [
          { id: 'hearing-type', title: 'Tipo de audiencia', description: 'Identifiquemos el procedimiento', completed: false },
          { id: 'preparation', title: 'Preparación', description: 'Qué documentos llevar', completed: false },
          { id: 'practice', title: 'Práctica', description: 'Simulemos la audiencia', completed: false },
          { id: 'tips', title: 'Consejos finales', description: 'Recomendaciones importantes', completed: false }
        ];
      default:
        return [
          { id: 'question', title: 'Tu consulta', description: 'Cuéntanos tu situación', completed: false },
          { id: 'analysis', title: 'Análisis', description: 'Revisemos las opciones legales', completed: false },
          { id: 'recommendations', title: 'Recomendaciones', description: 'Plan de acción sugerido', completed: false }
        ];
    }
  };

  const steps = getStepsForType(type || 'info');

  const handleInputChange = (key: string, value: string) => {
    setUserResponses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the wizard
      router.push('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'info':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Información del Caso</Text>
            <Text style={styles.stepDescription}>
              Para ayudarte mejor, necesito algunos datos sobre tu situación.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>¿Qué tipo de demanda recibiste?</Text>
              <TextInput
                style={styles.textInput}
                value={userResponses.caseType || ''}
                onChangeText={(value) => handleInputChange('caseType', value)}
                placeholder="Ej: Demanda de alimentos, divorcio, laboral..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>¿Cuándo recibiste la demanda?</Text>
              <TextInput
                style={styles.textInput}
                value={userResponses.receiveDate || ''}
                onChangeText={(value) => handleInputChange('receiveDate', value)}
                placeholder="Fecha de notificación"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>¿Tienes el documento de la demanda?</Text>
              <View style={styles.radioGroup}>
                {['Sí', 'No'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.radioOption,
                      userResponses.hasDocument === option && styles.selectedRadio
                    ]}
                    onPress={() => handleInputChange('hasDocument', option)}
                  >
                    <Text style={[
                      styles.radioText,
                      userResponses.hasDocument === option && styles.selectedRadioText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'deadline':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Calcular Plazos</Text>
            <Text style={styles.stepDescription}>
              Basándome en tu información, estos son los plazos importantes:
            </Text>
            
            <View style={styles.deadlineCard}>
              <Calendar size={24} color="#ef4444" />
              <View style={styles.deadlineInfo}>
                <Text style={styles.deadlineTitle}>Plazo para contestar</Text>
                <Text style={styles.deadlineDate}>3 días hábiles desde la notificación</Text>
                <Text style={styles.deadlineWarning}>¡Muy importante no perder este plazo!</Text>
              </View>
            </View>

            <View style={styles.actionCard}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.actionText}>
                Te ayudaré a generar la contestación en el siguiente paso
              </Text>
            </View>
          </View>
        );

      case 'response':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Preparar Respuesta</Text>
            <Text style={styles.stepDescription}>
              Vamos a crear tu contestación de demanda paso a paso.
            </Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/document-form',
                params: { templateId: 'contestacion' }
              })}
            >
              <FileText size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Generar Contestación</Text>
            </TouchableOpacity>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Consejos importantes:</Text>
              <Text style={styles.tipItem}>• Lee cuidadosamente cada punto de la demanda</Text>
              <Text style={styles.tipItem}>• Niega los hechos que no sean ciertos</Text>
              <Text style={styles.tipItem}>• Presenta todas las excepciones aplicables</Text>
              <Text style={styles.tipItem}>• Adjunta la documentación de respaldo</Text>
            </View>
          </View>
        );

      case 'next-steps':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Próximos Pasos</Text>
            <Text style={styles.stepDescription}>
              Tu plan de acción personalizado:
            </Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepItemText}>Completar y firmar la contestación</Text>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepItemText}>Presentar en el juzgado correspondiente</Text>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepItemText}>Esperar notificación de audiencia</Text>
              </View>
            </View>

            <View style={styles.warningCard}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                Recuerda: Si tienes dudas complejas, considera consultar con un abogado
              </Text>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <Text style={styles.placeholderText}>
              Contenido específico para {step.id} en desarrollo...
            </Text>
          </View>
        );
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asistente Legal</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / steps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Paso {currentStep + 1} de {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedRadio: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  radioText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  selectedRadioText: {
    color: '#ffffff',
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    marginBottom: 16,
  },
  deadlineInfo: {
    marginLeft: 12,
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginBottom: 4,
  },
  deadlineWarning: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#166534',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  tipsContainer: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  stepItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#92400e',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButton: {
    backgroundColor: '#f59e0b',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});