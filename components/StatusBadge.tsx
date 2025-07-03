import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'urgent' | 'overdue';
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, text, size = 'medium' }: StatusBadgeProps) {
  const { colors } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: colors.info, backgroundColor: colors.info + '20' };
      case 'pending':
        return { color: colors.warning, backgroundColor: colors.warning + '20' };
      case 'completed':
        return { color: colors.success, backgroundColor: colors.success + '20' };
      case 'urgent':
        return { color: colors.error, backgroundColor: colors.error + '20' };
      case 'overdue':
        return { color: '#ffffff', backgroundColor: colors.error };
      default:
        return { color: colors.textSecondary, backgroundColor: colors.textSecondary + '20' };
    }
  };

  const config = getStatusConfig(status);
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
  };

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.backgroundColor },
      sizeStyles[size],
    ]}>
      <Text style={[
        styles.text,
        { color: config.color, fontSize: sizeStyles[size].fontSize },
      ]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});