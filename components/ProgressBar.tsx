import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color,
  height = 6,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const progressColor = color || colors.primary;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && (
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View style={[
        styles.track,
        { backgroundColor: colors.border, height }
      ]}>
        <View style={[
          styles.fill,
          {
            backgroundColor: progressColor,
            width: `${clampedProgress}%`,
            height,
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  percentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  track: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});