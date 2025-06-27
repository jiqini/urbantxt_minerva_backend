import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  User,
} from 'lucide-react-native';

interface DocumentTemplate {
  id: string;
  titleKey: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'completed' | 'pending';
  createdDate: string;
  lastModified: string;
}

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'templates' | 'myDocuments'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'demanda',
      titleKey: 'documents.demanda',
      description: 'Plantilla para presentar una demanda civil',
      category: 'civil',
      icon: <FileText size={20} color="#003DA5" />,
      color: '#003DA5',
    },
    {
      id: 'contestacion',
      titleKey: 'documents.contestacion',
      description: 'Contestación a una demanda recibida',
      category: 'civil',
      icon: <FileText size={20} color="#28A745" />,
      color: '#28A745',
    },
    {
      id: 'apelacion',
      titleKey: 'documents.apelacion',
      description: 'Recurso de apelación',
      category: 'civil',
      icon: <FileText size={20} color="#FF6B35" />,
      color: '#FF6B35',
    },
    {
      id: 'poder',
      titleKey: 'documents.powersOfAttorney',
      description: 'Poder general o especial para representación',
      category: 'general',
      icon: <FileText size={20} color="#6C5CE7" />,
      color: '#6C5CE7',
    },
  ];

  const myDocuments: Document[] = [
    {
      id: '1',
      title: 'Contestación - Demanda Laboral',
      type: 'contestacion',
      status: 'completed',
      createdDate: '2025-01-10',
      lastModified: '2025-01-12',
    },
    {
      id: '2',
      title: 'Demanda - Pensión Alimenticia',
      type: 'demanda',
      status: 'draft',
      createdDate: '2025-01-08',
      lastModified: '2025-01-08',
    },
    {
      id: '3',
      title: 'Poder General - Juan Pérez',
      type: 'poder',
      status: 'pending',
      createdDate: '2025-01-05',
      lastModified: '2025-01-07',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28A745';
      case 'draft':
        return '#FFC107';
      case 'pending':
        return '#003DA5';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const renderTemplatesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Search size={20} color="#6C757D" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar plantillas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6C757D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {documentTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.templateCard, { borderLeftColor: template.color }]}
            onPress={() => handleTemplateSelect(template)}
          >
            <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
              {template.icon}
            </View>
            <View style={styles.templateContent}>
              <Text style={styles.templateTitle}>{t(template.titleKey)}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>
            <ArrowRight size={16} color="#6C757D" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMyDocumentsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {myDocuments.map((doc) => (
          <TouchableOpacity key={doc.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
                <Text style={styles.statusText}>{getStatusText(doc.status)}</Text>
              </View>
            </View>
            
            <View style={styles.documentMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color="#6C757D" />
                <Text style={styles.metaText}>
                  Creado: {new Date(doc.createdDate).toLocaleDateString('es-ES')}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <User size={14} color="#6C757D" />
                <Text style={styles.metaText}>
                  Modificado: {new Date(doc.lastModified).toLocaleDateString('es-ES')}
                </Text>
              </View>
            </View>
            
            <View style={styles.documentActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Eye size={16} color="#003DA5" />
                <Text style={styles.actionText}>{t('documents.preview')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Download size={16} color="#28A745" />
                <Text style={styles.actionText}>{t('documents.downloadPdf')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('documents.title')}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            {t('documents.templates')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myDocuments' && styles.activeTab]}
          onPress={() => setActiveTab('myDocuments')}
        >
          <Text style={[styles.tabText, activeTab === 'myDocuments' && styles.activeTabText]}>
            {t('documents.myDocuments')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'templates' ? renderTemplatesTab() : renderMyDocumentsTab()}

      {/* Template Fill Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedTemplate && t(selectedTemplate.titleKey)}
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplateModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre Completo *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ingrese su nombre completo"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DUI *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="00000000-0"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Dirección completa"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0000-0000"
                />
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Detalles del Caso</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción del Caso *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describa los hechos de manera clara y detallada"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monto Solicitado</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="$0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.previewButton}>
              <Eye size={16} color="#003DA5" />
              <Text style={styles.previewButtonText}>{t('documents.preview')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
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
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#003DA5',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
  },
  activeTabText: {
    color: '#003DA5',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
  },
  filterButton: {
    padding: 4,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    lineHeight: 20,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  documentMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#003DA5',
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
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#003DA5',
    borderRadius: 8,
  },
  previewButtonText: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#003DA5',
  },
  saveButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#003DA5',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});