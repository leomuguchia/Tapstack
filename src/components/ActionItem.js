import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ActionItem({
  title,
  subtitle,
  icon,
  color,
  onLongPress,
  isActive,
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={onLongPress}
      delayLongPress={200}
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          opacity: isActive ? 0.9 : 1,
          transform: [{ scale: isActive ? 1.02 : 1 }],
        },
      ]}
    >
      <Ionicons
        name="reorder-two"
        size={20}
        color={theme.textMuted}
        style={{ marginRight: 10 }}
      />

      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontMedium }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity>
        <Ionicons
          name="remove-circle"
          size={22}
          color={theme.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
