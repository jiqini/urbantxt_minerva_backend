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
import SignUpImg from '../assets/svg/signUpImg.svg';
import BackArrow from '../assets/svg/backArrow.svg';
import RevealPasswordsIcon from '../assets/svg/revealPassword.svg';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const validateInputs = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre de usuario.');
      return false;
    }
    if (!emailOrPhone.trim()) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico o número de teléfono.');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'La contraseña no puede estar vacía.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
////////////////// Replace with server ip  /////////////////////////////

      const res = await fetch(`${process.env.SERVER_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, emailOrPhone, password }),
      });


      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', 'Cuenta creada exitosamente.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', data.message || 'Error al registrarse.');
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
      
      <SignUpImg width={186} height={183} />
      <Text style={styles.title}>Registrarse</Text>

      <TextInput
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico o teléfono"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry={!showPasswords}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpText}>Crear cuenta</Text>
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
    marginBottom: 30,
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
  signUpButton: {
    marginTop: 80,
    width: 338,
    height: 60,
    borderRadius: 64,
    backgroundColor: '#174AC9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  signUpText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
