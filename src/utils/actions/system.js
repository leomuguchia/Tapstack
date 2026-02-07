// src/services/actions/systemActions.js
import { Share, Clipboard, Vibration, Alert } from 'react-native';

export const systemActions = {
  async executeClipboardCopy(parameters) {
    const { text } = parameters;
    
    if (!text) {
      throw new Error('Text is required for clipboard copy');
    }
    
    await Clipboard.setString(text);
    return { executed: true, textLength: text.length };
  },
  
  async executeShare(parameters) {
    const { title, message, url } = parameters;
    
    const content = {
      title: title || 'Shared from Tapstack',
      message: message || '',
    };
    
    if (url) {
      content.url = url;
    }
    
    await Share.share(content);
    return { executed: true };
  },
  
  async executeVibrate(parameters) {
    const { duration = 500, pattern } = parameters;
    
    if (pattern && Array.isArray(pattern)) {
      Vibration.vibrate(Number(duration));
    } else {
      Vibration.vibrate(duration);
    }
    
    return { executed: true, duration, usedPattern: !!pattern };
  },

  async executeDelay(parameters) {
    const { seconds = 2 } = parameters;
    const milliseconds = seconds * 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          executed: true, 
          message: `Delayed for ${seconds} seconds`,
          duration: seconds 
        });
      }, milliseconds);
    });
  },
  
  async executeShowNotification(parameters) {
    const { 
      title = 'Notification', 
      message = '', 
      sound = false,
      importance = 'default' 
    } = parameters;
    
    // Use Alert as a fallback for notifications
    Alert.alert(
      title,
      message || 'This is a notification from your shortcut.',
      [{ text: 'OK' }]
    );
    
    // If sound is requested, vibrate as feedback
    if (sound) {
      Vibration.vibrate(100);
    }
    
    return { 
      executed: true,
      title,
      message,
      sound,
      importance,
      note: 'Displayed as an alert. For true notifications, push notification setup is required.'
    };
  }
};