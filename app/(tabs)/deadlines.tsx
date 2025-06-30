import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Plus, TriangleAlert as AlertTriangle, X, CalendarPlus, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/aiService';
import { calendarService } from '@/services/calendarService';

export default function DeadlinesScreen() {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    date: '',
    description: '',
    caseType: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const deadlines = [
    {
      id: '1',
      title: 'Presentar contestación',
      description: 'Responder a demanda de alimentos',
      date: '2024-01-18',
      daysLeft: 3,
      priority: 'urgent',
      type: 'Respuesta a demanda',
      caseNumber: 'FAM-001-2024'
    },
    {
      id: '2',
      title: 'Audiencia de conciliación',
      description: 'Caso divorcio - Juzgado 2do de Familia',
      date: '2024-01-25',
      daysLeft: 10,
      priority: 'medium',
      type: 'Audiencia',
      caseNumber: 'FAM-002-2024'
    },
    {
      id: '3',
      title: 'Presentar apelación',
      description: 'Recurso contra sentencia',
      date: '2024-02-01',
      daysLeft: 17,
      priority: 'low',
      type: 'Recurso',
      caseNumber: 'CIV-003-2024'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const handleCalculateDeadline = async () => {
    if (!newDeadline.caseType) {
      Alert.alert('Error', 'Por favor selecciona el tipo de caso');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await aiService.calculateDeadline(newDeadline.caseType, new Date());
      setNewDeadline(prev => ({
        ...prev,
        date: result.deadline.toISOString().split('T')[0],
        description: result.description
      }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular el plazo');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddDeadline = () => {
    if (!newDeadline.title || !newDeadline.date) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Here we would save the deadline to local storage or backend
    setShowAddModal(false);
    setNewDeadline({ title: '', date: '', description: '', caseType: '' });
    Alert.alert('Éxito', 'Plazo agregado correctamente');
  };

  const handleAddToCalendar = async (deadline: any) => {
    try {
      const eventId = await calendarService.createEvent({
        title: deadline.title,
        startDate: new Date(deadline.date),
        endDate: new Date(new Date(deadline.date).getTime() + 60 * 60 * 1000), // 1 hour duration
        notes: deadline.description,
        location: 'Tribunal correspondiente'
      });

      if (eventId) {
        Alert.alert('Éxito', 'Evento agregado al calendario');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar al calendario');
    }
  };

  const caseTypes = [
    'contestacion',
    'apelacion',
    'casacion',
    'amparo',
    'revision'
  ];

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Calendar size={48} color="#f59e0b" strokeWidth={1.5} />
              <Sparkles size={24} color="#fbbf24" style={styles.sparkle} />
            </View>
            <Text style={styles.title}>{t('deadlines.title')}</Text>
            <Text style={styles.subtitle}>{t('deadlines.subtitle')}</Text>
          </View>
          
          <Image
            source={{ uri: 'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('deadlines.upcoming')}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>{t('deadlines.add')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.deadlinesContainer}>
            {deadlines.map((deadline) => (
              <View key={deadline.id} style={styles.deadlineCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.deadlineHeader}>
                    <View style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(deadline.priority) }
                    ]} />
                    
                    <View style={styles.deadlineInfo}>
                      <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                      <Text style={styles.deadlineDescription}>{deadline.description}</Text>
                      <Text style={styles.deadlineType}>{deadline.type}</Text>
                      <Text style={styles.caseNumber}>Exp: {deadline.caseNumber}</Text>
                    </View>

                    <View style={styles.deadlineTime}>
                      <View style={[
                        styles.daysLeftBadge,
                        { backgroundColor: getPriorityColor(deadline.priority) }
                      ]}>
                        <Text style={styles.daysLeftText}>
                          {deadline.daysLeft} {t('deadlines.days_left')}
                        </Text>
                      </View>
                      <Text style={styles.deadlineDate}>{deadline.date}</Text>
                    </View>
                  </View>

                  {deadline.priority === 'urgent' && (
                    <View style={styles.urgentWarning}>
                      <AlertTriangle size={16} color="#ef4444" />
                      <Text style={styles.urgentText}>¡Plazo venciendo pronto!</Text>
                    </View>
                  )}

                  <View style={styles.deadlineActions}>
                    <TouchableOpacity 
                      style={styles.calendarButton}
                      onPress={() => handleAddToCalendar(deadline)}
                    >
                      <CalendarPlus size={16} color="#3b82f6" />
                      <Text style={styles.calendarButtonText}>{t('deadlines.add_to_calendar')}</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('deadlines.add')}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título del plazo *</Text>
              <TextInput
                style={styles.textInput}
                value={newDeadline.title}
                onChangeText={(text) => setNewDeadline({ ...newDeadline, title: text })}
                placeholder="Ej: Presentar contestación"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de caso</Text>
              <View style={styles.caseTypeContainer}>
                {caseTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.caseTypeButton,
                      newDeadline.caseType === type && styles.selectedCaseType
                    ]}
                    onPress={() => setNewDeadline({ ...newDeadline, caseType: type })}
                  >
                    <Text style={[
                      styles.caseTypeText,
                      newDeadline.caseType === type && styles.selectedCaseTypeText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.calculateButton}
                onPress={handleCalculateDeadline}
                disabled={!newDeadline.caseType || isCalculating}
              >
                <Text style={styles.calculateButtonText}>
                  {isCalculating ? 'Calculando...' : 'Calcular Plazo Automáticamente'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha límite *</Text>
              <TextInput
                style={styles.textInput}
                value={newDeadline.date}
                onChangeText={(text) => setNewDeadline({ ...newDeadline, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newDeadline.description}
                onChangeText={(text) => setNewDeadline({ ...newDeadline, description: text })}
                placeholder="Detalles adicionales..."
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddDeadline}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deadlinesContainer: {
    gap: 16,
  },
  deadlineCard: {
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
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 16,
    minHeight: 80,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  deadlineDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 20,
  },
  deadlineType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
    marginBottom: 2,
  },
  caseNumber: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  deadlineTime: {
    alignItems: 'flex-end',
  },
  daysLeftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  daysLeftText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  deadlineDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  urgentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  urgentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
  },
  deadlineActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  calendarButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  caseTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  caseTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCaseType: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  caseTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  selectedCaseTypeText: {
    color: '#ffffff',
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  saveButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});