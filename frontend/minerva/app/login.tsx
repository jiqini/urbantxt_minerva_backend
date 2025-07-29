import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import LoginImg from '../assets/svg/loginImg.svg';
import BackArrow from '../assets/svg/backArrow.svg';
import RevealPasswordsIcon from '../assets/svg/revealPassword.svg';
import GoogleIcon from '../assets/svg/GOOG-0ed88f7c 1.svg';

export default function loginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const validateInputs = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre de usuario.');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'La contraseña no puede estar vacía.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
  if (!validateInputs()) return;

  try {
    const res = await fetch(`${process.env.SERVER_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      Alert.alert('Éxito', 'Sesión iniciada correctamente.');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', data.message || 'Error al iniciar sesión.');
    }
  } catch (err) {
    Alert.alert('Error', 'No se pudo conectar al servidor.');
  }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/LoginOrSignUp')} style={{ position: 'absolute', top: 50, left: 25 }}>
        <BackArrow width={40} height={40} />
      </TouchableOpacity>

      <LoginImg width={186} height={183} style={{ marginTop: 90 }} />
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPasswords}
        />
        <TouchableOpacity
          onPress={() => setShowPasswords(!showPasswords)}
          style={styles.eyeBox}
        >
          <RevealPasswordsIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgetPasswordButton} onPress={() => router.replace('/forgotPassword')}>
        <Text style={styles.forgetPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', flexDirection: 'row' }}>
        <View style={styles.dash} />
        <Text style={styles.continueWithText}>O continuar con</Text>
        <View style={styles.dash} />
      </View>

      <TouchableOpacity style={styles.loginWithGoogleButton} onPress={handleLogin}>
        <GoogleIcon width={32} height={32} style={{ position: 'absolute', left: 55, top: 8 }} />
        <Text style={styles.loginWithGoogleText}>Iniciar con Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700',
    paddingTop: 20,
    marginBottom: 35,
  },
  input: {
    width: 338,
    height: 45,
    padding: 12,
    marginTop: 40,
    backgroundColor: '#FFF',
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#FFF',
    fontSize: 14,
  },
  passwordContainer: {
    width: 338,
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
    paddingLeft: 12,
    backgroundColor: '#FFF',
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#FFF',
    fontSize: 14,
    height: 45,
    marginTop: 40,
  },
  eyeBox: {
    position: 'absolute',
    right: 25,
    top: 50,
    zIndex: 10,
  },
  loginButton: {
    marginTop: 32,
    width: 338,
    height: 60,
    borderRadius: 64,
    backgroundColor: '#174AC9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    marginBottom: 40,
  },
  loginText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dash: {
    width: 58,
    height: 1,
    marginTop: 8,
    backgroundColor: '#000',
  },
  continueWithText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 10,
    fontStyle: 'normal',
    fontWeight: 400,
    marginHorizontal: 10,
  },
  loginWithGoogleButton: {
    width: 338,
    height: 47,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 90,
  },
  forgetPasswordButton: {
    backgroundColor: 'transparent',
    marginTop: 32,
    marginLeft: 170,
    width: 200,
  },
  forgetPasswordText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600', 
  },
  loginWithGoogleText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
  },
});
