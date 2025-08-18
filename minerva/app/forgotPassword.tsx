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
import BackArrow from '../assets/svg/backArrow.svg';
import RevealPasswordsIcon from '../assets/svg/revealPassword.svg';
import SuccessMark from '../assets/svg/Successmark.svg';

export default function RecoverPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '']);
  const [testCode, setTestCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const generateAndSendCode = () => {
    const generated = Math.floor(10000 + Math.random() * 90000).toString();
    setTestCode(generated);
    Alert.alert('TEST:', `Code for ${email}: ${generated}`);
  };

  const handleUpdatePassword = async () => {
  try {
// backend api call
    const payload = {
      email,
      newPassword: password,
    };

    console.log("Updating password for:", payload);

    // const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/update-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    // const data = await res.json();
    // if (data.success) {
    //   setStep(prev => prev + 1);
    // } else {
    //   Alert.alert("Error", data.message || "No se pudo actualizar la contraseña");
    // }

    // TEMP: simulate success
    setStep(prev => prev + 1);
  } catch (err) {
    Alert.alert("Error", "Ocurrió un error al actualizar la contraseña.");
  }
};


  const handleNext = () => {
  if (step === 1) {
    generateAndSendCode();
    setStep(prev => prev + 1);
  } else if (step === 4) {
    handleUpdatePassword(); // backend placeholder
  } else if (step === 5) {
    router.replace('/login');
  } else {
    setStep(prev => prev + 1);
  }
};

  const handleCodeChange = (text: string, index: number): void => {
    if (/^\d?$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
    }
  };

  const isCodeValid = code.join('') === testCode;

  const shouldDisableButton =
    (step === 2 && !isCodeValid) ||
    (step === 4 && (password.length < 6 || password !== confirmPassword));

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Restablecer Contraseña</Text>
            <Text style={styles.stepText}>Por favor entre su correo electrónico.</Text>
            <Text style={styles.inputHeader}>Correo Electrónico</Text>
            <TextInput
              placeholder="Entre su correo electrónico"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Revisa tu correo.</Text>
            <Text style={styles.stepText}>
              Enviamos un enlace a alpha...@gmail.com. Ingresa el código de 5 dígitos del correo.
            </Text>
            <View style={styles.codeInputContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  style={styles.codeInput}
                />
              ))}
            </View>
            <View style={{ position: 'absolute', left: 0, top: 250, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.resendText]}>
                ¿No recibiste el correo?{' '}
                <Text onPress={generateAndSendCode} style={styles.resendLink}>
                  Reenviar
                </Text>
              </Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Actualizar Contraseña</Text>
            <Text style={styles.stepText}>Tu contraseña se ha restablecido con éxito. Confirma para establecer una nueva contraseña.</Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Establece una nueva contraseña</Text>
            <Text style={styles.stepText}>
              Crea una nueva contraseña. Asegúrate de que sea diferente a las anteriores por seguridad
            </Text>

            <View style={styles.passwordContainer}>
              <Text style={styles.passwordHeader}>Contraseña</Text>
              <TextInput
                placeholder="Entre su nueva contraseña"
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                secureTextEntry={!showPasswords}
              />
            </View>

            <View style={styles.passwordContainerTwo}>
              <Text style={styles.passwordHeader}>Confirme su contraseña</Text>
              <TextInput
                placeholder="reingrese su contraseña"
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

            {password && confirmPassword && password !== confirmPassword && (
              <Text style={{ color: 'red', marginTop: 10 }}>
                Las contraseñas no coinciden.
              </Text>
            )}
          </View>
        );
      case 5:
        return (
            <View style={styles.contentContainer}>
              <SuccessMark width={62} height={62} style={{ marginTop: 55 }} />
              <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
              <Text style={styles.successText}>¡Felicidades! Tu contraseña ha sido cambiada. Continua para iniciar sesión.</Text>
            </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.replace('/login')}
        style={styles.backArrow}
      >
        <BackArrow width={40} height={40} />
      </TouchableOpacity>

      <View style={styles.stepContent}>{renderStepContent()}</View>

      <TouchableOpacity
        style={[
          styles.resetButton,
          step <= 2 && styles.firstToSecondButton,
          step === 3 && styles.ThirdButton,
          step >= 4 && { position: 'absolute', top: 400 },
        ]}
        onPress={handleNext}
        disabled={shouldDisableButton}
      >
        <Text style={styles.resetText}>
          {step === 1
            ? 'Restablecer Contraseña'
            : step === 2
            ? 'Verificar Código'
            : step === 3
            ? 'Confirmar'
            : step >= 4
            ? 'Actualizar Contraseña'
            : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 25,
  },
  stepContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  title: {
    color: '#1E1E1E',
    fontFamily: 'OpenSans',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 35,
    position: 'absolute',
    left: 0,
  },
  stepText: {
    fontSize: 15,
    color: '#00000091',
    position: 'absolute',
    top: 33,
    left: 0,
    lineHeight: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#00000091',
    lineHeight: 24,
  },
  input: {
    width: '95%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    fontSize: 14,
    marginTop: 5,
  },
  inputHeader: {
    color: '#2A2A2A',
    fontFamily: 'OpenSans',
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginTop: 65,
  },
  resetButton: {
    width: '95%',
    height: 53,
    borderRadius: 10,
    backgroundColor: '#174AC9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  firstToSecondButton: {
    position: 'absolute',
    top: 295,
  },
  ThirdButton: {
    position: 'absolute',
    top: 225,
  },
  resetText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginTop: 90,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    textAlign: 'center',
    fontSize: 24,
  },
  resendLink: {
    color: '#174AC9',
    fontWeight: '600',
  },
  passwordInput: {
    paddingRight: 40,
    paddingLeft: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    fontSize: 14,
    height: 50,
    width: '100%',
    marginTop: 0,
  },
  eyeBox: {
    position: 'absolute',
    right: 25,
    top: 10,
    zIndex: 10,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 75,
  },
  passwordContainerTwo: {
    width: '100%',
    position: 'relative',
    marginTop: 10,
  },
  passwordHeader: {
    color: '#2A2A2A',
    fontFamily: 'OpenSans',
    fontSize: 16,
    paddingBottom: 5,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  successTitle: {
    color: '#1E1E1E',
    fontFamily: 'OpenSans',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 35,
  },
  successText: {
    color: '#989898',
    fontFamily: 'OpenSans',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '400',
  },
});
