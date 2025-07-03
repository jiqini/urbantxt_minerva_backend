import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  gradient?: string[];
  icon?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  elevated?: boolean;
  borderless?: boolean;
}

export function EnhancedCard({
  title,
  subtitle,
  children,
  onPress,
  gradient,
  icon,
  style,
  titleStyle,
  subtitleStyle,
  elevated = true,
  borderless = false,
}: EnhancedCardProps) {
  const { colors } = useTheme();

  const CardComponent = onPress ? TouchableOpacity : View;

  const cardContent = (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: borderless ? 'transparent' : colors.border,
        borderWidth: borderless ? 0 : 1,
      },
      elevated && styles.elevated,
      style,
    ]}>
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            {title && (
              <Text style={[styles.title, { color: colors.text }, titleStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }, subtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );

  if (gradient) {
    return (
      <CardComponent onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
        <LinearGradient colors={gradient} style={[styles.gradientCard, style]}>
          {cardContent}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      {cardContent}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
});