import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from './theme';
import { emitError } from '../hooks/GlobalErrorHandler';

const ThemeContext = createContext();
const { SharedPreferencesModule } = NativeModules;

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState('system');
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setCurrentTheme(storedTheme);
          if (SharedPreferencesModule) {
            SharedPreferencesModule.setItem('theme', storedTheme); // Save to SharedPreferences
          }
        } else {
          setCurrentTheme('system');
        }
      } catch (error) {
        emitError('server', {
          title: "Theme Load Failed",
          message: `An error occurred while loading the theme: ${error.message || 'Unknown error'}`,
        });
        setCurrentTheme('light'); // Fallback to light theme
      } finally {
        setThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme) => {
    setCurrentTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
      if (SharedPreferencesModule) {
        SharedPreferencesModule.setItem('theme', newTheme); // Save to SharedPreferences
      }
    } catch (error) {
      emitError('server', {
        title: "Theme Save Failed",
        message: `An error occurred while saving the theme: ${error.message || 'Unknown error'}`,
      });
    }
  };

  const getSelectedTheme = () => {
    try {
      if (currentTheme === 'system') {
        return systemColorScheme === 'dark' ? theme.dark : theme.light;
      }
      return theme[currentTheme] || theme.light; // Fallback to light theme
    } catch (error) {
      emitError('server', {
        title: "Theme Selection Failed",
        message: `An error occurred while selecting the theme: ${error.message || 'Unknown error'}`,
      });
      return theme.light;
    }
  };

  const selectedTheme = getSelectedTheme();

  if (!themeLoaded) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme: selectedTheme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
