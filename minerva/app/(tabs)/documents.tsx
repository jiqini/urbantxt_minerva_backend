import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { SharedHeader } from '../../components/SharedHeader';

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.container}> 
      <SharedHeader />
      <View style={styles.content}>
        <Text style={styles.comingSoon}>📄 Próximamente</Text>
        <Text style={styles.description}>
          Gestión de documentos legales con cifrado de extremo a extremo
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#174AC9',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});