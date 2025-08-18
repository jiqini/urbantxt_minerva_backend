import { responsive } from '../../utils/responsive';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedHeader } from '../../components/SharedHeader';
import { useConversations } from '../../contexts/ConversationContext';
import { useUser } from '../../contexts/UserContext';
import { SecureStorage } from '../../utils/secureStorage';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

// 📨 Message interface extended for PDF support
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: string; // 'pdf' for PDF messages
  pdfEndpoint?: string;
  formData?: any;
}

export default function ChatbotScreen() {
  // SECURE USER CONTEXT
  const { user } = useUser();
  const { currentConversation, addMessage, addPdfMessage } = useConversations();

  console.log('Current conversation messages:', currentConversation?.messages);

  // 💬 CHAT STATE
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // 📄 PDF download and open handler (MOBILE SAFE)
  async function downloadAndOpenPDF(pdfEndpoint: string, formData: any) {
    try {
      const response = await fetch(pdfEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('No se pudo generar el PDF');

      // Get the PDF as an arrayBuffer and save as base64
      const arrayBuffer = await response.arrayBuffer();
      const fileUri = FileSystem.cacheDirectory + 'demanda_judicial.pdf';
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(arrayBuffer).toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Open the sharing dialog
      await Sharing.shareAsync(fileUri);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo abrir el PDF');
    }
  }

  // 🚀 SEND MESSAGE FUNCTION
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 🔐 ALSO ADD TO SECURE CONVERSATION CONTEXT
    if (currentConversation) {
      addMessage(inputText.trim(), true);
    }

    setInputText('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending secure message to AI...');
      
      // 🔐 SECURE API CALL WITH AUTHENTICATION
      const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await SecureStorage.getSecureItem(`user_token_${user?.id}`, user?.id || '')}`
        },
        body: JSON.stringify({
          messages: [{ content: inputText.trim() }],
          userId: user?.id || 'default'  
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const aiResponse = await response.json();

      console.log('🤖 AI response:', aiResponse);

      // If the AI triggers a PDF generation, inject a PDF message
      if (aiResponse.pdfReady && aiResponse.formData) {
        if (currentConversation) {
          addPdfMessage({
            text: '¡Tu demanda está lista! Descárgala aquí:',
            isUser: false,
            type: 'pdf',
            pdfEndpoint: 'http://192.168.1.22:5001/generate-lawsuit', // or your backend URL
            formData: aiResponse.formData
          });
        }
      }

      if (currentConversation) {
        addMessage(aiResponse.response || aiResponse.message, false);
      }

      console.log('✅ AI response received and encrypted');
    } catch (error) {
      console.error('❌ Secure chat error:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 AUTO-SCROLL
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [currentConversation?.messages]);

  // 💬 MESSAGE RENDER
  const renderMessage = (message: Message, index: number) => {
    // 📄 Special rendering for PDF messages
    if (message.type === 'pdf') {
      return (
        <View
          key={message.id}
          style={[
            styles.messageBubble,
            styles.botMessage,
          ]}
        >
          <Text style={styles.botMessageText}>{message.text}</Text>
          <TouchableOpacity
            style={[styles.sendButton, { marginTop: 8 }]}
            onPress={() => downloadAndOpenPDF(message.pdfEndpoint!, message.formData)}
          >
            <Text style={styles.sendButtonText}>Descargar PDF</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Default rendering for normal messages
    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          message.isUser ? styles.userMessage : styles.botMessage,
          index === 0 && { marginTop: 110 }, // Add top margin only for the first message
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <SharedHeader showBurger={true} showChatManagement={true} />

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentConversation?.messages.map(renderMessage)}

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
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 2,
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
    marginTop: 10,
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
    padding: 12,
    paddingBottom: 10,
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
});