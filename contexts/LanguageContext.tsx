import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Navigation
    'nav.wizard': 'Asistente',
    'nav.documents': 'Documentos',
    'nav.deadlines': 'Plazos',
    'nav.chat': 'Chat IA',
    'nav.resources': 'Recursos',
    
    // Common
    'common.continue': 'Continuar',
    'common.back': 'Atrás',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.generate': 'Generar',
    'common.download': 'Descargar',
    'common.share': 'Compartir',
    
    // Authentication
    'auth.welcome': 'Bienvenido a Minerva',
    'auth.subtitle': 'Tu asistente legal de bolsillo',
    'auth.biometric': 'Usar autenticación biométrica',
    'auth.start': 'Comenzar',
    'auth.disclaimer': 'Minerva brinda información educativa, no asesoría legal.',
    
    // Wizard
    'wizard.title': 'Asistente de Casos',
    'wizard.subtitle': 'Te ayudo a identificar tu situación legal',
    'wizard.question1': '¿Cuál es tu situación?',
    'wizard.option1': 'Me demandaron',
    'wizard.option2': 'Quiero demandar',
    'wizard.option3': 'Tengo una audiencia',
    'wizard.option4': 'Necesito información',
    
    // Documents
    'docs.title': 'Constructor de Documentos',
    'docs.subtitle': 'Genera documentos legales completos',
    'docs.templates': 'Plantillas Disponibles',
    'docs.recent': 'Documentos Recientes',
    'docs.demanda': 'Demanda',
    'docs.contestacion': 'Contestación',
    'docs.apelacion': 'Apelación',
    'docs.generate': 'Generar Documento',
    'docs.form.title': 'Completar Información',
    'docs.form.required': 'Campo requerido',
    
    // Deadlines
    'deadlines.title': 'Gestor de Plazos',
    'deadlines.subtitle': 'Nunca pierdas una fecha importante',
    'deadlines.upcoming': 'Próximos Plazos',
    'deadlines.add': 'Agregar Plazo',
    'deadlines.days_left': 'días restantes',
    'deadlines.add_to_calendar': 'Agregar al Calendario',
    
    // Chat
    'chat.title': 'Asistente IA',
    'chat.subtitle': 'Pregúntame sobre leyes de El Salvador',
    'chat.placeholder': 'Escribe tu pregunta o usa el micrófono...',
    'chat.listening': 'Escuchando...',
    'chat.speak': 'Hablar',
    'chat.suggested_actions': 'Acciones Sugeridas',
    
    // Resources
    'resources.title': 'Recursos Legales',
    'resources.subtitle': 'Encuentra ayuda cerca de ti',
    'resources.courts': 'Tribunales',
    'resources.mediation': 'Centros de Mediación',
    'resources.probono': 'Clínicas Pro Bono',
    'resources.library': 'Biblioteca Legal',
    'resources.call': 'Llamar',
    'resources.directions': 'Direcciones',
  },
  en: {
    // Navigation
    'nav.wizard': 'Wizard',
    'nav.documents': 'Documents',
    'nav.deadlines': 'Deadlines',
    'nav.chat': 'AI Chat',
    'nav.resources': 'Resources',
    
    // Common
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.generate': 'Generate',
    'common.download': 'Download',
    'common.share': 'Share',
    
    // Authentication
    'auth.welcome': 'Welcome to Minerva',
    'auth.subtitle': 'Your pocket legal assistant',
    'auth.biometric': 'Use biometric authentication',
    'auth.start': 'Get Started',
    'auth.disclaimer': 'Minerva provides educational information, not legal advice.',
    
    // Wizard
    'wizard.title': 'Case Wizard',
    'wizard.subtitle': 'I help you identify your legal situation',
    'wizard.question1': 'What is your situation?',
    'wizard.option1': 'I was sued',
    'wizard.option2': 'I want to sue',
    'wizard.option3': 'I have a hearing',
    'wizard.option4': 'I need information',
    
    // Documents
    'docs.title': 'Document Builder',
    'docs.subtitle': 'Generate complete legal documents',
    'docs.templates': 'Available Templates',
    'docs.recent': 'Recent Documents',
    'docs.demanda': 'Lawsuit',
    'docs.contestacion': 'Answer',
    'docs.apelacion': 'Appeal',
    'docs.generate': 'Generate Document',
    'docs.form.title': 'Complete Information',
    'docs.form.required': 'Required field',
    
    // Deadlines
    'deadlines.title': 'Deadline Manager',
    'deadlines.subtitle': 'Never miss an important date',
    'deadlines.upcoming': 'Upcoming Deadlines',
    'deadlines.add': 'Add Deadline',
    'deadlines.days_left': 'days left',
    'deadlines.add_to_calendar': 'Add to Calendar',
    
    // Chat
    'chat.title': 'AI Assistant',
    'chat.subtitle': 'Ask me about El Salvador laws',
    'chat.placeholder': 'Type your question or use the microphone...',
    'chat.listening': 'Listening...',
    'chat.speak': 'Speak',
    'chat.suggested_actions': 'Suggested Actions',
    
    // Resources
    'resources.title': 'Legal Resources',
    'resources.subtitle': 'Find help near you',
    'resources.courts': 'Courts',
    'resources.mediation': 'Mediation Centers',
    'resources.probono': 'Pro Bono Clinics',
    'resources.library': 'Legal Library',
    'resources.call': 'Call',
    'resources.directions': 'Directions',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}