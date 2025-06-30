import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  authenticate: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll simulate biometric availability
      setIsBiometricEnabled(false);
      return;
    }

    try {
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
      setIsBiometricEnabled(biometricEnabled === 'true');
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      // For web, simulate authentication
      setIsAuthenticated(true);
      return true;
    }

    try {
      if (isBiometricEnabled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access Minerva',
          fallbackLabel: 'Use PIN',
        });
        if (result.success) {
          setIsAuthenticated(true);
          return true;
        }
      } else {
        // For demo purposes, allow without biometric
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
    return false;
  };

  const enableBiometric = async () => {
    if (Platform.OS === 'web') {
      // For web, just toggle the state
      setIsBiometricEnabled(!isBiometricEnabled);
      return;
    }

    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (available && enrolled) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        setIsBiometricEnabled(true);
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isBiometricEnabled,
      authenticate,
      enableBiometric,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}