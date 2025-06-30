import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, MapPin, Phone, Clock, ExternalLink, Search, Sparkles } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResourcesScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('courts');

  const courts = [
    {
      id: '1',
      name: 'Juzgado 1° de Familia San Salvador',
      address: 'Centro de Gobierno, San Salvador',
      phone: '2527-5000',
      hours: 'Lunes a Viernes 8:00 AM - 4:00 PM',
      distance: '2.5 km',
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Juzgado 2° de Familia San Salvador',
      address: 'Centro de Gobierno, San Salvador',
      phone: '2527-5001',
      hours: 'Lunes a Viernes 8:00 AM - 4:00 PM',
      distance: '2.5 km',
      image: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      name: 'Juzgado de Paz Santa Tecla',
      address: 'Santa Tecla, La Libertad',
      phone: '2228-3000',
      hours: 'Lunes a Viernes 7:30 AM - 3:30 PM',
      distance: '15.2 km',
      image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const mediationCenters = [
    {
      id: '1',
      name: 'Centro de Mediación FGR',
      address: 'San Salvador Centro',
      phone: '2231-0000',
      hours: 'Lunes a Viernes 8:00 AM - 5:00 PM',
      distance: '1.8 km',
      image: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Centro de Mediación Familiar',
      address: 'Col. Escalón, San Salvador',
      phone: '2264-5000',
      hours: 'Lunes a Viernes 8:00 AM - 4:00 PM',
      distance: '5.3 km',
      image: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const proBonoClinics = [
    {
      id: '1',
      name: 'Clínica Jurídica UCA',
      address: 'Universidad Centroamericana',
      phone: '2210-6600',
      hours: 'Martes y Jueves 2:00 PM - 5:00 PM',
      distance: '8.1 km',
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Fundación de Estudios para la Aplicación del Derecho',
      address: 'Col. San Benito, San Salvador',
      phone: '2264-0505',
      hours: 'Lunes a Viernes 8:00 AM - 5:00 PM',
      distance: '4.7 km',
      image: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const libraryTopics = [
    {
      id: '1',
      title: 'Derecho de Familia',
      subtitle: 'Divorcio, alimentos, custodia',
      icon: '👨‍👩‍👧‍👦',
      articles: 15,
      image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Derecho Laboral',
      subtitle: 'Despidos, indemnizaciones, derechos',
      icon: '👷',
      articles: 12,
      image: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'Derecho Civil',
      subtitle: 'Contratos, propiedades, obligaciones',
      icon: '📜',
      articles: 18,
      image: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      title: 'Procedimientos Judiciales',
      subtitle: 'Cómo presentar demandas y recursos',
      icon: '⚖️',
      articles: 20,
      image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const tabs = [
    { id: 'courts', title: t('resources.courts'), icon: MapPin },
    { id: 'mediation', title: t('resources.mediation'), icon: Search },
    { id: 'probono', title: t('resources.probono'), icon: BookOpen },
    { id: 'library', title: t('resources.library'), icon: BookOpen }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'courts': return courts;
      case 'mediation': return mediationCenters;
      case 'probono': return proBonoClinics;
      case 'library': return libraryTopics;
      default: return [];
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const renderLocationCard = (item: any) => (
    <View key={item.id} style={styles.resourceCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardDetail}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.cardAddress}>{item.address}</Text>
          </View>
          <View style={styles.cardDetail}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.cardHours}>{item.hours}</Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCall(item.phone)}
            >
              <Phone size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>{t('resources.call')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleDirections(item.address)}
            >
              <ExternalLink size={16} color="#3b82f6" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>{t('resources.directions')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderLibraryCard = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.libraryCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
        style={styles.cardGradient}
      >
        <View style={styles.libraryCardContent}>
          <Image source={{ uri: item.image }} style={styles.libraryImage} />
          <View style={styles.libraryInfo}>
            <View style={styles.libraryHeader}>
              <Text style={styles.libraryEmoji}>{item.icon}</Text>
              <Text style={styles.libraryTitle}>{item.title}</Text>
            </View>
            <Text style={styles.librarySubtitle}>{item.subtitle}</Text>
            <Text style={styles.libraryCount}>{item.articles} artículos disponibles</Text>
          </View>
          <ExternalLink size={20} color="#64748b" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <BookOpen size={48} color="#f59e0b" strokeWidth={1.5} />
            <Sparkles size={24} color="#fbbf24" style={styles.sparkle} />
          </View>
          <Text style={styles.title}>{t('resources.title')}</Text>
          <Text style={styles.subtitle}>{t('resources.subtitle')}</Text>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <IconComponent
                    size={20}
                    color={activeTab === tab.id ? '#ffffff' : '#64748b'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.resourcesContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'library' 
            ? getCurrentData().map(renderLibraryCard)
            : getCurrentData().map(renderLocationCard)
          }
        </ScrollView>
      </View>
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
    height: 160,
    borderRadius: 16,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  resourcesContainer: {
    flex: 1,
    padding: 20,
  },
  resourceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 0,
  },
  cardImageContainer: {
    position: 'relative',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    flex: 1,
  },
  cardHours: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
  },
  secondaryButton: {
    backgroundColor: '#dbeafe',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  libraryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  libraryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  libraryImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  libraryEmoji: {
    fontSize: 20,
  },
  libraryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  librarySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  libraryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
});