// components/RecentItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function RecentlyRunItem({ 
  title, 
  time, 
  icon, 
  color,
  onPress,
  onRun 
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <TouchableOpacity 
        style={[styles.iconBox, { backgroundColor: color + '20' }]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={18} color={color} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.textWrap}
        onPress={onPress}
      >
        <Text style={[
          styles.title, 
          { 
            color: theme.textPrimary,
            fontFamily: theme.fontMedium 
          }
        ]}>
          {title}
        </Text>
        
        <Text style={[
          styles.time, 
          { 
            color: theme.textMuted,
            fontFamily: theme.fontRegular 
          }
        ]}>
          {time}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRun}>
        <Ionicons name="play-circle" size={24} color={color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
  time: {
    fontSize: 13,
    marginTop: 2,
  },
});