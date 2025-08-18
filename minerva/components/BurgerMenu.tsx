import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { responsive } from '../utils/responsive';

interface BurgerMenuProps {
  onPress: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.burgerButton} onPress={onPress}>
      <Ionicons 
        name="menu" 
        size={responsive.moderateScale(28)} 
        color="#174AC9" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  burgerButton: {
    position: 'absolute',
    top: responsive.verticalScale(50), // Adjusted for different screen sizes
    left: responsive.scale(20),
    zIndex: 1000,
    padding: responsive.scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: responsive.scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsive.verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: responsive.scale(3.84),
    elevation: 5,
  },
});

export default BurgerMenu;