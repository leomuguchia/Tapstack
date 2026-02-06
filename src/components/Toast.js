import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Toast = ({ message, type = 'info', duration = 3000, onHide }) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const toastConfig = {
    error: {
      icon: 'alert-circle',
      bgColor: theme.red + '20',
      borderColor: theme.red,
      iconColor: theme.red
    },
    warning: {
      icon: 'warning',
      bgColor: theme.orange + '20',
      borderColor: theme.orange,
      iconColor: theme.orange
    },
    success: {
      icon: 'checkmark-circle',
      bgColor: theme.green + '20',
      borderColor: theme.green,
      iconColor: theme.green
    },
    info: {
      icon: 'information-circle',
      bgColor: theme.bgCard,
      borderColor: theme.primary,
      iconColor: theme.primary
    },
    delete: {
      icon: 'trash',
      bgColor: theme.red + '10',
      borderColor: theme.red,
      iconColor: theme.red
    }
  };

  const config = toastConfig[type] || toastConfig.info;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bgColor,
          borderLeftColor: config.borderColor,
          transform: [{ translateY }],
          opacity,
        }
      ]}
    >
      <Ionicons 
        name={config.icon}
        size={20} 
        color={config.iconColor} 
      />
      <Text style={[styles.toastText, { 
        color: theme.textPrimary, 
        fontFamily: theme.fontRegular 
      }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
});

export default Toast;