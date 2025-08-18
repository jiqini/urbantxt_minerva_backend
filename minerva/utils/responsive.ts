import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone reference)
const baseWidth = 375;
const baseHeight = 812;

export const responsive = {
  // Scale based on screen width
  scale: (size: number) => (screenWidth / baseWidth) * size,
  
  // Scale based on screen height  
  verticalScale: (size: number) => (screenHeight / baseHeight) * size,
  
  // Moderate scale (less aggressive scaling)
  moderateScale: (size: number, factor = 0.5) => {
    return size + (responsive.scale(size) - size) * factor;
  },
  
  // Screen dimensions
  screenWidth,
  screenHeight,
  
  // Safe area helpers
  isSmallDevice: screenHeight < 700,
  isLargeDevice: screenHeight > 900,
};