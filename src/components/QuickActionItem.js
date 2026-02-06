import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function QuickActionItem({ 
  action, 
  onPress, 
  onLongPress,
  onDeletePress,
  isSelected = false,
  closeDelete
}) {
  const { theme } = useTheme();
  
  const getIconName = (icon) => {
    const iconMap = {
      'navigate': 'navigation',
      'map': 'map',
      'chatbubble': 'message-text',
      'call': 'phone',
      'camera': 'camera',
      'image': 'image',
      'mail': 'mail',
      'document-text': 'file-document',
      'calendar': 'calendar',
      'musical-notes': 'music',
      'chatbox': 'chat'
    };
    return iconMap[icon] || 'cube-outline';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: action.color + '15',
          transform: [{ scale: isSelected ? 0.98 : 1 }]
        }
      ]}
      onPress={isSelected ? undefined : onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      {/* Transparent overlay when selected */}
      {isSelected && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeDelete}
          style={styles.selectionOverlay}
        />
      )}
      
      {/* Delete button (above overlay) - TAP TO DELETE IMMEDIATELY */}
      {isSelected && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeletePress}
          activeOpacity={0.8}
        >
          <View style={[styles.deleteButtonInner, { backgroundColor: theme.red }]}>
            <MaterialCommunityIcons name="minus" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
        <MaterialCommunityIcons name={getIconName(action.icon)} size={20} color="#fff" />
      </View>
      
      <Text 
        style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontMedium }]}
        numberOfLines={1}
      >
        {action.name}
      </Text>
      
      <Text 
        style={[styles.appName, { color: theme.textMuted, fontFamily: theme.fontRegular }]}
        numberOfLines={1}
      >
        {action.appName}
      </Text>
      
      {action.metadata?.favorite && (
        <View style={styles.favoriteBadge}>
          <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  }
});