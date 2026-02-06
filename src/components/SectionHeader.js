import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SectionHeader = ({ 
  title, 
  subtitle, 
  actionText, 
  onActionPress,
  disabled = false
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, { 
          color: theme.textPrimary, 
          fontFamily: theme.fontBold 
        }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.sectionSub, { 
            color: theme.textMuted, 
            fontFamily: theme.fontRegular 
          }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {actionText && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.showAllButton}
          disabled={disabled}
        >
          <Text style={[styles.showAllText, { 
            color: disabled ? theme.textMuted : theme.primary,
            fontFamily: theme.fontMedium 
          }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginTop: 16 
  },
  sectionTitle: { 
    fontSize: 22 
  },
  sectionSub: { 
    marginTop: 4, 
    fontSize: 14 
  },
  showAllButton: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 8 
  },
  showAllText: { 
    fontSize: 14 
  },
});

export default SectionHeader;