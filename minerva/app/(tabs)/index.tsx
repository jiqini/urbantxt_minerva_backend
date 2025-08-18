import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Button } from 'react-native';
import { SharedHeader } from '../../components/SharedHeader';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'expo-router';
import { responsive } from '../../utils/responsive';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <SharedHeader />
      <ScrollView style={styles.content}>
        <Text style={styles.welcome}>¡Bienvenido, {user?.username}!</Text>
        <Text style={styles.subtitle}>Tu asistente legal de confianza</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>🔒 Seguridad Avanzada</Text>
          <Text style={styles.cardText}>
            Tus conversaciones están protegidas con encriptación AES-256 y respaldo seguro en la nube.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>⚖️ Especialización Legal</Text>
          <Text style={styles.cardText}>
            IA especializada en leyes de El Salvador con detección de alucinaciones.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Redactar Demanda"
            onPress={() => router.push('/draft-lawsuit')}
            color="#174AC9"
          />
          <View style={{ height: 16 }}/>
          <Button
            title="Me estan demandando"
            onPress={() => router.push('/getting-sued')}
            color="#174AC9"
          />
        </View>
      </ScrollView>
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
    paddingTop: responsive.verticalScale(80), // Responsive top padding - pushes content down
    paddingHorizontal: responsive.scale(20), // Responsive horizontal padding
    paddingBottom: responsive.verticalScale(20), // Responsive bottom padding
  },
  welcome: {
    fontSize: responsive.moderateScale(24), // Responsive font size
    fontWeight: '600',
    color: '#174AC9',
    marginBottom: responsive.verticalScale(8), // Responsive margin
    marginTop: responsive.verticalScale(20), // Add top margin to push down further
    textAlign: 'center',
  },
  subtitle: {
    fontSize: responsive.moderateScale(16), // Responsive font size
    color: '#666',
    textAlign: 'center',
    marginBottom: responsive.verticalScale(30), // Responsive margin
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: responsive.scale(20), // Responsive padding
    borderRadius: responsive.scale(12), // Responsive border radius
    marginBottom: responsive.verticalScale(16), // Responsive margin
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardTitle: {
    fontSize: responsive.moderateScale(16), // Responsive font size
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.verticalScale(8), // Responsive margin
  },
  cardText: {
    fontSize: responsive.moderateScale(14), // Responsive font size
    color: '#666',
    lineHeight: responsive.moderateScale(20), // Responsive line height
  },
  buttonGroup: {
    marginTop: responsive.verticalScale(32), // Responsive margin
    alignItems: 'center',
    justifyContent: 'center',
  },
});