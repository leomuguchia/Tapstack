import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({ 
  icon = 'grid-outline', 
  title, 
  subtitle,
  primaryAction,
  secondaryAction
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name={icon} size={64} color={theme.textMuted} />
      <Text style={[styles.emptyStateTitle, { 
        color: theme.textPrimary, 
        fontFamily: theme.fontBold, 
        marginTop: 16 
      }]}>
        {title}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { 
        color: theme.textMuted, 
        fontFamily: theme.fontRegular, 
        marginTop: 8 
      }]}>
        {subtitle}
      </Text>
      
      <View style={styles.emptyStateButtons}>
        {primaryAction && (
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
            onPress={primaryAction.onPress}
          >
            <MaterialCommunityIcons name={primaryAction.icon || 'plus-circle'} size={20} color="#fff" />
            <Text style={[styles.emptyStateButtonText, { fontFamily: theme.fontMedium }]}>
              {primaryAction.text}
            </Text>
          </TouchableOpacity>
        )}
        
        {secondaryAction && (
          <TouchableOpacity
            style={[styles.emptyStateButton, { 
              backgroundColor: theme.bgCard, 
              borderColor: theme.borderPrimary 
            }]}
            onPress={secondaryAction.onPress}
          >
            <MaterialCommunityIcons name={secondaryAction.icon || 'flash'} size={20} color={theme.primary} />
            <Text style={[styles.emptyStateButtonText, { 
              color: theme.primary, 
              fontFamily: theme.fontMedium 
            }]}>
              {secondaryAction.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 60, 
    paddingHorizontal: 40 
  },
  emptyStateTitle: { 
    fontSize: 20, 
    textAlign: 'center' 
  },
  emptyStateSubtitle: { 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22,
    marginBottom: 24
  },
  emptyStateButtons: {
    gap: 12,
    width: '100%',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emptyStateButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default EmptyState;