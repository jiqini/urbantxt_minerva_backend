import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '../utils/secureStorage';

interface User {
  id: string;
  username: string;
  emailOrPhone: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app start
  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      console.log('🔍 Checking for stored user session...');
      
      // Try to get user from unencrypted storage first (for user ID)
      const basicUserData = await AsyncStorage.getItem('user_basic');
      if (basicUserData) {
        const userData = JSON.parse(basicUserData);
        
        // Verify token with encrypted storage
        const secureToken = await SecureStorage.getSecureItem(`user_token_${userData.id}`, userData.id);
        
        if (secureToken) {
          setUser(userData);
          console.log('✅ User session restored successfully');
        } else {
          console.log('⚠️ Token verification failed, clearing session');
          await AsyncStorage.removeItem('user_basic');
        }
      }
    } catch (error) {
      console.error('❌ Error checking stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token: string) => {
    try {
      console.log('🔐 Saving user session securely...');
      
      // Store basic user data (unencrypted for quick access)
      await AsyncStorage.setItem('user_basic', JSON.stringify(userData));
      
      // Store sensitive token (encrypted)
      await SecureStorage.setSecureItem(`user_token_${userData.id}`, token, userData.id);
      
      setUser(userData);
      console.log('✅ User login saved securely');
    } catch (error) {
      console.error('❌ Error storing user data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out and clearing all data...');
      
      if (user) {
        // Clear all user data (encrypted conversations, tokens, etc.)
        await SecureStorage.clearUserData(user.id);
      }
      
      // Clear basic user data
      await AsyncStorage.removeItem('user_basic');
      
      setUser(null);
      console.log('✅ Logout completed, all data cleared');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};