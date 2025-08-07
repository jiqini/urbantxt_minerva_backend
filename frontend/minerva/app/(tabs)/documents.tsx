import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Documentos</Text>
      <Text style={styles.subtitle}>Próximamente...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F3FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#174AC9' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});