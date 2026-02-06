import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ColorPicker({ value, onChange, showCustom = true }) {
  const { theme } = useTheme();

  // Using theme colors consistently
  const colors = [
    theme.red || '#ef4444',
    theme.orange || '#f97316',
    theme.yellow || '#facc15', // Added yellow to theme context
    theme.green || '#22c55e',
    theme.blue || '#3b82f6',
    theme.purple || '#8b5cf6', // Added purple option
  ];

  return (
    <View style={styles.row}>
      {colors.map(color => (
        <TouchableOpacity
          key={color}
          onPress={() => onChange(color)}
          style={[
            styles.color,
            { backgroundColor: color },
            value === color && {
              ...styles.active,
              borderColor: theme.bgPrimary, // Dynamic border based on theme
            },
          ]}
        >
          {value === color && (
            <Ionicons 
              name="checkmark" 
              size={18} 
              color={theme.bgPrimary} 
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      ))}

      {showCustom && (
        <TouchableOpacity
          onPress={() => onChange(null)} // Or trigger custom color picker
          style={[styles.custom, { borderColor: theme.borderPrimary }]}
        >
          <Ionicons 
            name="color-palette-outline" 
            size={20} 
            color={theme.textMuted} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },
  color: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  active: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }], // Slight scaling effect for active state
  },
  checkIcon: {
    position: 'absolute',
  },
  custom: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});