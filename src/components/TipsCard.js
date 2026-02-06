import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const TipsCard = ({ tip }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.tipsContainer, { 
      backgroundColor: theme.bgCard, 
      borderColor: theme.borderPrimary 
    }]}>
      <Ionicons name="information-circle" size={20} color={theme.primary} />
      <Text style={[styles.tipsText, { 
        color: theme.textPrimary, 
        fontFamily: theme.fontRegular 
      }]}>
        <Text style={{ fontFamily: theme.fontBold }}>Tip:</Text> {tip}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tipsContainer: { 
    marginTop: 24, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12 
  },
  tipsText: { 
    flex: 1, 
    fontSize: 14, 
    lineHeight: 20 
  },
});

export default TipsCard;