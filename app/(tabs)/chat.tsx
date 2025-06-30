import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, Mic, Send, Volume2, User, Bot, Sparkles, Zap } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/aiService';
import { speechService } from '@/services/speechService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  citations?: string[];
  suggestedActions?: string[];
}

export default function ChatScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy Minerva, tu asistente legal especializada en las leyes de El Salvador. Puedo ayudarte con consultas sobre procedimientos legales, plazos, documentos y más. ¿En qué puedo asistirte hoy?',
      isUser: false,
      timestamp: new Date(),
      suggestedActions: ['Consultar sobre demandas', 'Calcular plazos legales', 'Generar documentos']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiService.chat([
        { role: 'user', content: inputText }
      ]);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        citations: response.citations,
        suggestedActions: response.suggestedActions
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hay un problema con el servicio. Por favor verifica tu conexión e intenta más tarde.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await speechService.startListening(
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
    }
  };

  const speakMessage = async (message: string) => {
    try {
      await speechService.speak(message);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputText(action);
  };

  const quickQuestions = [
    '¿Cómo contesto una demanda?',
    '¿Cuáles son los plazos para apelar?',
    '¿Qué documentos necesito para divorcio?',
    '¿Cómo calculo pensión alimenticia?'
  ];

  return (
    <LinearGradient
      colors={['#0f172a', '#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <MessageSquare size={48} color="#f59e0b" strokeWidth={1.5} />
            <Sparkles size={24} color="#fbbf24" style={styles.sparkle} />
          </View>
          <Text style={styles.title}>{t('chat.title')}</Text>
          <Text style={styles.subtitle}>{t('chat.subtitle')}</Text>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Preguntas frecuentes:</Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => handleSuggestedAction(question)}
                >
                  <Zap size={16} color="#f59e0b" />
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={[
                  styles.avatarContainer,
                  { backgroundColor: message.isUser ? '#f59e0b' : '#10b981' }
                ]}>
                  {message.isUser ? (
                    <User size={16} color="#ffffff" />
                  ) : (
                    <Bot size={16} color="#ffffff" />
                  )}
                </View>
                {!message.isUser && (
                  <TouchableOpacity
                    style={styles.speakButton}
                    onPress={() => speakMessage(message.text)}
                  >
                    <Volume2 size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                
                {message.citations && message.citations.length > 0 && (
                  <View style={styles.citationsContainer}>
                    <Text style={styles.citationsTitle}>Referencias legales:</Text>
                    {message.citations.map((citation, index) => (
                      <Text key={index} style={styles.citation}>• {citation}</Text>
                    ))}
                  </View>
                )}
              </View>

              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <View style={styles.suggestedActionsContainer}>
                  <Text style={styles.suggestedActionsTitle}>{t('chat.suggested_actions')}:</Text>
                  {message.suggestedActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestedActionButton}
                      onPress={() => handleSuggestedAction(action)}
                    >
                      <Text style={styles.suggestedActionText}>{action}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={styles.messageHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: '#10b981' }]}>
                  <Bot size={16} color="#ffffff" />
                </View>
              </View>
              <View style={[styles.messageBubble, styles.aiMessage]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chat.placeholder')}
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
            />
            
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={startListening}
              >
                <Mic size={20} color={isListening ? "#ef4444" : "#64748b"} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <Send size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
          
          {isListening && (
            <Text style={styles.listeningText}>{t('chat.listening')}</Text>
          )}
        </View>
      </KeyboardAvoidingView>
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
  chatContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  quickQuestionsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickQuestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    flex: 1,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speakButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: '#f59e0b',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  citationsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  citationsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  citation: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#3b82f6',
    marginBottom: 2,
  },
  suggestedActionsContainer: {
    marginTop: 8,
    gap: 6,
  },
  suggestedActionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  suggestedActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  suggestedActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
  },
  inputContainer: {
    padding: 20,
    paddingTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  micButtonActive: {
    backgroundColor: '#fef2f2',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  listeningText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginTop: 8,
  },
});