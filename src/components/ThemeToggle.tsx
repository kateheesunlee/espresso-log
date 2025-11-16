import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useColors } from '../themes/colors';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 24
}) => {
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.container, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={theme === 'dark' ? 'sunny' : 'moon'}
        size={size}
        color={colors.primary}
      />
      {showLabel && (
        <Text style={[styles.label, { color: colors.text }]}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
