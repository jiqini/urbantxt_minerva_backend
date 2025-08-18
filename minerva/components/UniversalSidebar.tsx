import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { useConversations } from '../contexts/ConversationContext';
import { responsive } from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface UniversalSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  showChatManagement?: boolean;
}

export const UniversalSidebar: React.FC<UniversalSidebarProps> = ({ 
  isVisible, 
  onClose, 
  showChatManagement = false 
}) => {
  const { user, logout } = useUser();
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    switchConversation, 
    deleteConversation 
  } = useConversations();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
            router.replace('/LoginOrSignUp');
          }
        }
      ]
    );
  };

  const handleNavigateToChat = () => {
    onClose();
    router.push('/chatbot');
  };

  const handleNavigateToHome = () => {
    onClose();
    router.push('/');
  };

  const handleNavigateToDocuments = () => {
    onClose();
    router.push('/documents');
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* Background overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Sidebar content */}
      <View style={styles.sidebar}>
        {/* HEADER - FIXED HEIGHT */}
        <View style={styles.sidebarHeader}>
          {showChatManagement && (
            <TouchableOpacity style={styles.newChatButton} onPress={createNewConversation}>
              <Ionicons name="add" size={responsive.moderateScale(20)} color="#FFF" />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.closeSidebarButton} onPress={onClose}>
            <Ionicons name="close" size={responsive.moderateScale(24)} color="#666" />
          </TouchableOpacity>
        </View>

        {/* NAVIGATION - FIXED HEIGHT */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToHome}>
            <Ionicons name="home-outline" size={responsive.moderateScale(20)} color="#174AC9" />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToDocuments}>
            <Ionicons name="document-text-outline" size={responsive.moderateScale(20)} color="#174AC9" />
            <Text style={styles.navText}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToChat}>
            <Ionicons name="chatbubble-outline" size={responsive.moderateScale(20)} color="#174AC9" />
            <Text style={styles.navText}>Chat Legal</Text>
          </TouchableOpacity>
        </View>

        {/* CHAT MANAGEMENT (if enabled) */}
        {showChatManagement && (
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Conversaciones ({conversations.length})</Text>
            <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
              {conversations.map((conv) => (
                <View key={conv.id} style={styles.chatItemContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.chatItem,
                      conv.id === currentConversation?.id && styles.activeChatItem
                    ]}
                    onPress={() => {
                      switchConversation(conv.id);
                      onClose();
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={responsive.moderateScale(16)} color="#666" />
                    <Text style={[
                      styles.chatTitle,
                      conv.id === currentConversation?.id && styles.activeChatTitle
                    ]} numberOfLines={2}>
                      {conv.title}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Eliminar Conversación',
                        `¿Estás seguro que quieres eliminar "${conv.title}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Eliminar', 
                            style: 'destructive',
                            onPress: () => deleteConversation(conv.id)
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={responsive.moderateScale(16)} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* FLEXIBLE SPACER */}
        <View style={{ flex: 1 }} />

        {/* FOOTER - ALWAYS VISIBLE AT BOTTOM */}
        <View style={styles.simpleFooter}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={responsive.moderateScale(32)} color="#174AC9" />
            <Text style={styles.usernameText}>{user?.username}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={responsive.moderateScale(18)} color="#FF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 5, 0.3)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, // Start from very top
    left: 0,
    width: responsive.scale(280),
    height: screenHeight,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: responsive.scale(2), height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: responsive.scale(8),
    elevation: 5,
  },

  // HEADER - Responsive sizing
  sidebarHeader: {
    padding: responsive.scale(20),
    paddingTop: responsive.verticalScale(100),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#174AC9',
    paddingVertical: responsive.verticalScale(12),
    paddingHorizontal: responsive.scale(16),
    borderRadius: responsive.scale(8),
    marginBottom: responsive.verticalScale(16),
  },
  newChatText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: responsive.scale(8),
    fontSize: responsive.moderateScale(16),
  },
  closeSidebarButton: {
    position: 'absolute',
    top: responsive.verticalScale(50),
    right: responsive.scale(20),
    padding: responsive.scale(8),
  },

  // NAVIGATION - Responsive sizing
  navigationSection: {
    padding: responsive.scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.verticalScale(12),
    paddingHorizontal: responsive.scale(16),
    backgroundColor: '#F8F9FA',
    borderRadius: responsive.scale(8),
    marginBottom: responsive.verticalScale(8),
  },
  navText: {
    marginLeft: responsive.scale(12),
    fontSize: responsive.moderateScale(16),
    color: '#174AC9',
    fontWeight: '600',
  },

  // CHAT SECTION - Responsive sizing
  chatSection: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: responsive.moderateScale(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: responsive.verticalScale(12),
    paddingHorizontal: responsive.scale(16),
    paddingTop: responsive.verticalScale(16),
  },
  chatList: {
    flex: 1,
    paddingHorizontal: responsive.scale(16),
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.verticalScale(8),
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: responsive.scale(12),
    borderRadius: responsive.scale(8),
    backgroundColor: '#F8F9FA',
  },
  activeChatItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#174AC9',
  },
  chatTitle: {
    marginLeft: responsive.scale(12),
    fontSize: responsive.moderateScale(14),
    color: '#333',
    flex: 1,
  },
  activeChatTitle: {
    color: '#174AC9',
    fontWeight: '600',
  },
  deleteButton: {
    padding: responsive.scale(8),
    marginLeft: responsive.scale(8),
  },

  // FOOTER - Responsive sizing
  simpleFooter: {
    padding: responsive.scale(20),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    minHeight: responsive.verticalScale(100),
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsive.verticalScale(12),
    width: '100%',
  },

  usernameText: {
    marginLeft: responsive.scale(12),
    fontSize: responsive.moderateScale(16),
    fontWeight: '600',
    color: '#174AC9',
    flex: 1,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.verticalScale(10),
    paddingHorizontal: responsive.scale(12),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: responsive.scale(6),
    marginLeft: responsive.scale(10),
  },

  logoutText: {
    marginLeft: responsive.scale(6),
    fontSize: responsive.moderateScale(14),
    color: '#FF4444',
    fontWeight: '600',
  },
});

export default UniversalSidebar;