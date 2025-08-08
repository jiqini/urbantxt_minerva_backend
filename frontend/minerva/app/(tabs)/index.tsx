import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minerva Legal</Text>
        <Text style={styles.subtitle}>Tu asistente legal para El Salvador</Text>
      </View>

      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => router.push('/(tabs)/chatbot')}
      >
        <Ionicons name="chatbubbles" size={40} color="#FFF" />
        <Text style={styles.cardTitle}>Consulta con Minerva</Text>
        <Text style={styles.cardText}>Haz preguntas sobre leyes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F3FF' },
  header: { padding: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#174AC9', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  chatCard: { 
    backgroundColor: '#174AC9', 
    margin: 20, 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 10 },
  cardText: { fontSize: 16, color: '#FFF', marginTop: 5 },
});