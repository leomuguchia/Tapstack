// src/services/actions/hardwareActions.js
import { Alert, Linking, Platform } from 'react-native';

export const hardwareActions = {
  async executeWifiToggle(parameters) {
    const { state = 'toggle' } = parameters;
    
    const messages = {
      on: {
        title: 'Turn WiFi On',
        description: 'This shortcut would turn WiFi on',
        instruction: 'To turn WiFi on, swipe down from the top of your screen and tap the WiFi icon, or go to Settings > Network & Internet > WiFi.'
      },
      off: {
        title: 'Turn WiFi Off', 
        description: 'This shortcut would turn WiFi off',
        instruction: 'To turn WiFi off, swipe down from the top of your screen and tap the WiFi icon, or go to Settings > Network & Internet > WiFi.'
      },
      toggle: {
        title: 'Toggle WiFi',
        description: 'This shortcut would toggle WiFi',
        instruction: 'To toggle WiFi, swipe down from the top of your screen and tap the WiFi icon.'
      }
    };
    
    const { title, description, instruction } = messages[state] || messages.toggle;
    
    Alert.alert(
      title,
      `${description}.\n\n${instruction}\n\nIn a future update with system permissions, this action will work automatically.`,
      [
        { text: 'OK' },
        { text: 'Open Settings', onPress: () => this.openWifiSettings() }
      ]
    );
    
    return { 
      executed: true,
      simulated: true,
      action: `WiFi ${state}`,
      instruction: instruction,
      platform: Platform.OS
    };
  },
  
  async executeDoNotDisturbToggle(parameters) {
    const { state = 'toggle' } = parameters;
    
    const messages = {
      on: {
        title: 'Enable Do Not Disturb',
        description: 'This shortcut would enable Do Not Disturb mode',
        instruction: Platform.OS === 'ios' 
          ? 'On iPhone: Swipe down from top-right corner, tap Focus, then select Do Not Disturb.'
          : 'On Android: Swipe down twice from top, tap Do Not Disturb icon, or go to Settings > Sound > Do Not Disturb.'
      },
      off: {
        title: 'Disable Do Not Disturb',
        description: 'This shortcut would disable Do Not Disturb mode',
        instruction: 'To disable Do Not Disturb, swipe down from top of screen and tap the Do Not Disturb icon.'
      },
      toggle: {
        title: 'Toggle Do Not Disturb',
        description: 'This shortcut would toggle Do Not Disturb mode',
        instruction: 'To toggle Do Not Disturb, swipe down from top of screen and tap the Do Not Disturb icon.'
      }
    };
    
    const { title, description, instruction } = messages[state] || messages.toggle;
    
    Alert.alert(
      title,
      `${description}.\n\n${instruction}\n\nThis action is simulated in the current version.`,
      [
        { text: 'OK' },
        { text: 'Learn More', onPress: () => this.openHelpArticle() }
      ]
    );
    
    return {
      executed: true,
      simulated: true,
      action: `Do Not Disturb ${state}`,
      instruction: instruction,
      platform: Platform.OS
    };
  },
  
  openWifiSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=WIFI');
    } else {
      Linking.openURL('android.settings.WIFI_SETTINGS');
    }
  },
  
  openHelpArticle() {
    Linking.openURL('https://support.google.com/android/answer/9079648?hl=en');
  }
};