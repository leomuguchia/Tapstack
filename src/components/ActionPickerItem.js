import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ActionPickerItem({
  title,
  description,
  icon,
  color,
  onPress,
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: theme.bgCard },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: color },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color="#fff" />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontMedium }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.desc,
            { color: theme.textSecondary, fontFamily: theme.fontRegular },
          ]}
        >
          {description}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-forward"
        size={18}
        color={theme.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  text: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  desc: {
    fontSize: 13,
    marginTop: 2,
  },
});
