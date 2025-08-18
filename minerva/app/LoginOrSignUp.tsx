import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import { router } from 'expo-router';
import PillarLogo from '../assets/svg/pillarLogo.svg';

export default function loginOrSignUpScreen() {


  const handleLogin = async () => {
    // router.replace('/(tabs)'); //will keep for testing purposes
    //login process
    router.replace('/login');
  };
  const handleSignup = async () => {
    router.replace('/signUp');
  };


  return (
       <View style={styles.container}>
            <PillarLogo width={67} height={67} style={{ marginTop: 20 }} />
            <Text style={styles.title}>Minerva</Text>
            <Text style={styles.text}>
              “Explora la ley de manera experta {'\n'} y con facilidad”
            </Text>


            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>


              <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                <Text style={styles.signupButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </View>
       </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    paddingTop: 20,
  },
  text: {
    color: '#28333A',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    paddingTop: 20,
    paddingHorizontal: 30,
    marginBottom: 480,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: 385,
    backgroundColor: '#174AC9',
    borderTopLeftRadius: 41,
    borderTopRightRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    width: 338,
    height: 60,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
  },
  signupButton: {
    width: 338,
    height: 60,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#006FF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  loginButtonText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  signupButtonText: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '700',
  }
});
