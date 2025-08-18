import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { useConversations } from '../contexts/ConversationContext';

// --- STEP DEFINITIONS ---
const steps = [
  // General questions (for all cases)
  {
    key: 'nombreCompleto',
    label: 'Nombre completo',
    help: 'Debe ser nombre y apellido, sin números ni iniciales.',
    validate: (v: string) =>
      /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+( [A-Za-zÁÉÍÓÚÑáéíóúñ]+)+$/.test(v.trim()),
    error: 'Por favor ingrese un nombre completo válido (nombre y apellido, sin números ni iniciales).',
  },
  {
    key: 'tipoCaso',
    label: 'Tipo de caso',
    help: '¿Es criminal, civil o familiar? Si no sabe, escriba "no sé" y describa su caso.',
    validate: (v: string) =>
      ['criminal', 'civil', 'familiar', 'no sé', 'nose', 'no se'].includes(v.trim().toLowerCase()),
    error: 'Debe ser "criminal", "civil", "familiar" o escriba "no sé".',
  },
  {
    key: 'descripcionCaso',
    label: 'Describa brevemente su caso',
    help: 'Explique lo que está pasando.',
    validate: (v: string, form: any) =>
      form.tipoCaso && form.tipoCaso.toLowerCase().startsWith('no') ? v.trim().length > 10 : true,
    error: 'Por favor describa su caso con al menos 10 caracteres.',
    optional: (form: any) => form.tipoCaso && !form.tipoCaso.toLowerCase().startsWith('no'),
    multiline: true,
  },
  // --- Family case questions ---
  {
    key: 'pensionAlimenticia',
    label: '¿Hay pensión alimenticia involucrada?',
    help: 'Responda sí o no.',
    validate: (v: string) => ['sí', 'si', 'no'].includes(v.trim().toLowerCase()),
    error: 'Responda sí o no.',
    caseTypes: ['familiar'],
  },
  // --- Civil case questions ---
  {
    key: 'contrato',
    label: '¿Existe un contrato firmado?',
    help: 'Responda sí o no.',
    validate: (v: string) => ['sí', 'si', 'no'].includes(v.trim().toLowerCase()),
    error: 'Responda sí o no.',
    caseTypes: ['civil'],
  },
  // --- Criminal case questions ---
  {
    key: 'denunciaPrevia',
    label: '¿Ha presentado denuncia previa?',
    help: 'Responda sí o no.',
    validate: (v: string) => ['sí', 'si', 'no'].includes(v.trim().toLowerCase()),
    error: 'Responda sí o no.',
    caseTypes: ['criminal'],
  },
  // --- General questions (for all) ---
  {
    key: 'edad',
    label: 'Edad',
    help: 'Ingrese su edad (solo números).',
    validate: (v: string) => /^\d{1,3}$/.test(v.trim()) && Number(v) > 10 && Number(v) < 120,
    error: 'Ingrese una edad válida.',
  },
  {
    key: 'profesion',
    label: 'Profesión u ocupación',
    help: 'Ejemplo: Abogado, Comerciante, Estudiante...',
    validate: (v: string) => true,
    error: '',
  },
  {
    key: 'dui',
    label: 'Número de DUI o pasaporte',
    help: 'Ejemplo: 01234567-8',
    validate: (v: string) => true,
    error: '',
  },
  {
    key: 'direccionResidencia',
    label: 'Dirección de residencia',
    help: 'Ingrese su dirección completa.',
    validate: (v: string) => true,
    error: '',
  },
  {
    key: 'notificaciones',
    label: 'Dirección para notificaciones',
    help: 'Correo electrónico o dirección física.',
    validate: (v: string) => true,
    error: '',
  },
  {
    key: 'hechos',
    label: 'Relación de los Hechos',
    help: 'Describa los hechos del caso.',
    validate: (v: string) => v.trim().length > 10,
    error: 'Describa los hechos con al menos 10 caracteres.',
    multiline: true,
  },
  {
    key: 'fundamento',
    label: 'Fundamento de Derecho',
    help: 'Fundamento legal (opcional).',
    validate: (v: string) => true,
    error: '',
    multiline: true,
  },
  {
    key: 'pretensiones',
    label: 'Pretensiones',
    help: '¿Qué solicita al juzgado?',
    validate: (v: string) => v.trim().length > 5,
    error: 'Describa sus pretensiones.',
    multiline: true,
  },
  {
    key: 'pruebas',
    label: 'Oferta de Pruebas',
    help: '¿Qué pruebas ofrece? (opcional)',
    validate: (v: string) => true,
    error: '',
    multiline: true,
  },
  {
    key: 'ciudadFirma',
    label: 'Ciudad de firma',
    help: 'Ciudad donde firma la demanda.',
    validate: (v: string) => true,
    error: '',
  },
  {
    key: 'fecha',
    label: 'Fecha',
    help: 'Seleccione la fecha.',
    validate: (v: string) => true,
    error: '',
    type: 'date',
  },
  {
    key: 'firma',
    label: 'Firma del demandante',
    help: 'Nombre completo como firma.',
    validate: (v: string) => true,
    error: '',
  },
];

// --- CASE TYPE DETECTION ---
function guessCaseType(description: string): string | null {
  const desc = description.toLowerCase();
  if (desc.match(/divorcio|custodia|pensión|familia|alimentos|visita/)) return 'familiar';
  if (desc.match(/contrato|deuda|alquiler|pago|civil/)) return 'civil';
  if (desc.match(/robo|violencia|delito|crimen|criminal/)) return 'criminal';
  return null;
}

export default function DraftLawsuitWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { createConversation, switchConversation } = useConversations();

  // --- FILTER STEPS BASED ON CASE TYPE ---
  const tipoCaso = form.tipoCaso?.toLowerCase();
  let filteredSteps = steps;
  if (tipoCaso && ['criminal', 'civil', 'familiar'].includes(tipoCaso)) {
    filteredSteps = steps.filter(
      s => !s.caseTypes || s.caseTypes.includes(tipoCaso)
    );
  }

  const current = filteredSteps[step];

  function handleNext() {
    if (!current) return;
    const value = form[current.key] || '';

    // If user just finished descripcionCaso after "no sé", try to guess case type
    if (
      current.key === 'descripcionCaso' &&
      tipoCaso &&
      tipoCaso.startsWith('no')
    ) {
      const detected = guessCaseType(value);
      if (detected) {
        setForm({ ...form, tipoCaso: detected });
        Alert.alert(
          'Tipo de caso detectado',
          `Detectamos que tu caso es de tipo: ${detected}. Se harán preguntas específicas para este tipo de caso.`
        );
        setStep(2); // Move to next step (filteredSteps will update)
        return;
      }
    }

    if (current.optional && current.optional(form)) {
      setError('');
      setStep(step + 1);
      return;
    }
    if (!current.validate(value, form)) {
      setError(current.error);
      return;
    }
    setError('');
    if (step < filteredSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/generate-lawsuit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Error generando PDF');
      const arrayBuffer = await response.arrayBuffer();
      const fileUri = FileSystem.cacheDirectory + 'demanda_judicial.pdf';
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(arrayBuffer).toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      const greetingMessage = {
        id: Date.now().toString(),
        text: '¡Hola! Soy Minerva, tu asistente legal para El Salvador. Puedo ayudarte con consultas sobre leyes, procedimientos legales y documentos. ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date(),
      }

      // 1. Create a new conversation with a unique id and name
      const newConversationId = `pdf-${Date.now()}`;
      createConversation({
        id: newConversationId,
        title: 'Demanda PDF',
        messages: [
          greetingMessage,
          {
            id: Date.now().toString(),
            text: '¡Tu demanda está lista! Descárgala aquí:',
            isUser: false,
            timestamp: new Date(),
            type: 'pdf',
            pdfEndpoint: fileUri,
            formData: form,
          }
        ]
      });

      // 2. Set this new conversation as current
      switchConversation(newConversationId);

      // 3. Navigate to chatbot (it will open the new conversation)
      router.replace('/(tabs)/chatbot');
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  }

  if (!current) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Error: Paso inválido en el wizard.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>{current.label}</Text>
        <TextInput
          placeholder={current.help}
          value={form[current.key] || ''}
          onChangeText={text => setForm({ ...form, [current.key]: text })}
          style={styles.input}
          multiline={!!current.multiline}
          keyboardType={current.type === 'date' ? 'default' : 'default'}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={step < filteredSteps.length - 1 ? "Siguiente" : "Generar Demanda"}
          onPress={handleNext}
          disabled={submitting}
        />
        {submitting && <ActivityIndicator style={{ marginTop: 16 }} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
