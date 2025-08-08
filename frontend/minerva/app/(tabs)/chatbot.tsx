import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy Minerva, tu asistente legal para El Salvador. Puedo ayudarte con consultas sobre leyes, procedimientos legales y documentos. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'Chat actual', timestamp: new Date() },
  ]);
  const [currentChatId, setCurrentChatId] = useState('1'); // NEW: Track current chat

  //New state for editing functionality
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const sidebarAnimation = useRef(new Animated.Value(-screenWidth * 0.8)).current;

  const toggleSidebar = () => {
    const toValue = showSidebar ? -screenWidth * 0.8 : 0;
    
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowSidebar(!showSidebar);
  };

  //Generate chat title from first message
  const generateChatTitle = (message: string) => {
    //Take first 30 characters and add "..." if longer
    const title = message.length > 30
    ? message.substring(0, 30) + '...'
    : message.trim();

    return title || 'New Chat';
  }

  //Switch from chat to chat
  const switchToChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setMessages([
      {
        id: '1',
        text: '¡Hola! Soy Minerva, tu asistente legal para El Salvador. Puedo ayudarte con consultas sobre leyes, procedimientos legales y documentos. ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toggleSidebar(); // Close sidebar after switching
  };

  // NEW: Delete chat function
  const deleteChat = (chatId: string) => {
    if (chats.length <= 1) {
      Alert.alert('Error', 'No puedes eliminar el último chat.');
      return;
    }

    Alert.alert(
      'Eliminar Chat',
      '¿Estás seguro de que quieres eliminar este chat?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedChats = chats.filter(chat => chat.id !== chatId);
            setChats(updatedChats);
            
            // If we deleted the current chat, switch to the first one
            if (chatId === currentChatId) {
              const newCurrentChat = updatedChats[0];
              setCurrentChatId(newCurrentChat.id);
              switchToChat(newCurrentChat.id);
            }
          },
        },
      ]
    );
  };

  // UPDATED: Create new chat function
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      timestamp: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([
      {
        id: '1',
        text: '¡Hola! Soy Minerva, tu asistente legal para El Salvador. Puedo ayudarte con consultas sobre leyes, procedimientos legales y documentos. ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toggleSidebar();
  };

  // Edit chat title
  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  }

  //Save edited chat title
  const saveTitle = () => {
    if (editingTitle.trim()) {
      setChats(prev => prev.map(chat =>
        chat.id === editingChatId
          ? { ...chat, title: editingTitle.trim() }
          : chat
      ));
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  // cancel editing
   const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  // Send message with auto-naming functionaltiy
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

  // Added auto name chat if first user message
  const currentChat = chats.find(chat => chat.id === currentChatId);
    if (currentChat && messages.length === 1) { // Only welcome message exists
      const newTitle = generateChatTitle(userMessage.text);
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: newTitle }
          : chat
      ));
    }

    setInputText('');
    setIsLoading(true);

    try {
      // Use your backend server URL
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage.text }],
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const aiResponse = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageBubble,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.botMessageText,
      ]}>
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  const renderSidebar = () => (
    <Animated.View 
      style={[
        styles.sidebar,
        { transform: [{ translateX: sidebarAnimation }] }
      ]}
    >
      <View style={styles.sidebarHeader}>
        <TouchableOpacity style={styles.newChatButton} onPress={createNewChat}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeSidebarButton} onPress={toggleSidebar}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

<ScrollView style={styles.chatList}>
        {chats.map((chat, index) => (
          <View key={chat.id} style={styles.chatItemContainer}>
            <TouchableOpacity 
              style={[
                styles.chatItem,
                chat.id === currentChatId && styles.activeChatItem
              ]}
              onPress={() => switchToChat(chat.id)}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              
              {/* ✅ ADDED: Conditional rendering for edit mode */}
              {editingChatId === chat.id ? (
                <TextInput
                  style={styles.editTitleInput}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  onSubmitEditing={saveTitle}
                  onBlur={cancelEditing}
                  autoFocus
                  maxLength={50}
                />
              ) : (
                <Text 
                  style={[
                    styles.chatTitle,
                    chat.id === currentChatId && styles.activeChatTitle
                  ]}
                  // ✅ ADDED: Long press to edit
                  onLongPress={() => startEditingTitle(chat.id, chat.title)}
                >
                  {chat.title}
                </Text>
              )}
            </TouchableOpacity>
            
            {/* ✅ ENHANCED: Action buttons with edit/save/cancel functionality */}
            <View style={styles.chatActions}>
              {editingChatId === chat.id ? (
                <>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={saveTitle}
                  >
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={cancelEditing}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => startEditingTitle(chat.id, chat.title)}
                  >
                    <Ionicons name="pencil" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => deleteChat(chat.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF4444" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#174AC9" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}

          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <Text style={styles.loadingText}>Minerva está procesando tu consulta...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Pregunta sobre leyes de El Salvador..."
            placeholderTextColor="#7D7D7D"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>

    {/* Sidebar */}
    {renderSidebar()}

    {/* Overlay when sidebar is open */}
    {showSidebar && (
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={toggleSidebar}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#174AC9',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFF',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  sendButton: {
    backgroundColor: '#174AC9',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Sidebar Styles
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth * 0.8,
    height: '100%',
    backgroundColor: '#FFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#174AC9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  closeSidebarButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  // NEW STYLES FOR CHAT SWITCHING & DELETE:
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  activeChatItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#174AC9',
  },
  chatTitle: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  activeChatTitle: {
    color: '#174AC9',
    fontWeight: '600',
  },
  chatActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  editTitleInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#174AC9',
    paddingVertical: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
});
