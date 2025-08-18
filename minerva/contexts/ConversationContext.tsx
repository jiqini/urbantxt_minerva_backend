import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecureStorage } from '../utils/secureStorage';
import { useUser } from './UserContext';
import { generateUniqueId } from '../utils/uniqueId';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: string; // for PDF or other message types
  pdfEndpoint?: string;
  formData?: any;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addMessage: (text: string, isUser: boolean) => void;
  addPdfMessage: (pdfMessage: Omit<Message, 'id' | 'timestamp'>) => void;
  createNewConversation: () => void;
  createConversation: (conv: { id: string, title: string, messages: Message[] }) => void;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  saveConversations: () => Promise<void>;
  loadConversations: () => Promise<void>;
  backupToCloud: () => Promise<void>;
  isLoading: boolean;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const storedConversations = await SecureStorage.getSecureItem(`conversations_${user.id}`, user.id);
      if (storedConversations && Array.isArray(storedConversations)) {
        const parsedConversations = (storedConversations as Conversation[]).map((conv: any) => ({
          ...conv,
          lastUpdated: new Date(conv.lastUpdated),
          messages: (conv.messages as Message[]).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setCurrentConversation(parsedConversations[0]);
        }
      } else {
        createNewConversation();
      }
    } catch (error) {
      createNewConversation();
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversations = async () => {
    if (!user || conversations.length === 0) return;
    try {
      await SecureStorage.setSecureItem(`conversations_${user.id}`, conversations, user.id);
      const saveCount = await SecureStorage.getSecureItem(`save_count_${user.id}`, user.id) || 0;
      if (saveCount % 5 === 0) {
        await backupToCloud();
      }
      await SecureStorage.setSecureItem(`save_count_${user.id}`, saveCount + 1, user.id);
    } catch (error) {
      // handle error
    }
  };

  const backupToCloud = async () => {
    if (!user) return;
    try {
      // Only load the token at runtime, never hardcode it!
      const token = await SecureStorage.getSecureItem(`user_token_${user.id}`, user.id);
      if (!token) {
        console.warn('No user token found for cloud backup.');
        return;
      }
      const encryptedBackup = {
        userId: user.id,
        conversations: conversations,
        timestamp: new Date(),
        encrypted: true
      };
      const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/backup-conversations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(encryptedBackup),
      });
      if (!response.ok) {
        console.warn('⚠️ Cloud backup failed');
      }
    } catch (error) {
      console.warn('⚠️ Cloud backup error (continuing offline):', error);
    }
  };

    const addMessage = (text: string, isUser: boolean) => {
    setCurrentConversation(prev => {
      if (!prev) return prev;
      const newMessage: Message = {
        id: generateUniqueId(),
        text,
        isUser,
        timestamp: new Date(),
      };
      const updatedConversation = {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastUpdated: new Date(),
        title: prev.messages.length === 0
          ? text.substring(0, 30) + (text.length > 30 ? '...' : '')
          : prev.title
      };
      setConversations(convs =>
        convs.map(conv =>
          conv.id === prev.id ? updatedConversation : conv
        )
      );
      setTimeout(() => saveConversations(), 500);
      return updatedConversation;
    });
  };

  // Pdf message with unique ID
  const addPdfMessage = (pdfMessage: Omit<Message, 'id' | 'timestamp'>) => {
    setCurrentConversation(prev => {
      if (!prev) return prev;
      const newMessage: Message = {
        ...pdfMessage,
        id: generateUniqueId(),
        timestamp: new Date(),
      };
      const updatedConversation = {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastUpdated: new Date(),
      };
      setConversations(convs =>
        convs.map(conv =>
          conv.id === prev.id ? updatedConversation : conv
        )
      );
      setTimeout(() => saveConversations(), 500);
      return updatedConversation;
    });
  }

  const createNewConversation = () => {
  const greetingMessage: Message = {
    id: generateUniqueId(),
    text: '¡Hola! Soy Minerva, tu asistente legal para El Salvador. Puedo ayudarte con consultas sobre leyes, procedimientos legales y documentos. ¿En qué puedo ayudarte hoy?',
    isUser: false,
    timestamp: new Date(),
  };

  const newConversation: Conversation = {
    id: generateUniqueId(), // (optional, for conversation id)
    title: `Nueva Conversación`,
    messages: [greetingMessage], // Add greeting here!
    lastUpdated: new Date(),
  };
  const updatedConversations = [newConversation, ...conversations];
  setConversations(updatedConversations);
  setCurrentConversation(newConversation);
};

  // --- NEW: Create a conversation with custom title and initial messages ---
  const createConversation = (conv: { id: string, title: string, messages: Message[] }) => {
    const newConversation: Conversation = {
      id: conv.id,
      title: conv.title,
      messages: conv.messages,
      lastUpdated: new Date(),
    };
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversation(newConversation);
    setTimeout(() => saveConversations(), 500);
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(updatedConversations[0] || null);
      if (updatedConversations.length === 0) {
        createNewConversation();
      }
    }
    setTimeout(() => saveConversations(), 100);
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      currentConversation,
      addMessage,
      addPdfMessage,
      createNewConversation,
      createConversation,
      switchConversation,
      deleteConversation,
      saveConversations,
      loadConversations,
      backupToCloud,
      isLoading,
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
};