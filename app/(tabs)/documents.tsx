import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FileText, Download, Plus, ChevronRight, Clock, CircleCheck as CheckCircle, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentService } from '@/services/documentService';

export default function DocumentsScreen() {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = documentService.getDocumentTemplates();

  const recentDocuments = [
    {
      id: '1',
      name: 'Contestación - Caso Alimentos',
      date: '2024-01-15',
      status: 'Completado',
      type: 'contestacion'
    },
    {
      id: '2',
      name: 'Demanda - Divorcio',
      date: '2024-01-10',
      status: 'Borrador',
      type: 'demanda'
    },
    {
      id: '3',
      name: 'Apelación - Sentencia Laboral',
      date: '2024-01-08',
      status: 'Completado',
      type: 'apelacion'
    }
  ];

  const handleGenerateDocument = (templateId: string) => {
    router.push({
      pathname: '/document-form',
      params: { templateId }
    });
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      Alert.alert(
        'Descargar Documento',
        `¿Deseas descargar ${doc.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Descargar', 
            onPress: () => {
              // Simulate download
              Alert.alert('Éxito', 'Documento descargado correctamente');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el documento');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Completado' ? '#10b981' : '#f59e0b';
  };

  const getStatusIcon = (status: string) => {
    return status === 'Completado' ? CheckCircle : Clock;
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
              <FileText size={48} color="#f59e0b" strokeWidth={1.5} />
              <Sparkles size={24} color="#fbbf24" style={styles.sparkle} />
            </View>
            <Text style={styles.title}>{t('docs.title')}</Text>
            <Text style={styles.subtitle}>{t('docs.subtitle')}</Text>
          </View>
          
          <Image
            source={{ uri: 'https://images.pexels.com/photos/4427430/pexels-photo-4427430.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('docs.templates')}</Text>
            
            <View style={styles.templatesContainer}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => handleGenerateDocument(template.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.templateHeader}>
                      <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                        <FileText size={28} color="#ffffff" strokeWidth={2} />
                      </View>
                      <View style={styles.templateInfo}>
                        <Text style={styles.templateTitle}>{template.title}</Text>
                        <Text style={styles.templateDescription}>{template.description}</Text>
                      </View>
                      <ChevronRight size={24} color="#64748b" />
                    </View>
                    
                    <View style={styles.fieldsList}>
                      <Text style={styles.fieldsTitle}>Campos requeridos:</Text>
                      {template.fields.slice(0, 3).map((field, index) => (
                        <Text key={index} style={styles.fieldItem}>• {field.label}</Text>
                      ))}
                      {template.fields.length > 3 && (
                        <Text style={styles.moreFields}>+{template.fields.length - 3} más...</Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('docs.recent')}</Text>
            
            <View style={styles.documentsContainer}>
              {recentDocuments.map((doc) => {
                const StatusIcon = getStatusIcon(doc.status);
                return (
                  <TouchableOpacity 
                    key={doc.id} 
                    style={styles.documentCard}
                    onPress={() => handleDownloadDocument(doc)}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.documentHeader}>
                        <View style={styles.documentIcon}>
                          <FileText size={24} color="#3b82f6" />
                        </View>
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentName}>{doc.name}</Text>
                          <Text style={styles.documentDate}>{doc.date}</Text>
                        </View>
                        <View style={styles.documentStatus}>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(doc.status) }
                          ]}>
                            <StatusIcon size={12} color="#ffffff" />
                            <Text style={styles.statusText}>{doc.status}</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.documentActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDownloadDocument(doc)}
                        >
                          <Download size={16} color="#64748b" />
                          <Text style={styles.actionText}>{t('common.download')}</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 16,
  },
  templatesContainer: {
    gap: 16,
  },
  templateCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateIcon: {
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
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  fieldsList: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  fieldsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  fieldItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 2,
  },
  moreFields: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
    marginTop: 4,
  },
  documentsContainer: {
    gap: 12,
  },
  documentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  documentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
});