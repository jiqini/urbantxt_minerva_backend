import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#174AC9',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { 
          backgroundColor: '#FFF', 
          height: 80, 
          paddingBottom: 20 
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="documents" options={{ title: 'Documentos', tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} /> }} />
      <Tabs.Screen name="chatbot" options={{ title: 'Minerva AI', tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} /> }} />    </Tabs>
  );
}