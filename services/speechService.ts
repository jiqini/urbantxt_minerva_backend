import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

class SpeechService {
  private isListening = false;
  private recognition: any = null;

  async speak(text: string, language: string = 'es-ES'): Promise<void> {
    try {
      await Speech.speak(text, {
        language,
        pitch: 1.0,
        rate: 0.8,
        quality: Speech.VoiceQuality.Enhanced,
      });
    } catch (error) {
      console.error('Speech Error:', error);
    }
  }

  async startListening(onResult: (text: string) => void, onError?: (error: string) => void): Promise<void> {
    if (Platform.OS === 'web') {
      return this.startWebListening(onResult, onError);
    }
    
    // For mobile platforms, you would integrate with expo-speech or react-native-voice
    // This is a placeholder for the actual implementation
    console.log('Speech recognition not implemented for this platform');
  }

  private startWebListening(onResult: (text: string) => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        const error = 'Speech recognition not supported in this browser';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        const error = `Speech recognition error: ${event.error}`;
        onError?.(error);
        this.isListening = false;
        reject(new Error(error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();