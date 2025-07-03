import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Scale,
  Users,
  DollarSign,
  FileText,
  Play,
  Heart,
  Clock,
  Star,
  X,
  Volume2,
} from 'lucide-react-native';

interface LearningCategory {
  id: string;
  titleKey: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFavorite: boolean;
  content: string;
}

export default function LearnScreen() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'categories' | 'recent' | 'favorites'>('categories');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const categories: LearningCategory[] = [
    {
      id: 'courtProcess',
      titleKey: 'learn.courtProcess',
      description: 'Aprenda cómo funciona el sistema judicial',
      icon: <Scale size={24} color="#003DA5" />,
      color: '#003DA5',
      articles: [
        {
          id: '1',
          title: '¿Cómo funciona un juicio civil?',
          description: 'Una guía completa del proceso judicial civil en El Salvador',
          duration: '10 min',
          difficulty: 'beginner',
          isFavorite: false,
          content: 'El proceso judicial civil en El Salvador sigue varios pasos importantes...'
        },
        {
          id: '2',
          title: 'Tipos de tribunales en El Salvador',
          description: 'Conozca los diferentes tribunales y sus competencias',
          duration: '8 min',
          difficulty: 'beginner',
          isFavorite: true,
          content: 'El sistema judicial salvadoreño está organizado en diferentes niveles...'
        },
      ]
    },
    {
      id: 'yourRights',
      titleKey: 'learn.yourRights',
      description: 'Conozca sus derechos fundamentales',
      icon: <Users size={24} color="#28A745" />,
      color: '#28A745',
      articles: [
        {
          id: '3',
          title: 'Derechos del trabajador',
          description: 'Sus derechos laborales según el Código de Trabajo',
          duration: '12 min',
          difficulty: 'intermediate',
          isFavorite: false,
          content: 'Los trabajadores en El Salvador tienen derechos fundamentales protegidos por ley...'
        },
        {
          id: '4',
          title: 'Derechos en procesos judiciales',
          description: 'Qué derechos tiene durante un proceso legal',
          duration: '15 min',
          difficulty: 'intermediate',
          isFavorite: true,
          content: 'Durante cualquier proceso judicial, usted tiene derecho a...'
        },
      ]
    },
    {
      id: 'courtEtiquette',
      titleKey: 'learn.courtEtiquette',
      description: 'Protocolo y etiqueta en audiencias',
      icon: <FileText size={24} color="#6C5CE7" />,
      color: '#6C5CE7',
      articles: [
        {
          id: '5',
          title: 'Cómo vestirse para una audiencia',
          description: 'Guía de vestimenta apropiada para comparecer ante el juez',
          duration: '5 min',
          difficulty: 'beginner',
          isFavorite: false,
          content: 'La presentación personal es importante en las audiencias judiciales...'
        },
        {
          id: '6',
          title: 'Cómo dirigirse al juez',
          description: 'Protocolo de comunicación en sala de audiencias',
          duration: '7 min',
          difficulty: 'beginner',
          isFavorite: false,
          content: 'Al dirigirse al juez, siempre use las formas de tratamiento apropiadas...'
        },
      ]
    },
    {
      id: 'fees',
      titleKey: 'learn.fees',
      description: 'Costos de procesos judiciales',
      icon: <DollarSign size={24} color="#FF6B35" />,
      color: '#FF6B35',
      articles: [
        {
          id: '7',
          title: 'Aranceles judiciales',
          description: 'Cuánto cuestan los diferentes procedimientos',
          duration: '6 min',
          difficulty: 'beginner',
          isFavorite: true,
          content: 'Los aranceles judiciales varían según el tipo de procedimiento...'
        },
      ]
    },
    {
      id: 'selfRepresentation',
      titleKey: 'learn.selfRepresentation',
      description: 'Cómo representarse a sí mismo',
      icon: <Users size={24} color="#FFC107" />,
      color: '#FFC107',
      articles: [
        {
          id: '8',
          title: 'Representación personal en juicios',
          description: '¿Cuándo puede representarse sin abogado?',
          duration: '9 min',
          difficulty: 'intermediate',
          isFavorite: false,
          content: 'En ciertos casos, la ley permite la representación personal...'
        },
      ]
    },
  ];

  const allArticles = categories.flatMap(cat => cat.articles);
  const favoriteArticles = allArticles.filter(article => article.isFavorite);
  const recentArticles = allArticles.slice(0, 5);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#28A745';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  const toggleFavorite = (articleId: string) => {
    // Toggle favorite logic here
    console.log('Toggle favorite for article:', articleId);
  };

  const renderArticleCard = (article: Article) => (
    <TouchableOpacity
      key={article.id}
      style={styles.articleCard}
      onPress={() => handleArticlePress(article)}
    >
      <View style={styles.articleHeader}>
        <View style={styles.articleMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(article.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(article.difficulty)}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Clock size={12} color="#6C757D" />
            <Text style={styles.durationText}>{article.duration}</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => toggleFavorite(article.id)}>
          <Heart
            size={20}
            color={article.isFavorite ? '#DC3545' : '#6C757D'}
            fill={article.isFavorite ? '#DC3545' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleDescription}>{article.description}</Text>
      
      <View style={styles.articleFooter}>
        <TouchableOpacity style={styles.readButton}>
          <BookOpen size={16} color="#003DA5" />
          <Text style={styles.readButtonText}>Leer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.listenButton}>
          <Volume2 size={16} color="#28A745" />
          <Text style={styles.listenButtonText}>Escuchar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoriesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {categories.map((category) => (
        <View key={category.id} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              {category.icon}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{t(category.titleKey)}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </View>
          
          <View style={styles.articlesGrid}>
            {category.articles.map(renderArticleCard)}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderRecentTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Artículos Recientes</Text>
      <View style={styles.articlesGrid}>
        {recentArticles.map(renderArticleCard)}
      </View>
    </ScrollView>
  );

  const renderFavoritesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Mis Favoritos</Text>
      {favoriteArticles.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={48} color="#6C757D" />
          <Text style={styles.emptyStateText}>
            No tienes artículos favoritos aún
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Marca con ❤️ los artículos que más te gusten
          </Text>
        </View>
      ) : (
        <View style={styles.articlesGrid}>
          {favoriteArticles.map(renderArticleCard)}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('learn.title')}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            {t('learn.categories')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            {t('learn.recent')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            {t('learn.favorites')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'recent' && renderRecentTab()}
        {activeTab === 'favorites' && renderFavoritesTab()}
      </View>

      {/* Article Modal */}
      <Modal
        visible={showArticleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
            <TouchableOpacity
              onPress={() => setShowArticleModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6C757D" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.articleModalHeader}>
              <View style={styles.articleModalMeta}>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: getDifficultyColor(selectedArticle?.difficulty || 'beginner') }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(selectedArticle?.difficulty || 'beginner')}
                  </Text>
                </View>
                <View style={styles.durationBadge}>
                  <Clock size={12} color="#6C757D" />
                  <Text style={styles.durationText}>{selectedArticle?.duration}</Text>
                </View>
              </View>
              
              <View style={styles.articleActions}>
                <TouchableOpacity style={styles.listenButton}>
                  <Play size={16} color="#28A745" />
                  <Text style={styles.listenButtonText}>Reproducir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => selectedArticle && toggleFavorite(selectedArticle.id)}>
                  <Heart
                    size={24}
                    color={selectedArticle?.isFavorite ? '#DC3545' : '#6C757D'}
                    fill={selectedArticle?.isFavorite ? '#DC3545' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.articleContent}>
              {selectedArticle?.content}
            </Text>
            
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Artículos Relacionados</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allArticles.slice(0, 3).map((article) => (
                  <TouchableOpacity key={article.id} style={styles.relatedCard}>
                    <Text style={styles.relatedCardTitle}>{article.title}</Text>
                    <Text style={styles.relatedCardDuration}>{article.duration}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
  },
  articlesGrid: {
    gap: 12,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    marginLeft: 4,
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6C757D',
  },
  articleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  articleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#003DA5',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  listenButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#28A745',
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
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#212529',
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  articleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  articleModalMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  articleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  articleContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212529',
    lineHeight: 24,
    marginBottom: 32,
  },
  relatedSection: {
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 12,
  },
  relatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  relatedCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#212529',
    marginBottom: 4,
  },
  relatedCardDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6C757D',
  },
});