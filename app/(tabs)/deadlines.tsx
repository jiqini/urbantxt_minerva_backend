import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  CalendarPlus,
  X,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'overdue' | 'completed';
  daysLeft: number;
}

export default function DeadlinesScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    category: 'general',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  const mockDeadlines: Deadline[] = [
    {
      id: '1',
      title: 'Contestación de Demanda',
      description: 'Responder a demanda laboral - Caso #2024-001',
      dueDate: '2025-01-18',
      category: 'legal',
      priority: 'high',
      status: 'upcoming',
      daysLeft: 3,
    },
    {
      id: '2',
      title: 'Audiencia de Conciliación',
      description: 'Presentarse en audiencia - Tribunal de Familia',
      dueDate: '2025-01-25',
      category: 'hearing',
      priority: 'high',
      status: 'upcoming',
      daysLeft: 10,
    },
    {
      id: '3',
      title: 'Presentar Apelación',
      description: 'Recurso de apelación contra sentencia',
      dueDate: '2025-01-13',
      category: 'legal',
      priority: 'high',
      status: 'overdue',
      daysLeft: -2,
    },
    {
      id: '4',
      title: 'Entrega de Documentos',
      description: 'Documentos de identidad para divorcio',
      dueDate: '2024-12-20',
      category: 'documents',
      priority: 'medium',
      status: 'completed',
      daysLeft: 0,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#DC3545';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock size={16} color="#003DA5" />;
      case 'overdue':
        return <AlertTriangle size={16} color="#DC3545" />;
      case 'completed':
        return <CheckCircle size={16} color="#28A745" />;
      default:
        return <Clock size={16} color="#6C757D" />;
    }
  };

  const filteredDeadlines = mockDeadlines.filter(deadline => deadline.status === activeTab);

  const handleAddDeadline = () => {
    // Add deadline logic here
    setShowAddModal(false);
    setNewDeadline({
      title: '',
      description: '',
      dueDate: new Date(),
      category: 'general',
      priority: 'medium',
    });
  };

  const handleAddToCalendar = (deadline: Deadline) => {
    Alert.alert(
      'Agregar al Calendario',
      `¿Desea agregar "${deadline.title}" a su calendario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Agregar', onPress: () => console.log('Added to calendar') }
      ]
    );
  };

  const renderDeadlineCard = (deadline: Deadline) => (
    <TouchableOpacity key={deadline.id} style={styles.deadlineCard}>
      <View style={styles.deadlineHeader}>
        <View style={styles.statusSection}>
          {getStatusIcon(deadline.status)}
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(deadline.priority) }]}>
            <Text style={styles.priorityText}>
              // Around line 151, add safety check:
              {deadline.priority?.toUpperCase() || 'NORMAL'}
            </Text>
          </View>
        </View>
        
        {deadline.status === 'upcoming' && (
          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftText}>
              {deadline.daysLeft} {t('deadlines.daysLeft')}
            </Text>
          </View>
        )}
        
        {deadline.status === 'overdue' && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueText}>
              Vencido hace {Math.abs(deadline.daysLeft)} días
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.deadlineTitle}>{deadline.title}</Text>
      <Text style={styles.deadlineDescription}>{deadline.description}</Text>
      
      <View style={styles.deadlineFooter}>
        <View style={styles.dateSection}>
          <Calendar size={14} color="#6C757D" />
          <Text style={styles.dateText}>
            {new Date(deadline.dueDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        {deadline.status === 'upcoming' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAddToCalendar(deadline)}
            >
              <CalendarPlus size={16} color="#003DA5" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Bell size={16} color="#003DA5" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('deadlines.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            {t('deadlines.upcoming')}
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>
              {mockDeadlines.filter(d => d.status === 'upcoming').length}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overdue' && styles.activeTab]}
          onPress={() => setActiveTab('overdue')}
        >
          <Text style={[styles.tabText, activeTab === 'overdue' && styles.activeTabText]}>
            {t('deadlines.overdue')}
          </Text>
          <View style={[styles.tabBadge, styles.overdueBadgeTab]}>
            <Text style={styles.tabBadgeText}>
              {mockDeadlines.filter(d => d.status === 'overdue').length}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            {t('deadlines.completed')}
          </Text>
          <View style={[styles.tabBadge, styles.completedBadgeTab]}>
            <Text style={styles.tabBadgeText}>
              {mockDeadlines.filter(d => d.status === 'completed').length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#6C757D" />
            <Text style={styles.emptyStateText}>
              No hay {activeTab === 'upcoming' ? 'próximos plazos' : 
                     activeTab === 'overdue' ? 'plazos vencidos' : 'plazos completados'}
            </Text>
          </View>
        ) : (
          filteredDeadlines.map(renderDeadlineCard)
        )}
      </ScrollView>

      {/* Add Deadline Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('deadlines.addDeadline')}</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6C757D" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                value={newDeadline.title}
                onChangeText={(text) => setNewDeadline({ ...newDeadline, title: text })}
                placeholder="Nombre del plazo"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newDeadline.description}
                onChangeText={(text) => setNewDeadline({ ...newDeadline, description: text })}
                placeholder="Detalles adicionales"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha de Vencimiento *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color="#6C757D" />
                <Text style={styles.dateText}>
                  {newDeadline.dueDate.toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prioridad</Text>
              <View style={styles.radioGroup}>
                {(['high', 'medium', 'low'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={styles.radioOption}
                    onPress={() => setNewDeadline({ ...newDeadline, priority })}
                  >
                    <View style={[
                      styles.radioCircle,
                      newDeadline.priority === priority && styles.radioSelected
                    ]} />
                    <Text style={styles.radioText}>
                      {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddDeadline}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={newDeadline.dueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewDeadline({ ...newDeadline, dueDate: selectedDate });
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#003DA5',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
    marginRight: 4,
  },
  activeTabText: {
    color: '#003DA5',
  },
  tabBadge: {
    backgroundColor: '#003DA5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueBadgeTab: {
    backgroundColor: '#DC3545',
  },
  completedBadgeTab: {
    backgroundColor: '#28A745',
  },
  tabBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  deadlineCard: {
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
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  daysLeftBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysLeftText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1976D2',
  },
  overdueBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D32F2F',
  },
  deadlineTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  deadlineDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  deadlineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#495057',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
    textAlign: 'center',
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#495057',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    marginRight: 6,
  },
  radioSelected: {
    borderColor: '#003DA5',
    backgroundColor: '#003DA5',
  },
  radioText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6C757D',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6C757D',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#003DA5',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
});