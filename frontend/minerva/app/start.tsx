import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import PillarLogo from '../assets/svg/pillarLogo.svg';
import FirstProgressImg from '../assets/svg/FirstProgressimage.svg';
import SecondProgressImg from '../assets/svg/secondProgressImage.svg';
import LoginOrSignUp from './LoginOrSignUp';
import ThirdProgressBackground from '../assets/svg/thirdProgressBackground.svg';
import ThirdProgressImage from '../assets/images/progessImage.png';

const BOX_COUNT = 3;
const BOX_WIDTH = 30;
const BOX_HEIGHT = 3;
const BOX_GAP = 25;

export default function StartScreen() {
  const [step, setStep] = useState(0);
  const buttonWidth = useRef(new Animated.Value(145)).current;

  const handlePress = () => {
    if (step === 0) {
      Animated.timing(buttonWidth, {
        toValue: 259,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    if (step >= BOX_COUNT) {
      setStep(prev => prev + 1); 
    } else {
      setStep(prev => prev + 1);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <PillarLogo width={67} height={67} style={{ marginTop: 20 }} />
            <Text style={styles.title}>Minerva</Text>
            <Text style={styles.text}>
              “Explora la ley de manera experta {'\n'} y con facilidad”
            </Text>
          </>
        );
      case 1:
        return (
          <>
            <FirstProgressImg width={297} height={320} style={{ marginBottom: 85 }} />
            <Text style={[styles.text, styles.firstProgressText]}>
              Encuentra servicios legales {'\n'} en una aplicación, con un proceso {'\n'} sencillo y con beneficios.
            </Text>
          </>
        );
      case 2:
        return (
          <>
            <SecondProgressImg width={297} height={259} style={{ marginBottom: 120 }} />
            <Text style={[styles.text, styles.secondProgressText]}>
              Entre el nombre de tu ciudad y el tipo de consultor {'\n'} que estás buscando. Nuestro agente de IA seleccionará {'\n'} el mejor candidato para su caso.
            </Text>
          </>
        );
      case 3:
        return (
          <>
            <View style={[styles.imageContainer, { marginBottom: 120}]}>
              <ThirdProgressBackground width={297} height={297} />
              <Image
                source={ThirdProgressImage}
                style={styles.thirdProgressImage}
              />
            </View>

            <Text style={[styles.text, styles.thirdProgressText]}>
              Elige los mejores abogados verificados {'\n'} en su área basado en sus calificaciones, {'\n'} experiencia y reseñas.
            </Text>
          </>
        );
        case 4: return <LoginOrSignUp />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.introContainer}>

      {getStepContent()}

      {step >= 1 && step <= BOX_COUNT && (
        <View style={styles.progressBarContainer}>
          {[...Array(BOX_COUNT)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i === BOX_COUNT - 1 && { marginRight: 0 },
                i === step - 1 && styles.activeSegment,
              ]}
            />
          ))}
        </View>
      )}

      {step < 4 && (
        <Animated.View style={[styles.animatedButton, { width: buttonWidth }]}>
          <TouchableOpacity style={styles.startButton} onPress={handlePress}>
            <Text style={styles.startButtonText}>
              {step < 1 ? 'Comenzar' : 'Siguiente'}
              {/* {step >= 1 ? <RightArrowIcon width={4} height={9}  /> : null} */}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: 297,
    height: 297,
  },
  thirdProgressImage: {
    position: 'absolute',
    top: 77,
    left: 26,
    width: 240,
    height: 220,
  },
  introContainer: {
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
  },
  firstProgressText: {
    color: '#000',
    marginBottom: 240,
    fontSize: 13,
    lineHeight: 21.128,
  },
  secondProgressText: {
    color: '#000',
    marginBottom: 220,
    fontSize: 13,
    lineHeight: 19.523,
  },
  thirdProgressText: {
    color: '#000',
    marginBottom: 220,
    fontSize: 13,
    lineHeight: 21.128,
  },
  animatedButton: {
    position: 'absolute',
    bottom: 110,
    height: 45,
    borderRadius: 64,
    overflow: 'hidden',
  },
  startButton: {
    flex: 1,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#174AC9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 12,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '600',
    textAlign: 'center',
    
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 230,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSegment: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    backgroundColor: '#ccc',
    marginRight: BOX_GAP,
    borderRadius: 1.5,
  },
  activeSegment: {
    backgroundColor: '#174AC9',
  },
});
