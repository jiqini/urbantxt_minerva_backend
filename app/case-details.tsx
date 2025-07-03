import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Share,
  Archive,
  MoreVertical,
  Plus,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function CaseDetailsScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock case data - in real app, fetch based on caseId
  const caseData = {
    id: caseId,
    title: 'Demanda por Pensión Alimenticia',
    type: 'childSupport',
    status: 'active',
    priority: 'high',
    progress: 75,
    deadline: '2025-01-20',
    daysLeft: 5,
    description: 'Solicitud de pensión alimenticia para menor de edad',
    createdAt: '2024-12-15',
    court: 'Juzgado 1° de Familia San Salvador',
    caseNumber: 'FAM-001-2024',
    parties: {
      plaintiff: 'María González',
      defendant: 'Carlos Rodríguez',
    },
    timeline: [
      {
        id: '1',
        date: '2024-12-15',
        title: 'Caso creado',
        description: 'Inicio del proceso de demanda',
        type: 'created',
      },
      {
        id: '2',
        date: '2024-12-18',
        title: 'Documentos preparados',
        description: 'Demanda inicial completada',
        type: 'document',
      },
      {
        id: '3',
        date: '2024-12-20',
        title: 'Demanda presentada',
        description: 'Documentos presentados en el juzgado',
        type: 'filed',
      },
      {
        id: '4',
        date: '2025-01-20',
        title: 'Audiencia programada',
        description: 'Primera audiencia de conciliación',
        type: 'hearing',
        upcoming: true,
      },
    ],
    documents: [
      {
        id: '1',
        name: 'Demanda de Alimentos',
        type: 'demanda',
        status: 'completed',
        date: '2024-12-18',
      },
      {
        id: '2',
        name: 'Certificado de Nacimiento',
        type: 'evidence',
        status: 'uploaded',
        date: '2024-12-19',
      },
      {
        id: '3',
        name: 'Comprobantes de Ingresos',
        type: 'evidence',
        status: 'pending',
        date: null,
      },
    ],
    deadlines: [
      {
        id: '1',
        title: 'Audiencia de Conciliación',
        date: '2025-01-20',
        daysLeft: 5,
        priority: 'urgent',
      },
      {
        id: '2',
        title: 'Presentar Pruebas Adicionales',
        date: '2025-01-15',
        daysLeft: 0,
        priority: 'high',
      },
    ],
  };

  const tabs = [
    { id: 'overview', title: 'Resumen', icon: FileText },
    { id: 'timeline', title: 'Cronología', icon: Clock },
    { id: 'documents', title: 'Documentos', icon: FileText },
    { id: 'deadlines', title: 'Plazos', icon: Calendar },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.info;
      case 'pending': return colors.warning;
      case 'completed': return colors.success;
      case 'urgent': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return '#ff6b35';
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Case Info Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Información del Caso</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Número de Caso:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{caseData.caseNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tribunal:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{caseData.court}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Demandante:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{caseData.parties.plaintiff}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Demandado:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{caseData.parties.defendant}</Text>
        </View>
      </View>

      {/* Progress Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Progreso del Caso</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Completado
            </Text>
            <Text style={[styles.progressPercentage, { color: colors.text }]}>
              {caseData.progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStatusColor(caseData.status),
                  width: `${caseData.progress}%` 
                }
              ]} 
            />
          </View>
        </View>

        <Text style={[styles.progressDescription, { color: colors.textSecondary }]}>
          {caseData.description}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
            <FileText size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Generar Documento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}>
            <Calendar size={24} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.secondary }]}>Agregar Plazo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}>
            <Users size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>Contactar Abogado</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}>
            <Share size={24} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.info }]}>Compartir Caso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.tabContent}>
      {caseData.timeline.map((event, index) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[
              styles.timelineDot,
              { 
                backgroundColor: event.upcoming ? colors.warning : colors.success,
                borderColor: event.upcoming ? colors.warning : colors.success,
              }
            ]} />
            {index < caseData.timeline.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            )}
          </View>
          
          <View style={[styles.timelineContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.timelineHeader}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>{event.title}</Text>
              <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                {new Date(event.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>
              {event.description}
            </Text>
            {event.upcoming && (
              <View style={[styles.upcomingBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.upcomingText, { color: colors.warning }]}>Próximo</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={[styles.addDocumentButton, { backgroundColor: colors.primary }]}>
        <Plus size={20} color="#ffffff" />
        <Text style={styles.addDocumentText}>Agregar Documento</Text>
      </TouchableOpacity>
      
      {caseData.documents.map((doc) => (
        <View key={doc.id} style={[styles.documentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.documentHeader}>
            <FileText size={24} color={colors.primary} />
            <View style={styles.documentInfo}>
              <Text style={[styles.documentName, { color: colors.text }]}>{doc.name}</Text>
              <Text style={[styles.documentType, { color: colors.textSecondary }]}>{doc.type}</Text>
            </View>
            <View style={[
              styles.documentStatus,
              { backgroundColor: getStatusColor(doc.status) + '20' }
            ]}>
              <Text style={[styles.documentStatusText, { color: getStatusColor(doc.status) }]}>
                {doc.status}
              </Text>
            </View>
          </View>
          {doc.date && (
            <Text style={[styles.documentDate, { color: colors.textSecondary }]}>
              {new Date(doc.date).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderDeadlines = () => (
    <View style={styles.tabContent}>
      {caseData.deadlines.map((deadline) => (
        <View key={deadline.id} style={[styles.deadlineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.deadlineHeader}>
            <Calendar size={24} color={getPriorityColor(deadline.priority)} />
            <View style={styles.deadlineInfo}>
              <Text style={[styles.deadlineTitle, { color: colors.text }]}>{deadline.title}</Text>
              <Text style={[styles.deadlineDate, { color: colors.textSecondary }]}>
                {new Date(deadline.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <View style={[
              styles.deadlineBadge,
              { backgroundColor: getPriorityColor(deadline.priority) }
            ]}>
              <Text style={styles.deadlineDays}>
                {deadline.daysLeft > 0 ? `${deadline.daysLeft}d` : 'Vencido'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'timeline': return renderTimeline();
      case 'documents': return renderDocuments();
      case 'deadlines': return renderDeadlines();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {caseData.title}
          </Text>
          <View style={styles.headerMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseData.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(caseData.status) }]}>
                {caseData.status}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(caseData.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(caseData.priority) }]}>
                {caseData.priority}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && { borderBottomColor: colors.primary }
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <IconComponent 
                  size={18} 
                  color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  moreButton: {
    marginLeft: 16,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    textAlign: 'right',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  progressPercentage: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  timelineDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  upcomingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  upcomingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  addDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addDocumentText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  documentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  documentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  deadlineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deadlineTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  deadlineDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  deadlineBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deadlineDays: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});