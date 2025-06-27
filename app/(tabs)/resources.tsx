import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Filter,
  Navigation,
  Scale,
  Users,
  Heart,
  Building,
} from 'lucide-react-native';

interface Resource {
  id: string;
  name: string;
  type: 'court' | 'mediation' | 'proBono' | 'legalAid';
  address: string;
  phone: string;
  hours: string;
  services: string[];
  department: string;
  municipality: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function ResourcesScreen() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<'all' | 'court' | 'mediation' | 'proBono' | 'legalAid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const resources: Resource[] = [
    {
      id: '1',
      name: 'Tribunal Primero de lo Civil de San Salvador',
      type: 'court',
      address: 'Centro de Gobierno, San Salvador',
      phone: '2527-9200',
      hours: 'Lunes a Viernes: 8:00 AM - 4:00 PM',
      services: ['Demandas civiles', 'Divorcios', 'Sucesiones'],
      department: 'San Salvador',
      municipality: 'San Salvador',
      coordinates: { lat: 13.6929, lng: -89.2182 },
    },
    {
      id: '2',
      name: 'Centro de Mediación Familiar',
      type: 'mediation',
      address: '25 Av. Norte, San Salvador',
      phone: '2221-3456',
      hours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
      services: ['Mediación familiar', 'Pensión alimenticia', 'Custodia'],
      department: 'San Salvador',
      municipality: 'San Salvador',
      coordinates: { lat: 13.7007, lng: -89.2076 },
    },
    {
      id: '3',
      name: 'Procuraduría para la Defensa de los Derechos Humanos',
      type: 'legalAid',
      address: '9a Av. Norte y 5a Calle Poniente, San Salvador',
      phone: '2525-5000',
      hours: 'Lunes a Viernes: 8:00 AM - 4:30 PM',
      services: ['Asesoría legal gratuita', 'Derechos humanos', 'Violencia doméstica'],
      department: 'San Salvador',
      municipality: 'San Salvador',
      coordinates: { lat: 13.6988, lng: -89.2077 },
    },
    {
      id: '4',
      name: 'Fundación de Estudios para la Aplicación del Derecho',
      type: 'proBono',
      address: 'Col. Escalón, San Salvador',
      phone: '2264-0404',
      hours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
      services: ['Asesoría legal pro bono', 'Casos civiles', 'Derechos laborales'],
      department: 'San Salvador',
      municipality: 'San Salvador',
      coordinates: { lat: 13.7073, lng: -89.2182 },
    },
    {
      id: '5',
      name: 'Juzgado de Paz de Santa Tecla',
      type: 'court',
      address: 'Santa Tecla, La Libertad',
      phone: '2228-1234',
      hours: 'Lunes a Viernes: 8:00 AM - 4:00 PM',
      services: ['Casos menores', 'Conciliación', 'Faltas'],
      department: 'La Libertad',
      municipality: 'Santa Tecla',
      coordinates: { lat: 13.6767, lng: -89.2797 },
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'court':
        return <Scale size={20} color="#003DA5" />;
      case 'mediation':
        return <Users size={20} color="#28A745" />;
      case 'proBono':
        return <Heart size={20} color="#DC3545" />;
      case 'legalAid':
        return <Building size={20} color="#6C5CE7" />;
      default:
        return <MapPin size={20} color="#6C757D" />;
    }
  };

  const getResourceTypeText = (type: string) => {
    switch (type) {
      case 'court':
        return t('resources.courts');
      case 'mediation':
        return t('resources.mediationCenters');
      case 'proBono':
        return t('resources.proBono');
      case 'legalAid':
        return t('resources.legalAid');
      default:
        return type;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'court':
        return '#003DA5';
      case 'mediation':
        return '#28A745';
      case 'proBono':
        return '#DC3545';
      case 'legalAid':
        return '#6C5CE7';
      default:
        return '#6C757D';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesFilter = activeFilter === 'all' || resource.type === activeFilter;
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.services.some(service => 
                           service.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    return matchesFilter && matchesSearch;
  });

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'No se puede realizar la llamada');
      }
    });
  };

  const handleGetDirections = (resource: Resource) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.coordinates.lat},${resource.coordinates.lng}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir el mapa');
      }
    });
  };

  const filterButtons = [
    { key: 'all', label: 'Todos', count: resources.length },
    { key: 'court', label: 'Tribunales', count: resources.filter(r => r.type === 'court').length },
    { key: 'mediation', label: 'Mediación', count: resources.filter(r => r.type === 'mediation').length },
    { key: 'proBono', label: 'Pro Bono', count: resources.filter(r => r.type === 'proBono').length },
    { key: 'legalAid', label: 'Asistencia', count: resources.filter(r => r.type === 'legalAid').length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('resources.title')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6C757D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilter === filter.key && styles.activeFilterButtonText
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterBadge,
              activeFilter === filter.key && styles.activeFilterBadge
            ]}>
              <Text style={[
                styles.filterBadgeText,
                activeFilter === filter.key && styles.activeFilterBadgeText
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredResources.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#6C757D" />
            <Text style={styles.emptyStateText}>
              No se encontraron recursos
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        ) : (
          filteredResources.map((resource) => (
            <View key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceHeader}>
                <View style={styles.resourceTypeSection}>
                  <View style={[styles.resourceIcon, { backgroundColor: getResourceColor(resource.type) }]}>
                    {getResourceIcon(resource.type)}
                  </View>
                  <Text style={[styles.resourceType, { color: getResourceColor(resource.type) }]}>
                    {getResourceTypeText(resource.type)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.resourceName}>{resource.name}</Text>
              
              <View style={styles.resourceInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color="#6C757D" />
                  <Text style={styles.infoText}>{resource.address}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Phone size={16} color="#6C757D" />
                  <Text style={styles.infoText}>{resource.phone}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Clock size={16} color="#6C757D" />
                  <Text style={styles.infoText}>{resource.hours}</Text>
                </View>
              </View>
              
              <View style={styles.servicesSection}>
                <Text style={styles.servicesTitle}>{t('resources.services')}:</Text>
                <View style={styles.servicesTags}>
                  {resource.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.resourceActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCall(resource.phone)}
                >
                  <Phone size={16} color="#28A745" />
                  <Text style={styles.actionButtonText}>Llamar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleGetDirections(resource)}
                >
                  <Navigation size={16} color="#003DA5" />
                  <Text style={styles.actionButtonText}>Direcciones</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
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
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  filterScrollView: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeFilterButton: {
    backgroundColor: '#003DA5',
    borderColor: '#003DA5',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
    marginRight: 6,
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#6C757D',
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resourceHeader: {
    marginBottom: 8,
  },
  resourceTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  resourceType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  resourceName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginBottom: 12,
  },
  resourceInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#495057',
    flex: 1,
  },
  servicesSection: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#495057',
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serviceTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#495057',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#495057',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    textAlign: 'center',
  },
});