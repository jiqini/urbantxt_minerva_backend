import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, Download, Share, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentService } from '@/services/documentService';
import { aiService } from '@/services/aiService';

export default function DocumentFormScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);

  const template = documentService.getDocumentTemplates().find(t => t.id === templateId);

  if (!template) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Plantilla no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = template.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]?.trim());
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Campos requeridos',
        `Por favor completa: ${missingFields.map(f => f.label).join(', ')}`
      );
      return false;
    }
    return true;
  };

  const handleGenerateDocument = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const documentContent = await aiService.generateDocument(templateId, formData);
      setGeneratedDocument(documentContent);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el documento. Por favor intenta más tarde.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedDocument) return;

    try {
      const documentData = {
        type: templateId,
        title: template.title,
        content: generatedDocument,
        metadata: {
          createdAt: new Date(),
          author: formData.plaintiff || formData.defendant || 'Usuario',
          caseNumber: formData.caseNumber
        }
      };

      const pdfUri = await documentService.generatePDF(documentData);
      await documentService.sharePDF(pdfUri, `${template.title}_${Date.now()}.pdf`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    formData[field.name] === option && styles.selectedOption
                  ]}
                  onPress={() => handleInputChange(field.name, option)}
                >
                  <Text style={[
                    styles.selectOptionText,
                    formData[field.name] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'textarea':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData[field.name] || ''}
              onChangeText={(value) => handleInputChange(field.name, value)}
              placeholder={`Ingresa ${field.label.toLowerCase()}`}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      default:
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData[field.name] || ''}
              onChangeText={(value) => handleInputChange(field.name, value)}
              placeholder={`Ingresa ${field.label.toLowerCase()}`}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            />
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <FileText size={32} color="#f59e0b" strokeWidth={1.5} />
            <Sparkles size={16} color="#fbbf24" style={styles.sparkle} />
          </View>
          <Text style={styles.title}>{template.title}</Text>
          <Text style={styles.subtitle}>{t('docs.form.title')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {template.fields.map(renderField)}

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.disabledButton]}
            onPress={handleGenerateDocument}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={isGenerating ? ['#94a3b8', '#64748b'] : ['#f59e0b', '#d97706']}
              style={styles.buttonGradient}
            >
              <FileText size={20} color="#ffffff" />
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generando...' : t('common.generate')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {generatedDocument && (
            <View style={styles.documentPreview}>
              <Text style={styles.previewTitle}>Documento Generado:</Text>
              <ScrollView style={styles.previewContainer} nestedScrollEnabled>
                <Text style={styles.previewText}>{generatedDocument}</Text>
              </ScrollView>
              
              <View style={styles.documentActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPDF}>
                  <Download size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>{t('common.download')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryActionButton]}
                  onPress={() => {
                    // Share functionality
                    Alert.alert('Compartir', 'Función de compartir implementada');
                  }}
                >
                  <Share size={20} color="#3b82f6" />
                  <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                    {t('common.share')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  formContainer: {
    padding: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedOption: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  selectOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  generateButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  documentPreview: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  previewContainer: {
    maxHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
  },
  secondaryActionButton: {
    backgroundColor: '#dbeafe',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  secondaryActionText: {
    color: '#3b82f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
});