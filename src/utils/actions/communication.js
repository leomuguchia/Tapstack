// src/services/actions/communicationActions.js
import { Linking } from 'react-native';

export const communicationActions = {
  async executeSMS(parameters) {
    const { phoneNumber, message } = parameters;
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    
    const url = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('SMS is not supported on this device');
    }
    
    await Linking.openURL(url);
    return { executed: true };
  },
  
  async executeCall(parameters) {
    const { phoneNumber } = parameters;
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    
    const url = `tel:${phoneNumber}`;
    
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Phone calls are not supported on this device');
    }
    
    await Linking.openURL(url);
    return { executed: true };
  },
  
  async executeEmail(parameters) {
    const { to, subject, body } = parameters;
    
    let url = 'mailto:';
    if (to) url += to;
    
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Email is not supported on this device');
    }
    
    await Linking.openURL(url);
    return { executed: true };
  }
};