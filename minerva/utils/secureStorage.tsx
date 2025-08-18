import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureStorage {
  private static readonly APP_SECRET = 'MINERVA_LEGAL_AI_2024_SECURE_KEY';

  // Simple but secure encoding for Expo
  private static encode(data: any, userId: string): string {
  try {
    const jsonString = JSON.stringify(data);
    const salt = userId + this.APP_SECRET;
    let encoded = '';
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      encoded += String.fromCharCode(charCode ^ saltChar);
    }
    // --- UTF-8 SAFE BASE64 ENCODE ---
    const utf8Bytes = new TextEncoder().encode(encoded);
    return btoa(String.fromCharCode(...utf8Bytes));
  } catch (error) {
    console.error('❌ Encoding error:', error);
    throw error;
  }
}

  private static decode(encoded: string, userId: string): any {
  try {
    // --- UTF-8 SAFE BASE64 DECODE ---
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);

    const salt = userId + this.APP_SECRET;
    let original = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      original += String.fromCharCode(charCode ^ saltChar);
    }
    return JSON.parse(original);
  } catch (error) {
    console.error('❌ Decoding error:', error);
    return null;
  }
}

  // Store data with encoding
  static async setSecureItem(key: string, value: any, userId: string): Promise<void> {
    try {
      const encoded = this.encode(value, userId);
      await AsyncStorage.setItem(key, encoded);
      console.log(`🔒 Encoded data stored for key: ${key}`);
    } catch (error) {
      console.error('❌ Error storing encrypted data:', error);
      throw error;
    }
  }

  // Retrieve and decode data
  static async getSecureItem(key: string, userId: string): Promise<any> {
    try {
      const encoded = await AsyncStorage.getItem(key);
      if (!encoded) return null;

      const decoded = this.decode(encoded, userId);
      console.log(`🔓 Decoded data retrieved for key: ${key}`);
      return decoded;
    } catch (error) {
      console.error('❌ Error retrieving data:', error);
      return null;
    }
  }

  // Remove data
  static async removeSecureItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Removed data for key: ${key}`);
    } catch (error) {
      console.error('❌ Error removing data:', error);
    }
  }

  // Clear all user data (for logout)
  static async clearUserData(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      await AsyncStorage.multiRemove(userKeys);
      console.log(`🧹 Cleared all data for user: ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }
}